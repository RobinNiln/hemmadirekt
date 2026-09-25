import { useState } from 'react'
import { ArrowRight, BadgeCheck, CalendarDays, Check, Clock, FileSignature, Info, Landmark, ListChecks, MessageSquare, Send, Spline, X } from 'lucide-react'
import { Badge, Button, Card, Checklist, Drawer, Modal, PageHeader, Spinner, Textarea, cn } from '../../components/ui'
import { DemoPanel } from '../../components/DemoPanel'
import { BINDING_NOTE, accessText, conditionsText } from '../../components/PurchaseRequest'
import { useSale } from '../../state/SaleContext'
import { FINANCING_LABEL } from '../../state/presets'
import { formatDateShort, formatSEK } from '../../lib/format'
import type { Bid, RequestStatus } from '../../state/types'
import { EmptyPanel } from './DashboardLayout'

// ---------------------------------------------------------------------------
// Säljarens vy: köpförfrågningar (accepterar fast pris) och andra erbjudanden.
// Ersätter den traditionella budgivningen. Säljaren väljer själv köpare.
// ---------------------------------------------------------------------------

const first = (b: Bid) => b.bidderName.split(' ')[0]

const STATUS_TONE: Record<RequestStatus, 'neutral' | 'amber' | 'green' | 'blue'> = {
  Skickad: 'blue',
  'Under granskning': 'amber',
  'Accepterad för fortsatt process': 'green',
  Avböjd: 'neutral',
  Tillbakadragen: 'neutral',
}

export default function Requests() {
  const { state, dispatch, acceptedBid, biddingRunning } = useSale()
  const [openId, setOpenId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<Bid | null>(null)

  const all = state.bids // redan i den ordning de kom in
  const active = all.filter((b) => b.status !== 'Tillbakadragen' && b.status !== 'Avböjd')
  const accepts = active.filter((b) => b.kind === 'accept')
  const offers = active.filter((b) => b.kind === 'offer')
  const open = all.find((b) => b.id === openId) ?? null

  const review = (b: Bid) => {
    if (b.status === 'Skickad') dispatch({ type: 'SET_BID_STATUS', bidId: b.id, status: 'Under granskning' })
    setOpenId(b.id)
  }

  if (!all.length) {
    return (
      <div className="space-y-6">
        <PageHeader title="Köpförfrågningar" />
        <EmptyPanel
          icon={biddingRunning ? <Spinner className="h-7 w-7" /> : <ListChecks className="h-7 w-7" />}
          title={biddingRunning ? 'Förfrågningar kommer in…' : 'Inga köpförfrågningar än'}
          text="När en köpare vill köpa till ditt pris – eller lämnar ett annat erbjudande – visas det här med tidsstämpel. Du jämför och väljer själv vem du går vidare med."
        />
        <DemoPanel />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Köpförfrågningar"
        subtitle={acceptedBid ? 'Du har valt köpare. Övriga förfrågningar ligger kvar som reserv.' : 'Jämför köparnas förutsättningar och välj vem du vill gå vidare med.'}
      />

      {acceptedBid && <DealCard bid={acceptedBid} />}

      {/* Sammanfattning */}
      {!acceptedBid && (
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl bg-petrol-800 p-6 text-white shadow-card">
            <p className="text-sm text-petrol-200">Fast pris {formatSEK(state.property.askingPrice)}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {accepts.length} {accepts.length === 1 ? 'köpare vill' : 'köpare vill'} köpa till ditt pris
            </p>
            {offers.length > 0 && (
              <p className="mt-1 text-petrol-100">
                + {offers.length} {offers.length === 1 ? 'annat erbjudande' : 'andra erbjudanden'}
              </p>
            )}
          </div>
          <Card className="flex items-start gap-3 p-5">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-petrol-600" />
            <p className="text-sm text-ink-soft">
              Förfrågningarna visas i den ordning de kom in. <strong>Tidsordningen betyder inte att den första köparen har rätt till bostaden</strong> – du väljer själv vem du går vidare med.
            </p>
          </Card>
        </div>
      )}

      {/* Jämförelsevy (desktop) */}
      <Card className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-[15px]">
          <thead>
            <tr className="border-b border-sand-200">
              <th className="w-40 px-5 py-4 text-sm font-semibold text-ink-muted">Jämför</th>
              {all.map((b) => (
                <th key={b.id} className={cn('px-5 py-4', inactive(b) && 'opacity-50')}>
                  <p className="font-bold">{b.bidderName}</p>
                  <p className="flex items-center gap-1 text-xs font-medium text-petrol-700">
                    <BadgeCheck className="h-3.5 w-3.5" /> Identitet verifierad
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            <Row label="Pris" cells={all.map((b) => <span className={cn('font-bold', inactive(b) && 'opacity-50')}>{formatSEK(b.amount)}</span>)} />
            <Row label="Typ" cells={all.map((b) => <KindBadge b={b} />)} />
            <Row label="Finansiering" cells={all.map((b) => <span className={cn(inactive(b) && 'opacity-50')}>{FINANCING_LABEL[b.financing.type]}</span>)} />
            <Row label="Tillträde" cells={all.map((b) => <span className={cn(inactive(b) && 'opacity-50')}>{accessText(b)}</span>)} />
            <Row label="Villkor" cells={all.map((b) => <span className={cn(inactive(b) && 'opacity-50')}>{conditionsText(b)}</span>)} />
            <Row label="Skickad" cells={all.map((b) => <span className="flex items-center gap-1 text-ink-muted"><Clock className="h-3.5 w-3.5" /> {b.time}</span>)} />
            <Row label="Status" cells={all.map((b) => <Badge tone={STATUS_TONE[b.status]}>{statusLabel(b, acceptedBid)}</Badge>)} />
            <tr>
              <td className="px-5 py-4" />
              {all.map((b) => (
                <td key={b.id} className="px-5 py-4">
                  <Button size="sm" variant={b.id === acceptedBid?.id ? 'primary' : 'secondary'} onClick={() => review(b)} disabled={b.status === 'Tillbakadragen'}>
                    Granska
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Card>

      {/* Kort (mobil + översikt per typ) */}
      <div className="grid gap-4 md:hidden">
        {all.map((b) => (
          <RequestCard key={b.id} b={b} accepted={acceptedBid} onReview={() => review(b)} />
        ))}
      </div>

      <p className="text-xs text-ink-muted">{BINDING_NOTE} Ordningen ovan är tidsordning och innebär ingen rangordning av köparna.</p>

      {!acceptedBid && <DemoPanel />}

      {/* Granska köpare */}
      <Drawer
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open ? (open.kind === 'accept' ? `${first(open)} vill köpa till ditt pris` : `${first(open)} lämnar ett erbjudande`) : ''}
        subtitle={open && <Badge tone={STATUS_TONE[open.status]}>{statusLabel(open, acceptedBid)}</Badge>}
      >
        {open && <Review b={open} onGo={() => setConfirm(open)} onClose={() => setOpenId(null)} />}
      </Drawer>

      {/* Gå vidare mot kontrakt */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm ? `Vill du gå vidare med ${first(confirm)}?` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Inte än
            </Button>
            <Button
              onClick={() => {
                if (!confirm) return
                dispatch({ type: 'ACCEPT_BID', bidId: confirm.id })
                setConfirm(null)
                setOpenId(null)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              Gå vidare mot kontrakt <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        }
      >
        {confirm && (
          <div>
            <dl className="grid grid-cols-2 gap-4 rounded-xl bg-sand-100 p-5">
              <div>
                <dt className="text-sm text-ink-muted">Pris</dt>
                <dd className="text-xl font-bold">{formatSEK(confirm.amount)}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">Tillträde</dt>
                <dd className="text-xl font-bold">{accessText(confirm)}</dd>
              </div>
            </dl>
            <p className="mt-5 leading-relaxed text-ink-soft">
              Detta innebär att {first(confirm)} blir den köpare du vill gå vidare med. Affären är fortfarande inte bindande förrän köpekontraktet är undertecknat.
            </p>
            <p className="mt-3 text-sm text-ink-muted">Annonsen byter status till "Affär pågår" och nya köpförfrågningar stoppas. Övriga köpare kan anmäla fortsatt intresse.</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

function inactive(b: Bid) {
  return b.status === 'Avböjd' || b.status === 'Tillbakadragen'
}

function statusLabel(b: Bid, accepted: Bid | null) {
  if (accepted && b.id !== accepted.id && !inactive(b)) return 'Reserv'
  return b.status
}

function KindBadge({ b }: { b: Bid }) {
  return b.kind === 'accept' ? <Badge tone="petrol">Accepterar ditt pris</Badge> : <Badge tone="neutral">Annat erbjudande</Badge>
}

function Row({ label, cells }: { label: string; cells: React.ReactNode[] }) {
  return (
    <tr>
      <td className="px-5 py-3.5 text-sm font-semibold text-ink-muted">{label}</td>
      {cells.map((c, i) => (
        <td key={i} className="px-5 py-3.5">
          {c}
        </td>
      ))}
    </tr>
  )
}

function RequestCard({ b, accepted, onReview }: { b: Bid; accepted: Bid | null; onReview: () => void }) {
  return (
    <Card className={cn('p-5', inactive(b) && 'opacity-60')}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold">{b.bidderName}</p>
          <p className="flex items-center gap-1 text-xs text-ink-muted">
            <Clock className="h-3 w-3" /> Skickad {b.time}
          </p>
        </div>
        <KindBadge b={b} />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{formatSEK(b.amount)}</p>
      <p className="text-sm text-ink-soft">
        Tillträde {accessText(b).toLowerCase()} · {FINANCING_LABEL[b.financing.type]}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <Badge tone={STATUS_TONE[b.status]}>{statusLabel(b, accepted)}</Badge>
        <Button size="sm" variant="secondary" onClick={onReview} disabled={b.status === 'Tillbakadragen'}>
          Granska
        </Button>
      </div>
    </Card>
  )
}

function Review({ b, onGo, onClose }: { b: Bid; onGo: () => void; onClose: () => void }) {
  const { state, dispatch, acceptedBid } = useSale()
  const [msgOpen, setMsgOpen] = useState(false)
  const [msg, setMsg] = useState(`Hej ${first(b)}! Tack för din ${b.kind === 'accept' ? 'köpförfrågan' : 'erbjudande'}. `)
  const [sent, setSent] = useState(false)
  const isChosen = acceptedBid?.id === b.id
  const diff = b.amount - state.property.askingPrice

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-petrol-800 p-5 text-white">
        <p className="text-sm text-petrol-200">{b.kind === 'accept' ? 'Accepterar ditt fasta pris' : 'Annat erbjudande'}</p>
        <p className="text-3xl font-bold tracking-tight">{formatSEK(b.amount)}</p>
        {diff !== 0 && <p className="mt-1 text-sm text-petrol-100">{formatSEK(Math.abs(diff))} {diff < 0 ? 'under' : 'över'} ditt pris</p>}
      </div>
      <Block title="Köparen" icon={<BadgeCheck className="h-4 w-4" />}>
        <p className="font-semibold">{b.bidderName}</p>
        <p className="text-sm text-petrol-700">✓ Identitet verifierad (BankID, simulerat)</p>
      </Block>
      <Block title="Finansiering" icon={<Landmark className="h-4 w-4" />}>
        <p className="font-semibold">{FINANCING_LABEL[b.financing.type]}</p>
        {b.financing.type === 'lanelofte' && (
          <p className="text-sm text-ink-muted">
            Enligt köparen: {b.financing.bank}, {b.financing.amount ? formatSEK(b.financing.amount) : '–'}, giltigt till {b.financing.validTo ? formatDateShort(b.financing.validTo) : '–'}. Uppgiften är inte kontrollerad.
          </p>
        )}
      </Block>
      <Block title="Tillträde" icon={<CalendarDays className="h-4 w-4" />}>
        <p className="font-semibold">{accessText(b)}</p>
      </Block>
      <Block title="Villkor" icon={<FileSignature className="h-4 w-4" />}>
        <p className="font-semibold">{conditionsText(b)}</p>
      </Block>
      <p className="flex items-center gap-1.5 text-sm text-ink-muted">
        <Clock className="h-4 w-4" /> Skickad {b.time}
      </p>

      {sent && (
        <p className="flex items-center gap-1.5 rounded-lg bg-mint-100 px-3 py-2 text-sm font-semibold text-petrol-800">
          <Check className="h-4 w-4" /> Meddelandet är skickat
        </p>
      )}
      {msgOpen && !sent && (
        <div className="space-y-2">
          <Textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} />
          <Button size="sm" onClick={() => setSent(true)}>
            <Send className="h-4 w-4" /> Skicka
          </Button>
        </div>
      )}

      <div className="space-y-2 border-t border-sand-200 pt-5">
        {isChosen ? (
          <p className="rounded-xl bg-mint-100 p-4 font-semibold text-petrol-900">Du går vidare med {first(b)}.</p>
        ) : b.status === 'Avböjd' ? (
          <p className="rounded-xl bg-sand-100 p-4 text-ink-muted">Du har tackat nej till den här förfrågan.</p>
        ) : (
          <>
            <Button full size="lg" onClick={onGo} disabled={!!acceptedBid}>
              {b.kind === 'accept' ? `Gå vidare med ${first(b)}` : `Acceptera ${first(b)}s erbjudande`}
            </Button>
            {acceptedBid && <p className="text-center text-xs text-ink-muted">Du har redan valt en köpare. {first(b)} står kvar som reserv.</p>}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  dispatch({ type: 'SET_BID_STATUS', bidId: b.id, status: 'Avböjd' })
                  onClose()
                }}
              >
                <X className="h-4 w-4" /> Tacka nej
              </Button>
              <Button variant="secondary" onClick={() => setMsgOpen(true)}>
                <MessageSquare className="h-4 w-4" /> Skicka meddelande
              </Button>
            </div>
          </>
        )}
      </div>
      <p className="text-xs text-ink-muted">{BINDING_NOTE}</p>
    </div>
  )
}

function Block({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-sand-300/70">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-petrol-600">
        {icon} {title}
      </p>
      {children}
    </div>
  )
}

// "Affären – Ringvägen 128": skapas automatiskt när säljaren valt köpare och kopplar till avtalsflödet.
export function DealCard({ bid }: { bid: Bid }) {
  const { state } = useSale()
  const c = state.contract
  const signed = c.signedBySeller && c.signedByBuyer
  const brf = state.property.kind === 'brf'
  const items = [
    { label: 'Köpare vald', done: true },
    { label: 'Skapa avtal', done: c.approved || signed },
    { label: 'Signering', done: signed },
    { label: 'Handpenning', done: state.docs.deposit.registered },
    ...(brf ? [{ label: 'BRF', done: state.docs.membership.approved }] : []),
    { label: 'Slutbetalning', done: state.closing.finalPayment },
    { label: 'Tillträde', done: state.closing.completed },
  ]
  const firstOpen = items.findIndex((i) => !i.done)
  const list = items.map((it, i) => ({ ...it, current: i === firstOpen }))
  const cta = signed ? { label: 'Till dokumenten', to: '/min-forsaljning/dokument' } : c.draftCreated || c.step > 1 ? { label: 'Fortsätt med avtalet', to: '/min-forsaljning/avtal' } : { label: 'Skapa avtal', to: '/min-forsaljning/avtal' }
  return (
    <Card className="overflow-hidden border-petrol-200">
      <div className="grid md:grid-cols-[1.2fr_1fr]">
        <div className="p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-petrol-700">
            <Spline className="h-4 w-4" /> Affären
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Affären – {state.property.street}</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-[15px]">
            <div>
              <dt className="text-xs text-ink-muted">Säljare</dt>
              <dd className="font-semibold">{state.sellerName}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Köpare</dt>
              <dd className="font-semibold">{bid.bidderName}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Pris</dt>
              <dd className="font-semibold">{formatSEK(bid.amount)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Tillträde</dt>
              <dd className="font-semibold">{c.accessDate ? formatDateShort(c.accessDate) : accessText(bid)}</dd>
            </div>
          </dl>
          <Button to={cta.to} size="lg" className="mt-6">
            {cta.label} <ArrowRight className="h-5 w-5" />
          </Button>
          <p className="mt-3 text-xs text-ink-muted">{BINDING_NOTE}</p>
        </div>
        <div className="border-t border-sand-200 bg-sand-50 p-6 md:border-l md:border-t-0">
          <Checklist items={list} className="-mx-1" />
        </div>
      </div>
    </Card>
  )
}
