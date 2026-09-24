import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarDays, FileSignature, KeyRound, Lock, PartyPopper } from 'lucide-react'
import { Button, Card, CheckboxRow, Modal, PageHeader, ProgressBar } from '../../components/ui'
import { DocStatusBadge, DocStatusIcon } from '../../components/DocStatus'
import { useSale } from '../../state/SaleContext'
import { buildDocs, daysUntil, isSignedContract } from '../../lib/docRegistry'
import { settlementTotals } from '../../lib/documents'
import { formatDateShort, formatSEK } from '../../lib/format'
import { EmptyPanel } from './DashboardLayout'

const PREP = [
  { key: 'meter', label: 'Läs av el- och vattenmätare', hint: 'Skicka mätarställningarna till köparen och elbolaget.' },
  { key: 'clean', label: 'Flyttstäda bostaden', hint: 'Bostaden ska lämnas väl städad.' },
  { key: 'keys', label: 'Samla alla nycklar och taggar', hint: 'Även förrådsnycklar, porttaggar och koder.' },
  { key: 'manuals', label: 'Lägg fram manualer och kvitton', hint: 'Vitvaror, garantier och renoveringsunderlag.' },
]

export default function Closing() {
  const { state, dispatch, acceptedBid } = useSale()
  const navigate = useNavigate()
  const [prepOpen, setPrepOpen] = useState(false)
  const [checked, setChecked] = useState<string[]>([])
  const c = state.closing
  const d = state.docs
  const brf = state.property.kind === 'brf'

  if (!isSignedContract(state)) {
    return (
      <div className="space-y-6">
        <PageHeader title="Tillträde" />
        <EmptyPanel icon={<KeyRound className="h-7 w-7" />} title="Tillträdet planeras när avtalet är signerat" text="När både du och köparen har signerat avtalet får du en checklista för allt som ska göras fram till överlämningen.">
          <Button to="/min-forsaljning/avtal">
            <FileSignature className="h-4 w-4" /> Till avtalet
          </Button>
        </EmptyPanel>
      </div>
    )
  }

  // Innan tillträdet måste dessa vara klara.
  const prereqs = [
    { label: 'Handpenning registrerad', done: d.deposit.registered, doc: 'handpenning' },
    ...(brf ? [{ label: 'Köparen godkänd av föreningen', done: d.membership.approved, doc: 'medlem' }] : []),
    { label: 'Likvidavräkning skapad', done: d.settlement.created, doc: 'likvid' },
  ]
  const ready = prereqs.every((p) => p.done)
  const docs = buildDocs(state, acceptedBid).filter((x) => ['likvid', 'slutbetalning', 'nycklar', 'kopebrev'].includes(x.id))
  const steps = [
    { key: 'finalPayment' as const, label: 'Slutbetalning mottagen', hint: `${formatSEK(settlementTotals(state).remaining)} enligt likvidavräkningen` },
    { key: 'keysHandedOver' as const, label: 'Nycklar överlämnade', hint: 'Alla nycklar, taggar och koder' },
    { key: 'buyerMovedIn' as const, label: 'Köparen har tillträtt bostaden', hint: 'Från och med nu är det köparens bostad' },
  ]
  const doneSteps = steps.filter((s) => c[s.key]).length
  const days = daysUntil(state.contract.accessDate)

  return (
    <div className="space-y-6">
      {c.completed && (
        <Card className="overflow-hidden animate-pop">
          <div className="bg-petrol-800 p-8 text-center text-white sm:p-12">
            <PartyPopper className="mx-auto h-14 w-14 text-mint-300" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Affären är genomförd</h2>
            <p className="mx-auto mt-2 max-w-md text-petrol-100">
              {acceptedBid?.bidderName} har tillträtt {state.property.street}. Alla dokument är sparade i ditt arkiv.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button to="/min-forsaljning/dokument" variant="accent" size="lg">
                Se alla dokument
              </Button>
              {!brf && !d.titlePrepared && (
                <Button to="/min-forsaljning/dokument?doc=lagfart" variant="secondary" size="lg">
                  Köparen: ansök om lagfart
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      <PageHeader eyebrow="Nästa steg" title="Tillträde" subtitle="Här ser du allt som ska hända fram till att nycklarna lämnas över." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-petrol-700 text-white">
                <CalendarDays className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm text-ink-muted">Tillträdesdag</p>
                <p className="text-3xl font-bold tracking-tight">{formatDateShort(state.contract.accessDate)}</p>
                {!c.completed && days > 0 && <p className="text-sm text-ink-muted">om {days} dagar</p>}
              </div>
            </div>
            {!c.completed && (
              <Button variant="secondary" full className="mt-5" onClick={() => setPrepOpen(true)}>
                <KeyRound className="h-4 w-4" /> {c.prepared ? 'Förberedelser klara ✓' : 'Förbered tillträdet'}
              </Button>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-bold">Innan tillträdet</h2>
            <ul className="mt-3 space-y-2">
              {prereqs.map((p) => (
                <li key={p.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className={p.done ? 'text-ink' : 'text-ink-muted'}>{p.label}</span>
                  {p.done ? (
                    <DocStatusBadge kind="done" label="Klar" />
                  ) : (
                    <button onClick={() => navigate(`/min-forsaljning/dokument?doc=${p.doc}`)} className="text-xs font-semibold text-petrol-700 hover:underline">
                      Åtgärda →
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">På tillträdesdagen</h2>
              <span className="text-sm text-ink-muted">
                {doneSteps} av {steps.length}
              </span>
            </div>
            <ProgressBar value={(doneSteps / steps.length) * 100} className="mt-3" />
            {!ready && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-sand-100 px-4 py-3 text-sm text-ink-muted">
                <Lock className="mt-0.5 h-4 w-4 shrink-0" /> Bocka av punkterna under "Innan tillträdet" först.
              </p>
            )}
            <div className="mt-4 space-y-2">
              {steps.map((s, i) => (
                <CheckboxRow
                  key={s.key}
                  checked={c[s.key]}
                  onChange={(v) => {
                    if (!ready) return
                    // Punkterna bockas av i ordning.
                    if (v && i > 0 && !c[steps[i - 1].key]) return
                    dispatch({ type: 'CLOSING_PATCH', patch: { [s.key]: v } })
                    if (v && i === steps.length - 1) dispatch({ type: 'NOTIFY', text: 'Affären är genomförd. Grattis!', link: '/min-forsaljning/tilltrade' })
                  }}
                  label={s.label}
                  hint={s.hint}
                />
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-bold">Dokument för tillträdet</h2>
            <ul className="mt-3 space-y-2">
              {docs.map((x) => (
                <li key={x.id}>
                  <button onClick={() => navigate(`/min-forsaljning/dokument?doc=${x.id}`)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-sand-100">
                    <DocStatusIcon kind={x.status.kind} />
                    <span className="flex-1 font-medium">{x.name}</span>
                    <DocStatusBadge kind={x.status.kind} label={x.status.label} className="hidden sm:inline-flex" />
                    <ArrowRight className="h-4 w-4 text-ink-faint" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Modal
        open={prepOpen}
        onClose={() => setPrepOpen(false)}
        title="Förbered tillträdet"
        footer={
          <Button
            disabled={!c.prepared && checked.length < PREP.length}
            onClick={() => {
              dispatch({ type: 'CLOSING_PATCH', patch: { prepared: true } })
              setPrepOpen(false)
            }}
          >
            Klart – jag är redo
          </Button>
        }
      >
        <p className="mb-4 text-ink-muted">Det här brukar du behöva göra veckan före tillträdet.</p>
        <div className="space-y-2">
          {PREP.map((p) => (
            <CheckboxRow key={p.key} checked={checked.includes(p.key) || c.prepared} onChange={(v) => setChecked(v ? [...checked, p.key] : checked.filter((k) => k !== p.key))} label={p.label} hint={p.hint} />
          ))}
        </div>
      </Modal>
    </div>
  )
}
