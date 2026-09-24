import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, FileText, ShieldCheck } from 'lucide-react'
import { Badge, Button, Card, Checklist, Container, Eyebrow, ProgressBar } from '../components/ui'
import { Photo } from '../components/Photo'
import { DemoNotice } from '../components/Trust'
import { useSale } from '../state/SaleContext'
import { EXAMPLE_UPLOADS } from '../lib/images'
import { formatDateShort, formatSEK } from '../lib/format'
import { buyerHasFinancing } from '../lib/docRegistry'

// Köparens enkla dashboard. Visas ur köparens perspektiv i demon.
export default function BuyerView() {
  const { state, acceptedBid } = useSale()

  const street = acceptedBid ? state.property.street : 'Ringvägen 128'
  const price = acceptedBid?.amount ?? 4620000
  const buyer = acceptedBid?.bidderName ?? 'Anna Andersson'
  const access = state.contract.accessDate || '2026-12-15'
  const signed = !!acceptedBid && state.contract.signedByBuyer
  const c = state.closing
  const d = state.docs
  const brf = state.property.kind === 'brf'

  const status = c.completed ? 'Affären är genomförd' : signed ? 'Avtal signerat' : 'Avtal förbereds'

  const items = [
    { label: 'Bud accepterat', done: true },
    { label: 'Identitet verifierad', done: true },
    { label: 'Finansiering registrerad', done: acceptedBid ? buyerHasFinancing(state, acceptedBid) : true },
    { label: 'Signera avtal', done: signed },
    { label: 'Betala handpenning', done: signed && d.deposit.registered },
    ...(brf ? [{ label: 'Medlemskap BRF', done: signed && d.membership.approved }] : []),
    { label: 'Tillträde', done: c.completed },
    ...(!brf ? [{ label: 'Ansök om lagfart', done: d.titlePrepared }] : []),
  ]
  const firstOpen = items.findIndex((i) => !i.done)
  const withCurrent = items.map((it, i) => ({ ...it, current: i === firstOpen }))
  const pct = Math.round((items.filter((i) => i.done).length / items.length) * 100)

  const nextText = !signed
    ? 'Säljaren förbereder avtalet. Du får en notis när det är klart att granska och signera.'
    : !d.deposit.registered
      ? 'Betala handpenningen innan förfallodatum. Underlaget finns under dina dokument.'
      : brf && !d.membership.approved
        ? 'Din medlemsansökan behandlas av föreningen. Du får besked inom några veckor.'
        : !c.completed
          ? 'Förbered slutbetalningen med din bank inför tillträdesdagen.'
          : !brf && !d.titlePrepared
            ? 'Grattis! Sista steget är att ansöka om lagfart.'
            : 'Grattis till ditt nya hem! Alla dokument finns sparade här.'

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Eyebrow>Köparens vy · {buyer}</Eyebrow>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Din bostadsaffär</h1>
        </div>
        <Badge tone="amber">Demovy</Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="grid sm:grid-cols-[220px_1fr]">
              <Photo src={state.photos[0]?.url ?? EXAMPLE_UPLOADS[0].url} alt={street} className="h-48 w-full sm:h-full" />
              <div className="p-6">
                <h2 className="text-2xl font-bold">{street}</h2>
                <p className="mt-1 text-ink-muted">Pris</p>
                <p className="text-2xl font-bold tracking-tight">{formatSEK(price)}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-ink-muted">Status:</span>
                  <Badge tone={c.completed ? 'green' : 'petrol'}>{status}</Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold text-petrol-700">Vad händer nu?</p>
            <p className="mt-2 text-lg leading-relaxed">{nextText}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-sand-100 p-4">
                <CalendarDays className="h-5 w-5 text-petrol-600" />
                <div>
                  <p className="text-xs text-ink-muted">Tillträde</p>
                  <p className="font-semibold">{formatDateShort(access)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-sand-100 p-4">
                <FileText className="h-5 w-5 text-petrol-600" />
                <div>
                  <p className="text-xs text-ink-muted">Handpenning</p>
                  <p className="font-semibold">{formatSEK(state.contract.deposit || Math.round(price * 0.1))}</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex items-start gap-3 rounded-xl bg-mint-100/70 p-4 text-sm text-petrol-800">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            Du är verifierad med BankID. Säljaren ser att du är en trygg köpare.
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Checklista</h2>
            <span className="text-sm text-ink-muted">{pct} %</span>
          </div>
          <ProgressBar value={pct} className="mt-3" />
          <Checklist items={withCurrent} className="mt-4" />
        </Card>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DemoNotice className="flex-1">Köparens vy speglar säljarens demo. Byt till säljarens vy för att driva affären framåt.</DemoNotice>
        <Button to="/min-forsaljning" variant="secondary">
          Till säljarens vy <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      {!acceptedBid && (
        <p className="mt-4 text-sm text-ink-muted">
          Tips:{' '}
          <Link className="font-semibold text-petrol-700 hover:underline" to="/min-forsaljning/budgivning">
            acceptera ett bud
          </Link>{' '}
          i säljarens vy så följer köparens vy med.
        </p>
      )}
    </Container>
  )
}
