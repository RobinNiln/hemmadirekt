import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BadgeCheck, CalendarDays, CheckCircle2, Gavel, Info, Landmark, TrendingUp } from 'lucide-react'
import { Badge, Button, Card, Modal, PageHeader, Spinner, cn } from '../../components/ui'
import { DemoPanel } from '../../components/DemoPanel'
import { useSale } from '../../state/SaleContext'
import { formatDateShort, formatSEK } from '../../lib/format'
import type { Bid } from '../../state/types'
import { EmptyPanel } from './DashboardLayout'

export default function Bidding() {
  const { state, dispatch, highestBid, acceptedBid, biddingRunning } = useSale()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Bid | null>(null)

  const bidderInfo = (b: Bid) => {
    const i = state.interested.find((x) => x.id === b.bidderId)
    return { verified: true, loanPromise: i ? i.loanPromise : b.bidderId === 'direct-buyer' }
  }

  // Buden ligger redan i den ordning de kom in.
  const chrono = state.bids

  if (!state.bids.length) {
    return (
      <div className="space-y-6">
        <PageHeader title="Budgivning" />
        <EmptyPanel
          icon={biddingRunning ? <Spinner className="h-7 w-7" /> : <Gavel className="h-7 w-7" />}
          title={biddingRunning ? 'Budgivningen har startat…' : 'Inga bud än'}
          text="Bud från verifierade köpare visas här direkt, med tid och budgivare. Du bestämmer själv när och om du vill acceptera ett bud."
        />
        <DemoPanel />
      </div>
    )
  }

  const top = highestBid!
  const topInfo = bidderInfo(top)
  const aboveAsking = top.amount - state.property.askingPrice

  return (
    <div className="space-y-6">
      <PageHeader title="Budgivning" subtitle="Alla bud är lagda av BankID-verifierade köpare. Du väljer själv vilket bud du vill gå vidare med." />

      {acceptedBid && (
        <div className="flex flex-col gap-4 rounded-2xl bg-mint-100 p-5 ring-1 ring-mint-300 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-petrol-700" />
            <div>
              <p className="font-bold text-petrol-900">Du har accepterat budet från {acceptedBid.bidderName}</p>
              <p className="text-sm text-petrol-800">
                {formatSEK(acceptedBid.amount)} · Budgivningen är avslutad.
              </p>
            </div>
          </div>
          <Button to="/min-forsaljning/avtal">
            Till avtalet <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* HÖGSTA BUD */}
        <Card className="overflow-hidden">
          <div className="bg-petrol-800 p-6 text-white sm:p-8">
            <p className="text-sm text-petrol-200">Nuvarande högsta bud</p>
            <p key={top.id} className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl animate-pop">
              {formatSEK(top.amount)}
            </p>
            <p className="mt-2 text-petrol-100">
              {top.bidderName} · {top.time}
            </p>
            {aboveAsking > 0 && (
              <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-mint-200">
                <TrendingUp className="h-4 w-4" /> {formatSEK(aboveAsking)} över utgångspris
              </p>
            )}
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-lg font-bold">{top.bidderName}</p>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-petrol-600" /> BankID-verifierad
              </li>
              <li className={cn('flex items-center gap-2', !topInfo.loanPromise && 'text-ink-muted')}>
                <Landmark className={cn('h-5 w-5', topInfo.loanPromise ? 'text-petrol-600' : 'text-ink-faint')} />
                {topInfo.loanPromise ? 'Lånelöfte registrerat' : 'Inget lånelöfte registrerat'}
              </li>
              <li className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-petrol-600" /> Önskat tillträde: <span className="font-semibold">{formatDateShort(top.desiredAccess)}</span>
              </li>
            </ul>
            {!acceptedBid && (
              <Button size="lg" full className="mt-6" onClick={() => setSelected(top)} disabled={biddingRunning}>
                Acceptera bud
              </Button>
            )}
            {biddingRunning && <p className="mt-2 text-center text-xs text-ink-muted">Budgivningen pågår…</p>}
          </div>
        </Card>

        {/* HISTORIK */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Budhistorik</h2>
            <Badge>{state.bids.length} bud</Badge>
          </div>
          <ol className="mt-4 space-y-2">
            {[...chrono].reverse().map((b) => {
              const isTop = b.id === top.id
              const isAccepted = b.id === acceptedBid?.id
              return (
                <li key={b.id} className={cn('flex items-center justify-between gap-3 rounded-xl px-4 py-3 animate-rise', isTop ? 'bg-mint-100/70 ring-1 ring-mint-300' : 'bg-sand-100')}>
                  <div>
                    <p className="font-bold">{formatSEK(b.amount)}</p>
                    <p className="text-sm text-ink-muted">{b.bidderName.split(' ')[0]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-ink-muted">{b.time}</p>
                    {isAccepted ? (
                      <Badge tone="petrol">Accepterat</Badge>
                    ) : isTop ? (
                      <Badge tone="green">Högst</Badge>
                    ) : (
                      !acceptedBid && (
                        <button onClick={() => setSelected(b)} className="text-xs font-semibold text-petrol-700 hover:underline">
                          Välj detta bud
                        </button>
                      )
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
          <p className="mt-4 flex items-start gap-2 text-xs text-ink-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Budhistoriken sparas och kan laddas ner under Dokument. Du behöver inte välja det högsta budet.
          </p>
        </Card>
      </div>

      <DemoPanel />

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Vill du gå vidare med ${selected.bidderName.split(' ')[0]}?` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Inte än
            </Button>
            <Button
              onClick={() => {
                if (!selected) return
                dispatch({ type: 'ACCEPT_BID', bidId: selected.id })
                setSelected(null)
                navigate('/min-forsaljning/avtal')
              }}
            >
              Gå vidare till avtal <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        }
      >
        {selected && (
          <div>
            <dl className="grid grid-cols-2 gap-4 rounded-xl bg-sand-100 p-5">
              <div>
                <dt className="text-sm text-ink-muted">Bud</dt>
                <dd className="text-xl font-bold">{formatSEK(selected.amount)}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">Tillträde</dt>
                <dd className="text-xl font-bold">{formatDateShort(selected.desiredAccess)}</dd>
              </div>
            </dl>
            <p className="mt-5 leading-relaxed text-ink-soft">
              Att acceptera budet innebär inte att bostadsaffären är juridiskt genomförd. Nästa steg är att skapa överlåtelseavtalet.
            </p>
            {selected.id !== top.id && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">Obs: det här är inte det högsta budet. Det är helt okej – du väljer själv köpare.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
