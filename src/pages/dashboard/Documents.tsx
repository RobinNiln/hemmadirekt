import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, Download, Eye, Home, Building2, Sparkles } from 'lucide-react'
import { Button, Card, Drawer, PageHeader, ProgressBar, cn } from '../../components/ui'
import { DocStatusBadge, DocStatusIcon, STATUS_LEGEND } from '../../components/DocStatus'
import { DocDetail } from '../../components/DocDetail'
import { ContractDocument } from '../../components/ContractDocument'
import { useSale } from '../../state/SaleContext'
import { PHASES, buildDocs, countsTowardTotal, isSignedContract, nextStep, type DocId, type DocItem, type Phase } from '../../lib/docRegistry'
import { contractData, documentText, downloadText } from '../../lib/documents'

export default function Documents() {
  const { state, dispatch, acceptedBid, highestBid } = useSale()
  const [params, setParams] = useSearchParams()
  const openId = params.get('doc') as DocId | null
  const [toggled, setToggled] = useState<Phase[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const docs = useMemo(() => buildDocs(state, acceptedBid), [state, acceptedBid])
  const required = docs.filter(countsTowardTotal)
  const doneCount = required.filter((d) => d.status.kind === 'done').length
  const next = nextStep(state, acceptedBid, highestBid)
  const brf = state.property.kind === 'brf'

  // Aktuell fas = första fasen där något obligatoriskt dokument inte är klart.
  const phaseDone = (p: Phase) => docs.filter((d) => d.phase === p && countsTowardTotal(d)).every((d) => d.status.kind === 'done')
  const currentPhase = PHASES.find((p) => !phaseDone(p.id))?.id ?? null
  const isOpen = (p: Phase) => (toggled.includes(p) ? p !== currentPhase : p === currentPhase)
  const toggle = (p: Phase) => setToggled((t) => (t.includes(p) ? t.filter((x) => x !== p) : [...t, p]))

  const openDoc = (id: DocId) => {
    setShowPreview(false)
    setParams({ doc: id })
  }
  const close = () => setParams({})
  const current = docs.find((d) => d.id === openId) ?? null
  const filename = (d: DocItem) => `${d.name.replace(/\s+/g, '-').toLowerCase()}-DEMO.txt`
  const nextIsHere = next.to.startsWith('/min-forsaljning/dokument?doc=')

  return (
    <div className="space-y-6">
      <PageHeader title="Dokument" subtitle="Vi håller koll på vilka handlingar som behövs under hela bostadsaffären. Här ser du vad som är klart, vad som återstår och vad du behöver göra härnäst." />

      {/* ÖVERSIKT + NÄSTA STEG */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-6">
          <p className="text-sm text-ink-muted">Dokument</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">
            {doneCount} av {required.length} <span className="text-lg font-semibold text-ink-muted">klara</span>
          </p>
          <ProgressBar value={(doneCount / required.length) * 100} className="mt-4" />
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
            {STATUS_LEGEND.map((l) => (
              <li key={l.kind} className="text-xs text-ink-muted">
                <DocStatusBadge kind={l.kind} label={l.label} className="scale-90" />
              </li>
            ))}
          </ul>
        </Card>
        <div className="flex flex-col justify-between rounded-2xl bg-petrol-800 p-6 text-white shadow-card">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-mint-200">
              <Sparkles className="h-4 w-4" /> Nästa steg
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">{next.title}</h2>
            <p className="mt-1.5 text-petrol-100">{next.text}</p>
          </div>
          <div className="mt-5">
            {nextIsHere ? (
              <Button variant="accent" size="lg" onClick={() => openDoc(next.to.split('doc=')[1] as DocId)}>
                {next.cta} <ArrowRight className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="accent" size="lg" to={next.to}>
                {next.cta} <ArrowRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* BOSTADSTYP (demo) */}
      <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-amber-900">
          <span className="font-bold">Demo:</span> dokumenten anpassas efter bostadstyp. Byt för att se skillnaden.
        </p>
        <div className="flex rounded-xl bg-white p-1 ring-1 ring-amber-200">
          {(
            [
              ['brf', 'Bostadsrätt', Building2],
              ['villa', 'Villa / fastighet', Home],
            ] as const
          ).map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => dispatch({ type: 'SET_KIND', kind: k })}
              disabled={isSignedContract(state)}
              className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50', state.property.kind === k ? 'bg-petrol-700 text-white' : 'text-ink-soft hover:bg-sand-100')}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* FASER SOM TIDSLINJE */}
      <ol className="relative">
        <span className="absolute bottom-8 left-[19px] top-8 w-0.5 bg-sand-300" aria-hidden />
        {PHASES.map((ph) => {
          const list = docs.filter((d) => d.phase === ph.id)
          if (!list.length) return null
          const req = list.filter(countsTowardTotal)
          const done = req.filter((d) => d.status.kind === 'done').length
          const complete = phaseDone(ph.id)
          const isCurrent = ph.id === currentPhase
          const open = isOpen(ph.id)
          const attention = list.some((d) => d.status.kind === 'action')
          return (
            <li key={ph.id} className="relative pb-5 pl-14 last:pb-0">
              <span
                className={cn(
                  'absolute left-0 top-4 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-sand-100',
                  complete ? 'bg-petrol-700 text-white' : isCurrent ? 'bg-white text-petrol-700 ring-petrol-200' : 'bg-sand-200 text-ink-faint',
                )}
              >
                {complete ? <Check className="h-5 w-5" strokeWidth={3} /> : <span className={cn('h-3 w-3 rounded-full', isCurrent ? 'bg-petrol-600' : 'bg-ink-faint/50')} />}
              </span>
              <Card className={cn('overflow-hidden', isCurrent && 'ring-2 ring-petrol-200')}>
                <button onClick={() => toggle(ph.id)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-sand-50" aria-expanded={open}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold">{ph.label}</h2>
                      {isCurrent && <span className="rounded-full bg-petrol-700 px-2 py-0.5 text-[11px] font-bold text-white">Nu</span>}
                      {attention && !isCurrent && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">Kräver åtgärd</span>}
                    </div>
                    <p className="text-sm text-ink-muted">{ph.text}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold text-ink-soft">
                      {done}/{req.length}
                    </span>
                    <ChevronDown className={cn('h-5 w-5 text-ink-muted transition', open && 'rotate-180')} />
                  </div>
                </button>
                {open && (
                  <div className="grid gap-3 border-t border-sand-200 bg-sand-50/60 p-4 md:grid-cols-2 animate-fade">
                    {list.map((d) => (
                      <DocCard key={d.id} doc={d} highlight={next.to.endsWith(`doc=${d.id}`)} onOpen={() => openDoc(d.id)} />
                    ))}
                  </div>
                )}
              </Card>
            </li>
          )
        })}
      </ol>

      {/* SIDOPANEL */}
      <Drawer
        open={!!current}
        onClose={close}
        title={current?.name}
        subtitle={current && <DocStatusBadge kind={current.status.kind} label={current.status.label} />}
        footer={
          current?.status.kind === 'done' && (
            <>
              <Button variant="secondary" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="h-4 w-4" /> {showPreview ? 'Dölj dokument' : 'Visa dokument'}
              </Button>
              <Button variant="ghost" onClick={() => downloadText(filename(current), documentText(current.id, state, acceptedBid))}>
                <Download className="h-4 w-4" /> Ladda ner
              </Button>
            </>
          )
        }
      >
        {current && (
          <>
            {showPreview && current.status.kind === 'done' && (
              <div className="mb-6">
                {current.id === 'avtal' ? (
                  <ContractDocument data={contractData(state, acceptedBid)} signed={{ seller: state.contract.signedBySeller, buyer: state.contract.signedByBuyer }} />
                ) : (
                  <pre className="whitespace-pre-wrap rounded-xl bg-white p-5 font-mono text-[12.5px] leading-relaxed text-ink-soft ring-1 ring-sand-300/70">{documentText(current.id, state, acceptedBid)}</pre>
                )}
              </div>
            )}
            <DocDetail doc={current} />
          </>
        )}
      </Drawer>
      <p className="text-xs text-ink-muted">{brf ? 'Visar dokument för bostadsrätt.' : 'Visar dokument för villa/fastighet.'} Alla dokument är demo och inte juridiskt material.</p>
    </div>
  )
}

function DocCard({ doc, onOpen, highlight }: { doc: DocItem; onOpen: () => void; highlight?: boolean }) {
  const cta: Record<string, string> = { done: 'Visa', action: 'Åtgärda', progress: 'Fortsätt', waiting: 'Se status', todo: 'Läs mer', na: 'Läs mer' }
  return (
    <button
      onClick={onOpen}
      className={cn(
        'group flex flex-col rounded-2xl bg-white p-4 text-left ring-1 transition hover:-translate-y-0.5 hover:shadow-card',
        highlight ? 'ring-2 ring-petrol-500' : 'ring-sand-300/70',
        doc.status.kind === 'na' && 'opacity-70',
      )}
    >
      <div className="flex items-start gap-3">
        <DocStatusIcon kind={doc.status.kind} />
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-snug">
            {doc.name}
            {doc.optional && <span className="ml-1.5 text-xs font-medium text-ink-faint">valfritt</span>}
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">{doc.short}</p>
        </div>
      </div>
      <div className="mt-3">
        <DocStatusBadge kind={doc.status.kind} label={doc.status.label} />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-sand-100 pt-3 text-xs">
        <span className="text-ink-muted">
          <span className="font-semibold text-ink-soft">Ansvar:</span> {doc.responsible}
        </span>
        <span className="flex items-center gap-1 font-semibold text-petrol-700 group-hover:underline">
          {cta[doc.status.kind]} <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  )
}
