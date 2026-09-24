import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Menu, X } from 'lucide-react'
import { Logo } from './Logo'
import { Button, Container, cn } from './ui'
import { NotificationBell } from './Notifications'
import { useSale } from '../state/SaleContext'
import { useBuyer } from '../state/BuyerContext'
import { PROTOTYPE_DISCLAIMER } from '../config/brand'

const BASE_NAV = [
  { to: '/kopa', label: 'Köpa bostad' },
  { to: '/hitta-bostad', label: 'Hitta rätt bostad' },
  { to: '/salja', label: 'Sälja bostad' },
  { to: '/sa-fungerar-det', label: 'Så fungerar det' },
  { to: '/pris', label: 'Pris' },
]

export function PrototypeBar() {
  return (
    <div className="bg-petrol-900 text-petrol-100">
      <Container className="flex items-center justify-center gap-2 py-2 text-center text-xs sm:text-[13px]">
        <span className="rounded bg-mint-300 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-petrol-900">Prototyp</span>
        <span className="min-w-0 truncate sm:whitespace-normal">{PROTOTYPE_DISCLAIMER}</span>
      </Container>
    </div>
  )
}

export function Header() {
  const [open, setOpen] = useState(false)
  const { state } = useSale()
  const { buyer } = useBuyer()
  const location = useLocation()
  // Har köparen en profil blir "Hitta rätt bostad" en genväg till matchningarna.
  const NAV = BASE_NAV.map((n) => (n.to === '/hitta-bostad' && buyer.profile ? { to: '/mina-matchningar', label: 'Mina matchningar' } : n))
  const hasSale = state.started

  useEffect(() => setOpen(false), [location.pathname])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn('whitespace-nowrap rounded-lg px-2.5 py-2 text-[15px] font-medium transition-colors', isActive ? 'text-petrol-700' : 'text-ink-soft hover:text-ink')

  return (
    <header className="sticky top-0 z-40 border-b border-sand-300/60 bg-sand-100/85 backdrop-blur-md">
      <Container className="flex h-16 max-w-7xl items-center justify-between gap-4 xl:h-[72px]">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Huvudmeny">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={linkClass}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {hasSale && <NotificationBell />}
          <div className="hidden items-center gap-2 xl:flex">
            {hasSale ? (
              <Button variant="secondary" to="/min-forsaljning">
                <LayoutDashboard className="h-4 w-4" />
                Min försäljning
              </Button>
            ) : (
              <NavLink to="/logga-in" className={linkClass}>
                Logga in
              </NavLink>
            )}
            <Button to="/salj/start">Lägg upp bostad</Button>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl text-ink hover:bg-sand-200 xl:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Stäng meny' : 'Öppna meny'} aria-expanded={open}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-sand-300/60 bg-sand-100 xl:hidden animate-fade">
          <Container className="flex flex-col gap-1 py-4">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => cn('rounded-xl px-3 py-3 text-lg font-medium', isActive ? 'bg-white text-petrol-700' : 'text-ink')}>
                {n.label}
              </NavLink>
            ))}
            <div className="my-2 h-px bg-sand-300" />
            {hasSale ? (
              <NavLink to="/min-forsaljning" className="rounded-xl px-3 py-3 text-lg font-medium text-ink">
                Min försäljning
              </NavLink>
            ) : (
              <NavLink to="/logga-in" className="rounded-xl px-3 py-3 text-lg font-medium text-ink">
                Logga in
              </NavLink>
            )}
            <Button to="/salj/start" size="lg" className="mt-2">
              Lägg upp bostad
            </Button>
          </Container>
        </div>
      )}
    </header>
  )
}
