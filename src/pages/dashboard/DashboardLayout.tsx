import { NavLink, Outlet } from 'react-router-dom'
import { ExternalLink, FileText, ListChecks, Home, KeyRound, LayoutDashboard, PlayCircle, Scale, Sparkles, UserRound, Users } from 'lucide-react'
import { Button, Card, Container, StatusDot, cn } from '../../components/ui'
import { Photo } from '../../components/Photo'
import { useSale } from '../../state/SaleContext'
import { saleStatus } from '../../state/progress'
import { RINGVAGEN_ID } from '../../data/listings'
import { formatSEK } from '../../lib/format'

export default function DashboardLayout() {
  const { state, dispatch } = useSale()

  if (!state.started) {
    return (
      <Container className="max-w-xl py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-petrol-50">
          <Home className="h-7 w-7 text-petrol-700" />
        </div>
        <h1 className="mt-5 text-3xl font-bold">Du har ingen pågående försäljning</h1>
        <p className="mt-3 text-ink-muted">Starta en ny försäljning, eller testa demon av en försäljning som redan är igång.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to="/salj/start" size="lg">
            Lägg upp bostad
          </Button>
          <Button size="lg" variant="secondary" onClick={() => dispatch({ type: 'LOAD_DEMO' })}>
            <PlayCircle className="h-5 w-5" /> Testa en pågående försäljning
          </Button>
        </div>
      </Container>
    )
  }

  const direct = state.mode === 'direct'
  const status = saleStatus(state)
  const tabs = [
    { to: '/min-forsaljning', label: 'Översikt', icon: LayoutDashboard, end: true },
    ...(direct
      ? []
      : [
          { to: '/min-forsaljning/kopare', label: 'Matchande köpare', icon: Sparkles },
          { to: '/min-forsaljning/intressenter', label: 'Intressenter', icon: Users },
          { to: '/min-forsaljning/forfragningar', label: 'Köpförfrågningar', icon: ListChecks },
        ]),
    { to: '/min-forsaljning/avtal', label: 'Avtal', icon: Scale },
    { to: '/min-forsaljning/dokument', label: 'Dokument', icon: FileText },
    { to: '/min-forsaljning/tilltrade', label: 'Tillträde', icon: KeyRound },
  ]

  return (
    <div className="pb-10">
      <div className="border-b border-sand-300/60 bg-white">
        <Container className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Photo src={state.photos[0]?.url ?? ''} alt={state.property.street} className="h-16 w-20 shrink-0 rounded-xl" />
              <div>
                <p className="text-sm text-ink-muted">Min försäljning</p>
                <h1 className="text-2xl font-bold tracking-tight">{state.property.street}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="inline-flex items-center gap-2 font-medium">
                    <StatusDot tone={status.tone} /> {status.label}
                  </span>
                  <span className="text-ink-muted">{state.listing.priceType}: {formatSEK(state.property.askingPrice)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {state.published && (
                <Button variant="secondary" size="sm" to={`/bostad/${RINGVAGEN_ID}`}>
                  <ExternalLink className="h-4 w-4" /> Visa annons
                </Button>
              )}
              <Button variant="ghost" size="sm" to="/kopare">
                <UserRound className="h-4 w-4" /> Köparens vy
              </Button>
            </div>
          </div>
          <nav className="no-scrollbar -mb-px mt-6 flex gap-1 overflow-x-auto" aria-label="Försäljningsmeny">
            {tabs.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn('flex shrink-0 items-center gap-2 border-b-2 px-3 pb-3 pt-1 text-sm font-semibold transition', isActive ? 'border-petrol-700 text-petrol-800' : 'border-transparent text-ink-muted hover:text-ink')
                }
              >
                <Icon className="h-4 w-4" />
                {label}
                {label === 'Köpförfrågningar' && state.bids.length > 0 && !state.acceptedBidId && (
                  <span className="rounded-full bg-petrol-700 px-1.5 text-[10px] text-white">{state.bids.length}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </Container>
      </div>
      <Container className="mt-8">
        <Outlet />
      </Container>
    </div>
  )
}

export function EmptyPanel({ icon, title, text, children }: { icon: React.ReactNode; title: string; text: string; children?: React.ReactNode }) {
  return (
    <Card className="px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-200 text-ink-muted">{icon}</div>
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-ink-muted">{text}</p>
      {children && <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">{children}</div>}
    </Card>
  )
}
