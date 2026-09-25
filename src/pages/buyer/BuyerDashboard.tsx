import { useMemo, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Bell, CalendarDays, CheckCircle2, Home, Lightbulb, Pause, Pencil, Play, Search, TrendingDown, Undo2 } from 'lucide-react'
import { Button, Card, Container, Eyebrow, cn } from '../../components/ui'
import { MatchCard } from '../../components/Match'
import { useBuyer } from '../../state/BuyerContext'
import { useSale } from '../../state/SaleContext'
import { useListings } from '../../state/useListings'
import { matchAll, matchListing, prefLabel, reqLabel } from '../../lib/matching'
import { learningPrompt } from '../../lib/learning'
import { formatSEK } from '../../lib/format'
import { RINGVAGEN_ID } from '../../data/listings'

type Tab = 'nya' | 'sparade' | 'avfardade'

export default function BuyerDashboard() {
  const { buyer, patchProfile, answerLearning, undismiss } = useBuyer()
  const { acceptedBid } = useSale()
  const { listings } = useListings()
  const [params] = useSearchParams()
  const [tab, setTab] = useState<Tab>('nya')
  const p = buyer.profile

  const matches = useMemo(() => (p ? matchAll(listings, p) : []), [listings, p])
  if (!p) return <Navigate to="/hitta-bostad" replace />

  const dismissedIds = buyer.dismissed.map((d) => d.id)
  const active = matches.filter((m) => !dismissedIds.includes(m.listing.id))
  const newOnes = active.filter((m) => m.listing.daysOnMarket <= 3 && !buyer.seen.includes(m.listing.id))
  const saved = buyer.saved.map((id) => listings.find((l) => l.id === id)).filter(Boolean).map((l) => ({ listing: l!, match: matchListing(l!, p) }))
  const dismissed = buyer.dismissed.map((d) => listings.find((l) => l.id === d.id)).filter(Boolean).map((l) => ({ listing: l!, match: matchListing(l!, p) }))
  const shownList = tab === 'nya' ? active.filter((m) => !buyer.saved.includes(m.listing.id)) : tab === 'sparade' ? saved : dismissed
  const prompt = learningPrompt(buyer, listings)
  const paused = p.status === 'paused'
  const noMatches = active.length === 0

  const notices = [
    newOnes[0] && { icon: Home, text: `Ny bostad som matchar din sökning: ${newOnes[0].listing.street}`, to: `/bostad/${newOnes[0].listing.id}` },
    saved[0] && { icon: TrendingDown, text: `Priset har ändrats på en sparad bostad: ${saved[0].listing.street}`, to: `/bostad/${saved[0].listing.id}` },
    active.some((m) => m.listing.id === RINGVAGEN_ID) && { icon: CalendarDays, text: 'Ny visning finns på Ringvägen 128', to: `/bostad/${RINGVAGEN_ID}` },
  ].filter(Boolean) as { icon: typeof Home; text: string; to: string }[]

  return (
    <Container className="py-10 sm:py-14">
      {params.get('ny') === '1' && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-petrol-700 p-5 text-white animate-pop">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-mint-200" />
          <div>
            <p className="font-bold">Din bostadsprofil är sparad</p>
            <p className="text-sm text-petrol-100">Vi matchar den mot nya bostäder hela tiden och säger till när något passar.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Mina matchningar</Eyebrow>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Hej {buyer.name}</h1>
          <p className="mt-2 text-ink-muted">{paused ? 'Dina matchningar är pausade.' : noMatches ? 'Vi letar vidare åt dig.' : `Vi har hittat ${active.length} bostäder som passar det du söker.`}</p>
        </div>
        {(buyer.requests.length > 0 || acceptedBid) && (
          <Button to="/mina-affarer" variant="secondary">
            Dina bostadsaffärer ({buyer.requests.filter((r) => r.status !== 'Tillbakadragen').length}) <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          {/* Nya sedan senaste besök + notiser */}
          {!paused && !noMatches && (
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 font-bold">
                  <Bell className="h-4 w-4 text-petrol-600" /> {newOnes.length === 1 ? '1 ny bostad' : `${newOnes.length} nya bostäder`} sedan ditt senaste besök
                </p>
              </div>
              <ul className="mt-3 divide-y divide-sand-100">
                {notices.map((n) => (
                  <li key={n.text}>
                    <Link to={n.to} className="flex items-center gap-3 py-2.5 text-sm hover:text-petrol-700">
                      <n.icon className="h-4 w-4 shrink-0 text-ink-muted" /> <span className="flex-1">{n.text}</span> <ArrowRight className="h-4 w-4 text-ink-faint" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Lärande funktion */}
          {prompt && !paused && (
            <Card className="border-petrol-200 bg-petrol-50/50 p-5 animate-rise">
              <p className="flex items-center gap-2 font-bold text-petrol-800">
                <Lightbulb className="h-4 w-4" /> Vi har märkt något
              </p>
              <p className="mt-1 text-[15px] text-ink-soft">{prompt.text}</p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    patchProfile(prompt.patch(p))
                    answerLearning(prompt.key, 'yes')
                  }}
                >
                  Ja
                </Button>
                <Button size="sm" variant="secondary" onClick={() => answerLearning(prompt.key, 'no')}>
                  Nej
                </Button>
              </div>
            </Card>
          )}

          {paused || noMatches ? (
            <EmptyState paused={paused} onResume={() => patchProfile({ status: 'active' })} />
          ) : (
            <section>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Dina bästa matchningar</h2>
                  <p className="text-sm text-ink-muted">Sorterade efter hur väl de passar din profil.</p>
                </div>
                <div className="flex rounded-xl bg-white p-1 ring-1 ring-sand-300" role="tablist">
                  {(
                    [
                      ['nya', `Nya (${active.filter((m) => !buyer.saved.includes(m.listing.id)).length})`],
                      ['sparade', `Sparade (${saved.length})`],
                      ['avfardade', `Inte för mig (${dismissed.length})`],
                    ] as [Tab, string][]
                  ).map(([k, label]) => (
                    <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-lg px-3 py-1.5 text-sm font-semibold transition', tab === k ? 'bg-petrol-700 text-white' : 'text-ink-soft hover:bg-sand-100')}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {shownList.length ? (
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {shownList.map(({ listing, match }) => (
                    <div key={listing.id} className="relative">
                      <MatchCard listing={listing} match={match} isNew={listing.daysOnMarket <= 3 && !buyer.seen.includes(listing.id)} />
                      {tab === 'avfardade' && (
                        <div className="absolute inset-x-3 top-3 flex justify-end">
                          <Button size="sm" variant="secondary" onClick={() => undismiss(listing.id)}>
                            <Undo2 className="h-4 w-4" /> Ångra
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="mt-5 p-8 text-center text-ink-muted">{tab === 'sparade' ? 'Du har inte sparat några bostäder än. Tryck på hjärtat för att spara.' : tab === 'avfardade' ? 'Inga bortvalda bostäder.' : 'Alla matchningar är sparade eller bortvalda.'}</Card>
              )}
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ProfileCard />
          <Button to="/kopa" variant="ghost" full>
            <Search className="h-4 w-4" /> Bläddra bland alla bostäder
          </Button>
        </aside>
      </div>
    </Container>
  )
}

export function ProfileCard() {
  const { buyer, patchProfile } = useBuyer()
  const p = buyer.profile!
  const paused = p.status === 'paused'
  const rows: [string, string][] = [
    ['Söker', `${p.minRooms}+ rum · ${p.minLivingArea}+ m²${p.minBedrooms ? ` · ${p.minBedrooms}+ sovrum` : ''}`],
    ['Budget', `Max ${formatSEK(p.maxPrice)}${p.maxMonthlyFee ? ` · avgift max ${formatSEK(p.maxMonthlyFee)}` : ''}`],
    ['Typ', p.propertyTypes.length ? p.propertyTypes.join(', ') : 'Alla typer'],
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Din bostadsprofil</h2>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', paused ? 'bg-sand-200 text-ink-muted' : 'bg-mint-100 text-petrol-800')}>{paused ? 'Pausad' : 'Aktiv'}</span>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-ink-muted">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
        <div>
          <dt className="text-ink-muted">Områden</dt>
          <dd className="mt-1 flex flex-wrap gap-1.5">
            {(p.wholeStockholm ? ['Hela Stockholm'] : p.preferredAreas).map((a) => (
              <span key={a} className="rounded-full bg-sand-100 px-2.5 py-1 text-xs font-medium">
                {a}
              </span>
            ))}
          </dd>
        </div>
        {p.requiredFeatures.length > 0 && (
          <div>
            <dt className="text-ink-muted">Måste</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {p.requiredFeatures.map((r) => (
                <span key={r} className="rounded-full bg-petrol-700 px-2.5 py-1 text-xs font-medium text-white">
                  {reqLabel(r)}
                </span>
              ))}
            </dd>
          </div>
        )}
        {p.preferredFeatures.length > 0 && (
          <div>
            <dt className="text-ink-muted">Viktigt</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {p.preferredFeatures.map((x) => (
                <span key={x.id} className={cn('rounded-full px-2.5 py-1 text-xs font-medium', x.priority === 'high' ? 'bg-mint-200 text-petrol-900' : 'bg-sand-100 text-ink-soft')}>
                  {prefLabel(x.id)}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
      <div className="mt-5 flex flex-col gap-2">
        <Button to="/hitta-bostad?redigera=1" variant="secondary" full>
          <Pencil className="h-4 w-4" /> Redigera profil
        </Button>
        <Button variant="ghost" full onClick={() => patchProfile({ status: paused ? 'active' : 'paused' })}>
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />} {paused ? 'Återuppta matchningar' : 'Pausa matchningar'}
        </Button>
      </div>
    </Card>
  )
}

function EmptyState({ paused, onResume }: { paused: boolean; onResume: () => void }) {
  const { buyer, patchProfile } = useBuyer()
  const p = buyer.profile!
  return (
    <Card className="p-8 text-center sm:p-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-200">
        <Search className="h-7 w-7 text-ink-muted" />
      </div>
      <h2 className="mt-5 text-2xl font-bold">{paused ? 'Matchningarna är pausade' : 'Vi har inte hittat rätt bostad ännu'}</h2>
      <p className="mx-auto mt-2 max-w-md text-ink-muted">
        {paused ? 'Du får inga nya matchningar eller notiser förrän du återupptar.' : 'Din sökprofil är aktiv. När en bostad som passar publiceras kan vi matcha den mot dina önskemål.'}
      </p>
      <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-sand-50 p-5 text-left ring-1 ring-sand-200">
        <p className="text-sm font-bold">Din profil</p>
        <ul className="mt-2 space-y-1 text-sm text-ink-soft">
          <li>{p.wholeStockholm ? 'Hela Stockholm' : p.preferredAreas.join(' + ')}</li>
          <li>Max {formatSEK(p.maxPrice)}</li>
          <li>Minst {p.minRooms} rum</li>
          {p.requiredFeatures.map((r) => (
            <li key={r}>{reqLabel(r)} krävs</li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {paused ? (
          <Button size="lg" onClick={onResume}>
            <Play className="h-4 w-4" /> Återuppta matchningar
          </Button>
        ) : (
          <>
            <Button size="lg" to="/hitta-bostad?redigera=1">
              Ändra min sökning
            </Button>
            <Button size="lg" variant="secondary" onClick={() => patchProfile({ status: 'paused' })}>
              <Pause className="h-4 w-4" /> Pausa matchningar
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
