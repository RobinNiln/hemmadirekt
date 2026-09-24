import { useSearchParams } from 'react-router-dom'
import { ArrowRight, Bookmark, CalendarDays, Eye, Gavel, PartyPopper, Sparkles, Users } from 'lucide-react'
import { Badge, Button, Card, Checklist, ProgressBar, Stat } from '../../components/ui'
import { TrustRow, VerifiedTag } from '../../components/Trust'
import { DemoPanel } from '../../components/DemoPanel'
import { useSale } from '../../state/SaleContext'
import { saleProgress } from '../../state/progress'
import { formatDateLong, formatSEK } from '../../lib/format'
import { nextStep } from '../../lib/docRegistry'

export default function Overview() {
  const { state, highestBid, acceptedBid } = useSale()
  const [params] = useSearchParams()
  const justPublished = params.get('publicerad') === '1'
  const items = saleProgress(state)
  const pct = Math.round((items.filter((i) => i.done).length / items.length) * 100)
  const next = nextStep(state, acceptedBid, highestBid)
  const direct = state.mode === 'direct'

  return (
    <div className="space-y-6">
      {justPublished && (
        <div className="flex items-start gap-3 rounded-2xl bg-petrol-700 p-5 text-white animate-pop">
          <PartyPopper className="mt-0.5 h-6 w-6 shrink-0 text-mint-200" />
          <div>
            <p className="font-bold">Din annons är publicerad!</p>
            <p className="mt-0.5 text-sm text-petrol-100">Den syns nu under Köpa bostad. Köpare kan boka plats på visningen och lägga bud.</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* NÄSTA STEG */}
        <Card className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-petrol-700">
              <Sparkles className="h-4 w-4" /> Vad du behöver göra nu
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{next.title}</h2>
            <p className="mt-2 max-w-xl text-ink-muted">{next.text}</p>
          </div>
          <div className="mt-6 flex flex-col gap-5">
            <Button to={next.to} size="lg" className="self-start">
              {next.cta} <ArrowRight className="h-5 w-5" />
            </Button>
            <TrustRow compact className="border-t border-sand-200 pt-5" />
          </div>
        </Card>

        {/* PROGRESS */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Försäljningens steg</h2>
            <span className="text-sm text-ink-muted">{pct} %</span>
          </div>
          <ProgressBar value={pct} className="mt-3" />
          <Checklist items={items} className="mt-3 -mx-1" />
        </Card>
      </div>

      {!direct && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat value={state.stats.views} label="Annonsvisningar" icon={<Eye className="h-4 w-4" />} />
            <Stat value={state.stats.saved} label="Sparat bostaden" icon={<Bookmark className="h-4 w-4" />} />
            <Stat value={state.viewing?.signups ?? 0} label="Anmälda till visning" icon={<CalendarDays className="h-4 w-4" />} />
            <Stat value={state.interested.length} label="Intressenter" icon={<Users className="h-4 w-4" />} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* VISNING */}
            <Card className="p-6">
              <h2 className="font-bold">Visning</h2>
              {state.viewing ? (
                <div className="mt-4">
                  <p className="text-lg font-semibold">{formatDateLong(state.viewing.date)}</p>
                  <p className="text-ink-muted">
                    {state.viewing.start}–{state.viewing.end}
                  </p>
                  <p className="mt-3 text-sm">
                    <span className="font-semibold">{state.viewing.signups}</span> anmälda av {state.viewing.capacity} platser
                  </p>
                  <ProgressBar value={(state.viewing.signups / state.viewing.capacity) * 100} className="mt-2" />
                  {state.viewing.allowPrivate && <p className="mt-3 text-xs text-ink-muted">Privata visningar tillåtna</p>}
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink-muted">Ingen visning bokad.</p>
              )}
            </Card>

            {/* INTRESSENTER */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Intressenter</h2>
                <Button variant="ghost" size="sm" to="/min-forsaljning/intressenter">
                  Alla
                </Button>
              </div>
              {state.interested.length ? (
                <ul className="mt-3 space-y-3">
                  {state.interested.slice(0, 3).map((i) => (
                    <li key={i.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{i.name}</p>
                        <VerifiedTag />
                      </div>
                      <Badge tone={i.level === 'Mycket intresserad' ? 'green' : 'neutral'}>{i.level}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink-muted">Inga intressenter än. De dyker upp här när någon bokar visning.</p>
              )}
            </Card>

            {/* BUD */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Budgivning</h2>
                <Button variant="ghost" size="sm" to="/min-forsaljning/budgivning">
                  Öppna
                </Button>
              </div>
              {highestBid ? (
                <div className="mt-3">
                  <p className="text-sm text-ink-muted">Högsta bud</p>
                  <p className="text-3xl font-bold tracking-tight">{formatSEK(highestBid.amount)}</p>
                  <p className="text-sm text-ink-muted">
                    {highestBid.bidderName} · {highestBid.time}
                  </p>
                  <p className="mt-3 text-sm">
                    <span className="font-semibold">{state.bids.length}</span> bud från {new Set(state.bids.map((b) => b.bidderId)).size} budgivare
                  </p>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-3 text-sm text-ink-muted">
                  <Gavel className="h-5 w-5" /> Inga bud än.
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      <DemoPanel />
    </div>
  )
}
