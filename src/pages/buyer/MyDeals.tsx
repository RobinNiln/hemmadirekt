import { Link } from 'react-router-dom'
import { ArrowRight, Home, Undo2 } from 'lucide-react'
import { Badge, Button, Card, Checklist, Container, Eyebrow } from '../../components/ui'
import { Photo } from '../../components/Photo'
import { BindingNote, accessText, conditionsText } from '../../components/PurchaseRequest'
import { useBuyer, type BuyerRequest } from '../../state/BuyerContext'
import { useSale } from '../../state/SaleContext'
import { useListings } from '../../state/useListings'
import { FINANCING_LABEL } from '../../state/presets'
import { formatSEK } from '../../lib/format'
import type { RequestStatus } from '../../state/types'

// "Dina bostadsaffärer" – köparens översikt över skickade köpförfrågningar och erbjudanden.
export default function MyDeals() {
  const { buyer, withdrawRequest } = useBuyer()
  const { state, dispatch } = useSale()
  const { listings } = useListings()

  // För den egna demobostaden hämtas statusen live från säljarens sida.
  const live = (r: BuyerRequest) => {
    const sellerBid = state.bids.find((b) => b.id === r.id)
    const status: RequestStatus = r.status === 'Tillbakadragen' ? 'Tillbakadragen' : sellerBid?.status ?? r.status
    const chosen = !!sellerBid && state.acceptedBidId === sellerBid.id
    return { status, chosen }
  }

  return (
    <Container className="py-10 sm:py-14">
      <Eyebrow>Köpare</Eyebrow>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Dina bostadsaffärer</h1>
      <p className="mt-2 max-w-2xl text-ink-muted">Här följer du dina köpförfrågningar och erbjudanden – från att du skickat dem till tillträdet.</p>

      {buyer.requests.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <Home className="mx-auto h-10 w-10 text-ink-faint" />
          <p className="mt-3 text-lg font-semibold">Du har inga bostadsaffärer än</p>
          <p className="mt-1 text-ink-muted">När du hittar en bostad du vill köpa kan du acceptera säljarens pris direkt på objektsidan.</p>
          <Button to="/kopa" className="mt-6">
            Se bostäder
          </Button>
        </Card>
      ) : (
        <div className="mt-8 space-y-6">
          {buyer.requests.map((r) => {
            const l = listings.find((x) => x.id === r.listingId)
            const { status, chosen } = live(r)
            const c = state.contract
            const signed = chosen && c.signedBySeller && c.signedByBuyer
            const declined = status === 'Avböjd'
            const withdrawn = status === 'Tillbakadragen'
            const headline = withdrawn
              ? 'Tillbakadragen'
              : declined
                ? 'Säljaren har tackat nej'
                : chosen
                  ? signed
                    ? 'Kontrakt klart'
                    : 'Säljaren går vidare med dig'
                  : r.kind === 'offer'
                    ? 'Erbjudande skickat'
                    : 'Köpförfrågan skickad'
            const timeline = [
              { label: 'Intresse', done: true },
              { label: r.kind === 'offer' ? 'Erbjudande skickat' : 'Pris accepterat', done: true },
              { label: chosen ? 'Säljaren valde dig' : 'Väntar på säljaren', done: chosen },
              { label: 'Avtal', done: signed },
              { label: 'Handpenning', done: chosen && state.docs.deposit.registered },
              { label: 'Tillträde', done: chosen && state.closing.completed },
            ]
            const firstOpen = timeline.findIndex((t) => !t.done)
            const items = timeline.map((t, i) => ({ ...t, current: !declined && !withdrawn && i === firstOpen }))
            return (
              <Card key={r.id} className="overflow-hidden">
                <div className="grid lg:grid-cols-[1.4fr_1fr]">
                  <div className="p-6">
                    <div className="flex gap-4">
                      {l && <Photo src={l.images[0]} alt={r.street} className="h-20 w-24 shrink-0 rounded-xl" />}
                      <div className="min-w-0">
                        <Link to={`/bostad/${r.listingId}`} className="text-xl font-bold hover:underline">
                          {r.street}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge tone={declined || withdrawn ? 'neutral' : chosen ? 'green' : 'amber'}>{headline}</Badge>
                          <span className="text-xs text-ink-muted">Skickad {r.time}</span>
                        </div>
                      </div>
                    </div>
                    <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Fact k={r.kind === 'offer' ? 'Ditt erbjudande' : 'Pris'} v={formatSEK(r.amount)} />
                      <Fact k="Önskat tillträde" v={accessText(r)} />
                      <Fact k="Finansiering" v={FINANCING_LABEL[r.financing.type]} />
                      <Fact k="Villkor" v={conditionsText(r)} />
                    </dl>
                    {r.kind === 'offer' && <p className="mt-3 text-sm text-ink-muted">Säljarens pris: {formatSEK(r.askingPrice)}</p>}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {chosen && (
                        <Button to="/kopare" size="sm">
                          Följ affären <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                      {!chosen && !declined && !withdrawn && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            withdrawRequest(r.id)
                            if (state.bids.some((b) => b.id === r.id)) dispatch({ type: 'SET_BID_STATUS', bidId: r.id, status: 'Tillbakadragen' })
                          }}
                        >
                          <Undo2 className="h-4 w-4" /> Dra tillbaka
                        </Button>
                      )}
                      <Button to={`/bostad/${r.listingId}`} size="sm" variant="ghost">
                        Visa bostaden
                      </Button>
                    </div>
                    <BindingNote className="mt-5" />
                  </div>
                  <div className="border-t border-sand-200 bg-sand-50 p-6 lg:border-l lg:border-t-0">
                    <p className="text-sm font-semibold text-ink-soft">Så långt har affären kommit</p>
                    <Checklist items={items} className="mt-3 -mx-1" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </Container>
  )
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  )
}
