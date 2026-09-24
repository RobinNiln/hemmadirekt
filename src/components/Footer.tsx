import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { Container } from './ui'
import { BRAND, PROTOTYPE_DISCLAIMER } from '../config/brand'

const COLS = [
  {
    title: 'Tjänsten',
    links: [
      { to: '/salja', label: 'Sälja bostad' },
      { to: '/genomfor-affaren', label: 'Genomför bara affären' },
      { to: '/kopa', label: 'Köpa bostad' },
      { to: '/pris', label: 'Pris' },
    ],
  },
  {
    title: 'Hjälp',
    links: [
      { to: '/sa-fungerar-det', label: 'Så fungerar det' },
      { to: '/logga-in', label: 'Logga in' },
      { to: '/kopare', label: 'Köparens vy (demo)' },
      { to: '/min-forsaljning', label: 'Min försäljning' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="mt-24 bg-petrol-900 text-petrol-100">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-petrol-200">
              {BRAND.tagline} Ett enklare sätt att sälja bostad – från annons till tillträde.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="mb-3 text-sm font-semibold text-white">{c.title}</p>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-petrol-200 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-xs leading-relaxed text-petrol-300">
          <p>{PROTOTYPE_DISCLAIMER} Inga avtal i tjänsten är juridiskt bindande. All bostads- och persondata är påhittad exempeldata.</p>
          <p className="mt-2">© {new Date().getFullYear()} {BRAND.name} (prototyp)</p>
        </div>
      </Container>
    </footer>
  )
}
