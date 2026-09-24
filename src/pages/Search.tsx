import { useMemo, useState } from 'react'
import { MapPin, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { Button, Card, Container, Field, Input, Select } from '../components/ui'
import { ListingCard } from '../components/ListingCard'
import { useListings } from '../state/useListings'
import { formatNumber } from '../lib/format'

const PRICE_STEPS = [2000000, 3000000, 4000000, 5000000, 6000000, 8000000, 10000000]

const EMPTY = { area: '', type: '', minPrice: '', maxPrice: '', rooms: '', minSize: '' }

export default function Search() {
  const { listings, ownId } = useListings()
  const [f, setF] = useState(EMPTY)
  const [sort, setSort] = useState<'new' | 'priceAsc' | 'priceDesc' | 'size'>('new')
  const [showFilters, setShowFilters] = useState(false)

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value })

  const results = useMemo(() => {
    const q = f.area.trim().toLowerCase()
    const r = listings.filter((l) => {
      if (q && !`${l.area} ${l.city} ${l.street}`.toLowerCase().includes(q)) return false
      if (f.type && l.type !== f.type) return false
      if (f.minPrice && l.price < +f.minPrice) return false
      if (f.maxPrice && l.price > +f.maxPrice) return false
      if (f.rooms && l.rooms < +f.rooms) return false
      if (f.minSize && l.size < +f.minSize) return false
      return true
    })
    const s = [...r]
    if (sort === 'priceAsc') s.sort((a, b) => a.price - b.price)
    if (sort === 'priceDesc') s.sort((a, b) => b.price - a.price)
    if (sort === 'size') s.sort((a, b) => b.size - a.size)
    if (sort === 'new') s.sort((a, b) => a.daysOnMarket - b.daysOnMarket)
    return s
  }, [listings, f, sort])

  const activeFilters = Object.values(f).filter(Boolean).length

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Bostäder till salu</h1>
      <p className="mt-2 text-ink-muted">Alla bostäder säljs direkt av ägaren – utan mäklare.</p>

      <Card className="mt-8 p-4 sm:p-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
            <Input value={f.area} onChange={set('area')} placeholder="Sök område, stad eller gata – t.ex. Södermalm" className="pl-11" aria-label="Område" />
          </div>
          <Button variant="secondary" className="h-12 lg:hidden" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4" />
            Filter{activeFilters > (f.area ? 1 : 0) ? ` (${activeFilters - (f.area ? 1 : 0)})` : ''}
          </Button>
        </div>
        <div className={`${showFilters ? 'grid' : 'hidden'} mt-4 grid-cols-2 gap-3 lg:grid lg:grid-cols-5`}>
          <Field label="Bostadstyp">
            <Select value={f.type} onChange={set('type')}>
              <option value="">Alla typer</option>
              <option>Lägenhet</option>
              <option>Radhus</option>
              <option>Villa</option>
            </Select>
          </Field>
          <Field label="Minpris">
            <Select value={f.minPrice} onChange={set('minPrice')}>
              <option value="">Inget</option>
              {PRICE_STEPS.map((p) => (
                <option key={p} value={p}>
                  {formatNumber(p)} kr
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Maxpris">
            <Select value={f.maxPrice} onChange={set('maxPrice')}>
              <option value="">Inget</option>
              {PRICE_STEPS.map((p) => (
                <option key={p} value={p}>
                  {formatNumber(p)} kr
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Antal rum">
            <Select value={f.rooms} onChange={set('rooms')}>
              <option value="">Alla</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  Minst {r} rum
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Minsta boyta">
            <Select value={f.minSize} onChange={set('minSize')}>
              <option value="">Alla</option>
              {[30, 50, 70, 90, 120].map((s) => (
                <option key={s} value={s}>
                  Minst {s} m²
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink">{results.length}</span> {results.length === 1 ? 'bostad' : 'bostäder'}
        </p>
        <div className="flex items-center gap-2">
          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setF(EMPTY)}>
              <RotateCcw className="h-4 w-4" /> Rensa filter
            </Button>
          )}
          <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-10 w-auto text-sm" aria-label="Sortera">
            <option value="new">Nyast först</option>
            <option value="priceAsc">Lägst pris</option>
            <option value="priceDesc">Högst pris</option>
            <option value="size">Störst boyta</option>
          </Select>
        </div>
      </div>

      {results.length ? (
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((l) => (
            <ListingCard key={l.id} listing={l} own={l.id === ownId} />
          ))}
        </div>
      ) : (
        <Card className="mt-5 p-10 text-center">
          <p className="text-lg font-semibold">Inga bostäder matchar din sökning</p>
          <p className="mt-1 text-ink-muted">Prova att ta bort något filter.</p>
          <Button variant="secondary" className="mt-5" onClick={() => setF(EMPTY)}>
            Rensa filter
          </Button>
        </Card>
      )}
    </Container>
  )
}
