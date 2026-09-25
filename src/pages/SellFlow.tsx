import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Bell, Building2, Check, ChevronLeft, ChevronRight, Home, ImagePlus, Info, MapPin, PartyPopper, Pencil,
  Plus, RotateCw, Sparkles, Star, Tent, Trash2, Upload, Users, Warehouse, Wand2,
} from 'lucide-react'
import { Badge, Button, Card, CheckboxRow, Container, Field, Input, ProgressBar, Spinner, StepIndicator, Textarea, cn } from '../components/ui'
import { Photo } from '../components/Photo'
import { ListingBody } from './ListingPage'
import { useSale } from '../state/SaleContext'
import { DEFAULT_PROPERTY, DEMO_VILLA } from '../state/presets'
import { listingFromSale } from '../state/useListings'
import { FEATURE_CATEGORIES, featureLabel } from '../data/features'
import { EXAMPLE_UPLOADS } from '../lib/images'
import { detectFeaturesInPhotos, generateListingText, REWRITE_OPTIONS, rewriteText, sortPhotosWithAI, suggestHeadlines, type ListingFacts } from '../lib/aiListing'
import { matchBuyers } from '../lib/buyerBank'
import { formatDateLong, formatNumber, formatSEK, parseAmount, uid } from '../lib/format'
import type { ListingType, PropertyDetails, SalePhoto } from '../state/types'

// ---------------------------------------------------------------------------
// "Lägg upp bostad" – guidat flöde i sju steg. En eller några frågor åt gången.
// ---------------------------------------------------------------------------

const STEPS = ['Bostaden', 'Egenskaper', 'Bilder', 'Beskrivning', 'Pris', 'Förhandsgranska', 'Publicera']

// Mockad adressökning. En riktig version slår upp adressen i ett adressregister.
const ADDRESSES: { street: string; postalCode: string; city: string; area: string; preset: 'brf' | 'villa' }[] = [
  { street: 'Ringvägen 128', postalCode: '118 61', city: 'Stockholm', area: 'Södermalm', preset: 'brf' },
  { street: 'Ringvägen 100', postalCode: '118 60', city: 'Stockholm', area: 'Södermalm', preset: 'brf' },
  { street: 'Ringvägen 52', postalCode: '118 67', city: 'Stockholm', area: 'Södermalm', preset: 'brf' },
  { street: 'Tellusborgsvägen 45', postalCode: '126 32', city: 'Stockholm', area: 'Midsommarkransen', preset: 'brf' },
  { street: 'Hägerstensvägen 112', postalCode: '126 49', city: 'Stockholm', area: 'Aspudden', preset: 'brf' },
  { street: 'Björkvägen 14', postalCode: '137 38', city: 'Västerhaninge', area: 'Västerhaninge', preset: 'villa' },
  { street: 'Nockebyvägen 40', postalCode: '167 71', city: 'Stockholm', area: 'Bromma', preset: 'villa' },
]

type Sub = 'address' | 'confirm' | 'type' | 'basics1' | 'basics2' | 'basics3' | 'features' | 'photos' | 'describe' | 'price' | 'preview' | 'published'
const MAIN: Record<Sub, number> = { address: 1, confirm: 1, type: 1, basics1: 1, basics2: 1, basics3: 1, features: 2, photos: 3, describe: 4, price: 5, preview: 6, published: 7 }

export default function SellFlow() {
  const { state, dispatch } = useSale()
  const [params] = useSearchParams()
  const pkg = params.get('paket') === 'plus' ? 'plus' : 'standard'
  const [sub, setSub] = useState<Sub>('address')

  const needsFresh = !state.started || state.mode === 'direct'
  useEffect(() => {
    if (needsFresh) dispatch({ type: 'START_SALE', pkg })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (sub !== 'published' && state.started && state.mode === 'sell' && state.published) {
    return (
      <Container className="max-w-xl py-20 text-center">
        <h1 className="text-3xl font-bold">Du har redan en publicerad bostad</h1>
        <p className="mt-3 text-ink-muted">{state.property.street} är publicerad. Vill du fortsätta där eller lägga upp en ny bostad?</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to="/min-forsaljning" size="lg">
            Till Min försäljning
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => {
              dispatch({ type: 'START_SALE', pkg })
              setSub('address')
            }}
          >
            Lägg upp en ny bostad (demo)
          </Button>
        </div>
      </Container>
    )
  }

  const go = (s: Sub) => {
    setSub(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const brf = state.property.listingType === 'Bostadsrätt'
  const step = MAIN[sub]

  return (
    <div className="pb-16">
      <div className="border-b border-sand-300/60 bg-white">
        <Container className="py-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold">
              Lägg upp bostad
              {state.pkg === 'plus' && (
                <Badge tone="green" className="ml-2">
                  Plus
                </Badge>
              )}
            </p>
            <p className="text-xs text-ink-muted">Steg {step} av 7 · Sparas automatiskt</p>
          </div>
          <ProgressBar value={(step / 7) * 100} className="mt-3 md:hidden" />
          <StepIndicator steps={STEPS} current={step} className="mt-3 hidden md:flex" />
        </Container>
      </div>

      <Container className={cn('mt-8', sub === 'preview' || sub === 'published' ? '' : 'max-w-3xl')}>
        <div className="animate-rise" key={sub}>
          {sub === 'address' && <AddressStep onPicked={() => go('confirm')} />}
          {sub === 'confirm' && <ConfirmStep onYes={() => go('type')} onBack={() => go('address')} />}
          {sub === 'type' && <TypeStep onNext={() => go('basics1')} onBack={() => go('confirm')} />}
          {sub === 'basics1' && <Basics1 onNext={() => go('basics2')} onBack={() => go('type')} />}
          {sub === 'basics2' && <Basics2 onNext={() => go(brf ? 'basics3' : 'features')} onBack={() => go('basics1')} />}
          {sub === 'basics3' && <Basics3 onNext={() => go('features')} onBack={() => go('basics2')} />}
          {sub === 'features' && <FeaturesStep onNext={() => go('photos')} onBack={() => go(brf ? 'basics3' : 'basics2')} />}
          {sub === 'photos' && <PhotosStep onNext={() => go('describe')} onBack={() => go('features')} />}
          {sub === 'describe' && <DescribeStep onNext={() => go('price')} onBack={() => go('photos')} />}
          {sub === 'price' && <PriceStep onNext={() => go('preview')} onBack={() => go('describe')} />}
          {sub === 'preview' && <PreviewStep onEdit={go} onPublished={() => go('published')} />}
          {sub === 'published' && <PublishedStep />}
        </div>
      </Container>
    </div>
  )
}

// ---------------------------------------------------------------- Byggklossar
function Q({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {text && <p className="mt-2 text-ink-muted">{text}</p>}
      <div className="mt-6">{children}</div>
    </Card>
  )
}

function Nav({ onBack, onNext, nextLabel = 'Fortsätt', disabled, hint }: { onBack?: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean; hint?: string }) {
  return (
    <div className="mt-8">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {onBack ? (
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Tillbaka
          </Button>
        ) : (
          <span />
        )}
        <Button size="lg" onClick={onNext} disabled={disabled}>
          {nextLabel} <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
      {disabled && hint && <p className="mt-2 text-right text-xs text-ink-muted">{hint}</p>}
    </div>
  )
}

const numStr = (n: number) => (n ? String(n) : '')
const moneyInput = (v: string) => (parseAmount(v) ? formatNumber(parseAmount(v)) : '')

function useFacts(): ListingFacts {
  const { state } = useSale()
  const p = state.property
  return { type: p.listingType, rooms: p.rooms, bedrooms: p.bedrooms, size: p.size, floor: p.floor, elevator: p.elevator, built: p.built, area: p.area, plotArea: p.plotArea || undefined, features: state.listing.features }
}

// ---------------------------------------------------------------- 1a Adress
function AddressStep({ onPicked }: { onPicked: () => void }) {
  const { dispatch } = useSale()
  const [q, setQ] = useState('Ringvägen 1')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 350)
    return () => clearTimeout(t)
  }, [q])

  const hits = q.trim().length >= 2 ? ADDRESSES.filter((a) => `${a.street} ${a.city} ${a.area}`.toLowerCase().includes(q.trim().toLowerCase())) : []

  const pick = (a: (typeof ADDRESSES)[number] | null) => {
    const base: PropertyDetails = a?.preset === 'villa' ? DEMO_VILLA : DEFAULT_PROPERTY
    const typed = q.split(',')
    dispatch({
      type: 'UPDATE_PROPERTY',
      patch: a
        ? { ...base, street: a.street, postalCode: a.postalCode, city: a.city, area: a.area }
        : { ...DEFAULT_PROPERTY, street: typed[0].trim(), city: (typed[1] ?? 'Stockholm').trim(), postalCode: '', area: (typed[1] ?? 'Stockholm').trim() },
    })
    onPicked()
  }

  return (
    <Q title="Vilken bostad vill du sälja?" text="Börja skriva adressen så letar vi upp den.">
      <Field label="Adress" hint="Exempel: Ringvägen 128, Stockholm">
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Gatuadress" className="h-14 pl-11 text-lg" autoFocus role="combobox" aria-expanded={q.trim().length >= 2} />
          {loading && <Spinner className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />}
        </div>
      </Field>
      {q.trim().length >= 2 && (
        <ul className="mt-2 overflow-hidden rounded-xl border border-sand-300 bg-white shadow-card" role="listbox">
          {loading ? (
            <li className="space-y-2 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-sand-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-sand-200" />
            </li>
          ) : (
            <>
              {hits.map((a) => (
                <li key={a.street}>
                  <button onClick={() => pick(a)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-sand-50">
                    <MapPin className="h-4 w-4 text-petrol-600" />
                    <span>
                      <span className="block font-semibold">{a.street}</span>
                      <span className="block text-sm text-ink-muted">
                        {a.postalCode} {a.city}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              <li className="border-t border-sand-100">
                <button onClick={() => pick(null)} className="w-full px-4 py-3 text-left text-sm text-ink-muted hover:bg-sand-50">
                  Hittar du inte adressen? Använd "{q}" ändå
                </button>
              </li>
            </>
          )}
        </ul>
      )}
      <p className="mt-4 flex items-start gap-2 text-sm text-ink-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0" /> Adressökningen är simulerad i prototypen.
      </p>
    </Q>
  )
}

// ---------------------------------------------------------------- 1b Bekräfta
function ConfirmStep({ onYes, onBack }: { onYes: () => void; onBack: () => void }) {
  const { state } = useSale()
  const p = state.property
  return (
    <Q title="Är det här rätt bostad?">
      <div className="flex items-center gap-4 rounded-2xl border-2 border-petrol-600 bg-petrol-50/40 p-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-petrol-700 text-white">
          <MapPin className="h-6 w-6" />
        </span>
        <div>
          <p className="text-2xl font-bold">{p.street}</p>
          <p className="text-ink-muted">
            {p.postalCode} {p.city}
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={onYes}>
          <Check className="h-5 w-5" /> Det stämmer
        </Button>
        <Button size="lg" variant="ghost" onClick={onBack}>
          Ändra adress
        </Button>
      </div>
    </Q>
  )
}

// ---------------------------------------------------------------- 1c Typ
const TYPE_OPTIONS: { type: ListingType; icon: typeof Home; text: string }[] = [
  { type: 'Bostadsrätt', icon: Building2, text: 'Lägenhet i en förening' },
  { type: 'Villa', icon: Home, text: 'Fristående hus' },
  { type: 'Radhus', icon: Warehouse, text: 'Hus i längor' },
  { type: 'Fritidshus', icon: Tent, text: 'Sommar- eller fritidsboende' },
]

function TypeStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { state, dispatch } = useSale()
  const t = state.property.listingType
  return (
    <Q title="Vad är det för typ av bostad?" text="Vi anpassar frågorna och dokumenten efter bostadstypen.">
      <div className="grid gap-3 sm:grid-cols-2">
        {TYPE_OPTIONS.map(({ type, icon: Icon, text }) => (
          <button
            key={type}
            onClick={() => dispatch({ type: 'UPDATE_PROPERTY', patch: { listingType: type, ...(type === 'Bostadsrätt' ? {} : { floor: '', association: '', apartmentNo: '', elevator: false }) } })}
            className={cn('flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition', t === type ? 'border-petrol-600 bg-petrol-50/60' : 'border-sand-300 bg-white hover:border-ink-faint')}
            aria-pressed={t === type}
          >
            <Icon className={cn('h-7 w-7', t === type ? 'text-petrol-700' : 'text-ink-faint')} />
            <span>
              <span className="block text-lg font-semibold">{type}</span>
              <span className="text-sm text-ink-muted">{text}</span>
            </span>
          </button>
        ))}
      </div>
      <Nav onBack={onBack} onNext={onNext} />
    </Q>
  )
}

// ---------------------------------------------------------------- 1d Grunduppgifter
function Basics1({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { state, dispatch } = useSale()
  const p = state.property
  const [v, setV] = useState({ rooms: numStr(p.rooms), bedrooms: numStr(p.bedrooms), size: numStr(p.size) })
  const ok = parseAmount(v.rooms) > 0 && parseAmount(v.size) > 0
  return (
    <Q title="Hur stor är bostaden?" text="Grunduppgifterna som köpare söker på först.">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Antal rum" hint="Räkna inte kök och badrum">
          <Input inputMode="numeric" value={v.rooms} onChange={(e) => setV({ ...v, rooms: e.target.value.replace(/\D/g, '') })} />
        </Field>
        <Field label="Varav sovrum" hint="Rum där det går att sova">
          <Input inputMode="numeric" value={v.bedrooms} onChange={(e) => setV({ ...v, bedrooms: e.target.value.replace(/\D/g, '') })} />
        </Field>
        <Field label="Boyta (m²)" hint="Står i ditt köpekontrakt">
          <Input inputMode="numeric" value={v.size} onChange={(e) => setV({ ...v, size: e.target.value.replace(/\D/g, '') })} />
        </Field>
      </div>
      <Nav
        onBack={onBack}
        disabled={!ok}
        hint="Fyll i rum och boyta."
        onNext={() => {
          dispatch({ type: 'UPDATE_PROPERTY', patch: { rooms: parseAmount(v.rooms), bedrooms: parseAmount(v.bedrooms), size: parseAmount(v.size) } })
          onNext()
        }}
      />
    </Q>
  )
}

function Basics2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { state, dispatch } = useSale()
  const p = state.property
  const brf = p.listingType === 'Bostadsrätt'
  const [v, setV] = useState({ floor: p.floor, elevator: p.elevator, built: numStr(p.built), floors: numStr(p.floors), plotArea: numStr(p.plotArea), fee: p.fee ? formatNumber(p.fee) : '', designation: p.designation })
  const ok = parseAmount(v.built) > 1700 && (brf || parseAmount(v.fee) > 0)
  const save = () => {
    dispatch({
      type: 'UPDATE_PROPERTY',
      patch: brf
        ? { floor: v.floor, elevator: v.elevator, built: parseAmount(v.built) }
        : { built: parseAmount(v.built), floors: parseAmount(v.floors), plotArea: parseAmount(v.plotArea), fee: parseAmount(v.fee), designation: v.designation, elevator: false },
    })
    // Hiss hålls i synk med egenskapen "Hiss".
    const f = state.listing.features.filter((x) => x !== 'hiss')
    dispatch({ type: 'LISTING_PATCH', patch: { features: brf && v.elevator ? [...f, 'hiss'] : f } })
    onNext()
  }
  return (
    <Q title={brf ? 'Våning och hus' : 'Huset och tomten'} text={brf ? 'Våning och hiss är viktigt för många köpare.' : 'Uppgifter om huset och tomten.'}>
      {brf ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Våning" hint="T.ex. 4 av 5">
              <Input value={v.floor} onChange={(e) => setV({ ...v, floor: e.target.value })} />
            </Field>
            <Field label="Byggår" hint="När huset byggdes">
              <Input inputMode="numeric" value={v.built} onChange={(e) => setV({ ...v, built: e.target.value.replace(/\D/g, '') })} />
            </Field>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold">Finns det hiss?</p>
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <button key={String(val)} onClick={() => setV({ ...v, elevator: val })} className={cn('rounded-xl px-5 py-2.5 font-semibold ring-1', v.elevator === val ? 'bg-petrol-700 text-white ring-petrol-700' : 'bg-white ring-sand-300')} aria-pressed={v.elevator === val}>
                  {val ? 'Ja' : 'Nej'}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Byggår">
            <Input inputMode="numeric" value={v.built} onChange={(e) => setV({ ...v, built: e.target.value.replace(/\D/g, '') })} />
          </Field>
          <Field label="Antal våningar" hint="Våningsplan i huset">
            <Input inputMode="numeric" value={v.floors} onChange={(e) => setV({ ...v, floors: e.target.value.replace(/\D/g, '') })} />
          </Field>
          <Field label="Tomtarea (m²)">
            <Input inputMode="numeric" value={v.plotArea} onChange={(e) => setV({ ...v, plotArea: e.target.value.replace(/\D/g, '') })} />
          </Field>
          <Field label="Driftkostnad (kr/mån)" hint="El, vatten, sophämtning, försäkring m.m.">
            <Input inputMode="numeric" value={v.fee} onChange={(e) => setV({ ...v, fee: moneyInput(e.target.value) })} />
          </Field>
          <Field label="Fastighetsbeteckning" hint="Finns på lagfartsbeviset. Behövs till köpekontraktet." className="sm:col-span-2">
            <Input value={v.designation} onChange={(e) => setV({ ...v, designation: e.target.value })} placeholder="Kommun Område 1:23" />
          </Field>
        </div>
      )}
      <Nav onBack={onBack} onNext={save} disabled={!ok} hint={brf ? 'Fyll i byggår.' : 'Fyll i byggår och driftkostnad.'} />
    </Q>
  )
}

function Basics3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { state, dispatch } = useSale()
  const p = state.property
  const [v, setV] = useState({ fee: p.fee ? formatNumber(p.fee) : '', association: p.association, apartmentNo: p.apartmentNo })
  const ok = parseAmount(v.fee) > 0 && !!v.association.trim()
  return (
    <Q title="Föreningen" text="Uppgifter om bostadsrättsföreningen.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Månadsavgift (kr)" hint="Det du betalar till föreningen varje månad">
          <Input inputMode="numeric" value={v.fee} onChange={(e) => setV({ ...v, fee: moneyInput(e.target.value) })} />
        </Field>
        <Field label="Lägenhetsnummer" hint="Fyra siffror, t.ex. 1402">
          <Input value={v.apartmentNo} onChange={(e) => setV({ ...v, apartmentNo: e.target.value })} />
        </Field>
        <Field label="Bostadsrättsförening" className="sm:col-span-2">
          <Input value={v.association} onChange={(e) => setV({ ...v, association: e.target.value })} />
        </Field>
      </div>
      <Nav
        onBack={onBack}
        disabled={!ok}
        hint="Fyll i avgift och förening."
        onNext={() => {
          dispatch({ type: 'UPDATE_PROPERTY', patch: { fee: parseAmount(v.fee), association: v.association.trim(), apartmentNo: v.apartmentNo } })
          onNext()
        }}
      />
    </Q>
  )
}

// ---------------------------------------------------------------- 2 Egenskaper
function FeaturesStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { state, dispatch } = useSale()
  const features = state.listing.features
  const [custom, setCustom] = useState('')
  const known = new Set(FEATURE_CATEGORIES.flatMap((c) => c.items.map((i) => i.id)))
  const customs = features.filter((f) => !known.has(f))
  const set = (next: string[]) => dispatch({ type: 'LISTING_PATCH', patch: { features: next } })
  const toggle = (id: string, cat: string) => {
    if (features.includes(id)) return set(features.filter((f) => f !== id))
    // "Ingen uteplats" utesluter övriga uteplatsval.
    const uteIds = FEATURE_CATEGORIES.find((c) => c.id === 'ute')!.items.map((i) => i.id)
    let next = [...features, id]
    if (cat === 'ute') next = id === 'ingen-uteplats' ? next.filter((f) => !uteIds.includes(f) || f === id) : next.filter((f) => f !== 'ingen-uteplats')
    set(next)
  }
  return (
    <Q title="Vad kännetecknar bostaden?" text="Välj det som stämmer. Köpare matchas mot de här egenskaperna, så ta bara med sådant som finns.">
      <div className="space-y-6">
        {FEATURE_CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <p className="mb-2 text-sm font-semibold text-ink-soft">{cat.label}</p>
            <div className="flex flex-wrap gap-2">
              {cat.items.map((it) => {
                const on = features.includes(it.id)
                return (
                  <button key={it.id} onClick={() => toggle(it.id, cat.id)} className={cn('flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium ring-1 transition', on ? 'bg-petrol-700 text-white ring-petrol-700' : 'bg-white text-ink-soft ring-sand-300 hover:ring-ink-faint')} aria-pressed={on}>
                    {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />} {it.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-soft">Egna egenskaper</p>
          {customs.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {customs.map((c) => (
                <button key={c} onClick={() => set(features.filter((f) => f !== c))} className="flex items-center gap-1.5 rounded-full bg-petrol-700 px-3.5 py-2 text-sm font-medium text-white" title="Ta bort">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} /> {featureLabel(c)} ×
                </button>
              ))}
            </div>
          )}
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const c = custom.trim()
              if (c && !features.includes(c)) set([...features, c])
              setCustom('')
            }}
          >
            <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Lägg till egen egenskap" className="h-11" />
            <Button type="submit" variant="secondary" className="h-11" disabled={!custom.trim()}>
              <Plus className="h-4 w-4" /> Lägg till
            </Button>
          </form>
        </div>
      </div>
      <p className="mt-6 text-sm text-ink-muted">{features.length} egenskaper valda. Du kan få fler förslag när du laddar upp bilder.</p>
      <Nav onBack={onBack} onNext={onNext} />
    </Q>
  )
}

// ---------------------------------------------------------------- 3 Bilder
function PhotosStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { state, dispatch } = useSale()
  const photos = state.photos
  const setPhotos = (p: SalePhoto[]) => dispatch({ type: 'SET_PHOTOS', photos: p })
  const [uploading, setUploading] = useState(photos.length === 0)
  const [over, setOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [sorting, setSorting] = useState(false)
  const [sortedMsg, setSortedMsg] = useState(false)
  const [suggestOpen, setSuggestOpen] = useState(true)
  const [picked, setPicked] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (photos.length) return
    const t = setTimeout(() => {
      setPhotos(EXAMPLE_UPLOADS.map((p) => ({ ...p, rotation: 0 })))
      setUploading(false)
    }, 1300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const added: SalePhoto[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => ({ id: uid('p'), url: URL.createObjectURL(f), label: f.name.replace(/\.[^.]+$/, ''), tag: 'ovrigt', rotation: 0 }))
    setPhotos([...photos, ...added])
  }
  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length || from === to) return
    const next = [...photos]
    const [it] = next.splice(from, 1)
    next.splice(to, 0, it)
    setPhotos(next)
  }
  const rotate = (i: number) => setPhotos(photos.map((p, j) => (j === i ? { ...p, rotation: ((p.rotation ?? 0) + 90) % 360 } : p)))
  const sortAI = () => {
    setSorting(true)
    setSortedMsg(false)
    setTimeout(() => {
      setPhotos(sortPhotosWithAI(photos))
      setSorting(false)
      setSortedMsg(true)
    }, 1200)
  }

  const suggestions = detectFeaturesInPhotos(photos).filter((s) => !state.listing.features.includes(s.id))

  return (
    <div className="space-y-6">
      <Q title="Visa upp bostaden" text="Bra bilder är det viktigaste i en annons. Den första bilden blir huvudbild.">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            if (dragIndex === null) setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setOver(false)
            if (dragIndex === null) addFiles(e.dataTransfer.files)
          }}
          className={cn('flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition', over ? 'border-petrol-500 bg-petrol-50' : 'border-sand-300 bg-sand-50')}
        >
          <Upload className="h-9 w-9 text-petrol-600" />
          <p className="mt-3 text-lg font-semibold">Dra bilder hit eller välj från datorn.</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => fileRef.current?.click()}>
            <ImagePlus className="h-4 w-4" /> Välj bilder
          </Button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">{uploading ? 'Laddar upp 10 bilder…' : `${photos.length} bilder`}</p>
          {!uploading && photos.length > 1 && (
            <Button variant="secondary" size="sm" onClick={sortAI} disabled={sorting}>
              {sorting ? <Spinner className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />} Ordna bilder med AI
            </Button>
          )}
        </div>
        {sortedMsg && <p className="mt-2 rounded-lg bg-mint-100 px-3 py-2 text-sm text-petrol-800 animate-fade">Vi har föreslagit en bildordning. Du kan ändra den när du vill.</p>}

        {uploading || sorting ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: uploading ? 10 : photos.length }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-sand-200" />
            ))}
          </div>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((ph, i) => (
              <li
                key={ph.id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragEnd={() => setDragIndex(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (dragIndex !== null) move(dragIndex, i)
                  setDragIndex(null)
                }}
                className={cn('group relative overflow-hidden rounded-xl bg-sand-200 ring-2 transition', i === 0 ? 'ring-petrol-600' : 'ring-transparent', dragIndex === i && 'opacity-40')}
              >
                <div className="overflow-hidden">
                  <Photo src={ph.url} alt={ph.label} rotation={ph.rotation} className="aspect-[4/3] w-full" />
                </div>
                <span className="absolute left-2 top-2 rounded-md bg-white/95 px-1.5 py-0.5 text-[11px] font-bold">
                  {i === 0 ? (
                    <span className="flex items-center gap-1 text-petrol-800">
                      <Star className="h-3 w-3 fill-petrol-600 text-petrol-600" /> Huvudbild
                    </span>
                  ) : (
                    i + 1
                  )}
                </span>
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                  <div className="flex gap-1">
                    <IconBtn label="Flytta vänster" onClick={() => move(i, i - 1)} disabled={i === 0}>
                      <ChevronLeft className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn label="Flytta höger" onClick={() => move(i, i + 1)} disabled={i === photos.length - 1}>
                      <ChevronRight className="h-4 w-4" />
                    </IconBtn>
                  </div>
                  <div className="flex gap-1">
                    <IconBtn label="Rotera" onClick={() => rotate(i)}>
                      <RotateCw className="h-4 w-4" />
                    </IconBtn>
                    {i !== 0 && (
                      <IconBtn label="Välj som huvudbild" onClick={() => move(i, 0)}>
                        <Star className="h-4 w-4" />
                      </IconBtn>
                    )}
                    <IconBtn label="Ta bort" onClick={() => setPhotos(photos.filter((p) => p.id !== ph.id))}>
                      <Trash2 className="h-4 w-4" />
                    </IconBtn>
                  </div>
                </div>
              </li>
            ))}
            <li>
              <button onClick={() => fileRef.current?.click()} className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-sand-300 text-sm font-semibold text-ink-muted hover:border-petrol-400 hover:text-petrol-700">
                <Plus className="h-5 w-5" /> Lägg till fler
              </button>
            </li>
          </ul>
        )}
        <p className="mt-3 hidden text-xs text-ink-muted sm:block">Dra bilderna för att ändra ordning. Håll muspekaren över en bild för fler val.</p>
      </Q>

      {/* AI-förslag på egenskaper – kräver alltid bekräftelse */}
      {!uploading && suggestOpen && suggestions.length > 0 && (
        <Card className="border-petrol-200 p-6 animate-rise">
          <p className="flex items-center gap-2 text-sm font-semibold text-petrol-700">
            <Sparkles className="h-4 w-4" /> Förslag
          </p>
          <h2 className="mt-1 text-xl font-bold">Vi hittade några egenskaper i dina bilder</h2>
          <p className="mt-1 text-sm text-ink-muted">Bocka bara i det som stämmer. Inget läggs till i annonsen utan att du bekräftar.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {suggestions.map((s) => (
              <CheckboxRow key={s.id} checked={picked.includes(s.id)} onChange={(v) => setPicked(v ? [...picked, s.id] : picked.filter((x) => x !== s.id))} label={s.label} hint={s.source} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              disabled={!picked.length}
              onClick={() => {
                dispatch({ type: 'LISTING_PATCH', patch: { features: Array.from(new Set([...state.listing.features, ...picked])) } })
                setPicked([])
                setSuggestOpen(false)
              }}
            >
              Bekräfta egenskaper
            </Button>
            <Button variant="ghost" onClick={() => setSuggestOpen(false)}>
              Hoppa över
            </Button>
          </div>
        </Card>
      )}

      <Nav onBack={onBack} onNext={onNext} disabled={uploading || photos.length === 0} hint="Lägg till minst en bild." />
    </div>
  )
}

function IconBtn({ children, label, onClick, disabled }: { children: ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className="flex h-7 w-7 items-center justify-center rounded-md bg-white/95 text-ink hover:bg-white disabled:opacity-30">
      {children}
    </button>
  )
}

// ---------------------------------------------------------------- 4 Beskrivning
function DescribeStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { state, dispatch } = useSale()
  const facts = useFacts()
  const a = state.listing.answers
  const [mode, setMode] = useState<'choose' | 'self' | 'ai-questions' | 'edit'>(state.description ? 'edit' : 'choose')
  const [writing, setWriting] = useState(false)
  const text = state.description
  const setText = (t: string) => dispatch({ type: 'SET_DESCRIPTION', text: t })
  const setAnswers = (patch: Partial<typeof a>) => dispatch({ type: 'LISTING_PATCH', patch: { answers: { ...a, ...patch } } })
  const factKey = `${facts.type}-${facts.rooms}-${facts.size}-${facts.floor}-${facts.area}-${facts.features.join()}`
  const headlines = useMemo(() => suggestHeadlines(facts), [factKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const generate = (fn: () => string) => {
    setWriting(true)
    setTimeout(() => {
      setText(fn())
      setWriting(false)
      setMode('edit')
    }, 1100)
  }

  return (
    <div className="space-y-6">
      <Q title="Berätta om bostaden" text="Du kan skriva själv eller få ett förslag som du sedan redigerar.">
        {mode === 'choose' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => setMode('self')} className="rounded-2xl border-2 border-sand-300 bg-white p-6 text-left transition hover:border-ink-faint">
              <Pencil className="h-6 w-6 text-petrol-700" />
              <p className="mt-3 text-lg font-semibold">Skriv själv</p>
              <p className="text-sm text-ink-muted">Du vet bäst hur bostaden är.</p>
            </button>
            <button onClick={() => setMode('ai-questions')} className="rounded-2xl border-2 border-petrol-600 bg-petrol-50/60 p-6 text-left transition hover:bg-petrol-50">
              <Sparkles className="h-6 w-6 text-petrol-700" />
              <p className="mt-3 text-lg font-semibold">Hjälp mig skriva</p>
              <p className="text-sm text-ink-muted">Svara på tre frågor så får du ett förslag.</p>
            </button>
          </div>
        )}

        {mode === 'ai-questions' && (
          <div className="space-y-4">
            <Field label="Vad tycker du själv bäst om med bostaden?">
              <Textarea rows={2} value={a.favorite} onChange={(e) => setAnswers({ favorite: e.target.value })} placeholder="T.ex. ljuset och kvällssolen på balkongen" />
            </Field>
            <Field label="Vad uppskattar du mest med området?">
              <Textarea rows={2} value={a.areaLove} onChange={(e) => setAnswers({ areaLove: e.target.value })} placeholder="T.ex. närheten till parken och caféerna" />
            </Field>
            <Field label="Finns det något särskilt du vill lyfta?" hint="Valfritt">
              <Textarea rows={2} value={a.highlight} onChange={(e) => setAnswers({ highlight: e.target.value })} />
            </Field>
            <p className="flex items-start gap-2 rounded-xl bg-sand-100 px-4 py-3 text-sm text-ink-soft">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-petrol-600" /> Texten skapas bara av dina uppgifter och svar. Vi hittar aldrig på renoveringar, avstånd, utsikt, föreningsfakta eller ekonomi.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => generate(() => generateListingText(facts, a))} disabled={writing}>
                {writing ? <Spinner className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />} Skapa annonsbeskrivning
              </Button>
              <Button variant="ghost" onClick={() => setMode('choose')}>
                Tillbaka
              </Button>
            </div>
          </div>
        )}

        {(mode === 'self' || mode === 'edit') && (
          <div>
            {writing ? (
              <div className="space-y-2 rounded-xl border border-sand-300 p-4">
                {[90, 100, 80, 95, 60].map((w, i) => (
                  <div key={i} className="h-4 animate-pulse rounded bg-sand-200" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : (
              <Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Beskriv bostaden, planlösningen och området…" />
            )}
            <p className="mt-1 text-right text-xs text-ink-muted">{text.length} tecken</p>
            {text && (
              <div className="mt-3">
                <p className="mb-2 text-sm font-semibold">Skriv om</p>
                <div className="flex flex-wrap gap-2">
                  {REWRITE_OPTIONS.map((o) => (
                    <button key={o.id} disabled={writing} onClick={() => generate(() => rewriteText(text, o.id, facts, a))} className="rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-ink-soft ring-1 ring-sand-300 hover:ring-petrol-400 disabled:opacity-50">
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!text && (
              <button onClick={() => setMode('ai-questions')} className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-petrol-700 hover:underline">
                <Sparkles className="h-4 w-4" /> Vill du ha hjälp ändå?
              </button>
            )}
          </div>
        )}
      </Q>

      {(mode === 'self' || mode === 'edit') && (
        <Card className="p-6 sm:p-8">
          <h2 className="text-xl font-bold">Rubrik</h2>
          <p className="mt-1 text-sm text-ink-muted">Välj ett av förslagen eller skriv en egen.</p>
          <div className="mt-4 space-y-2">
            {headlines.map((h) => {
              const on = state.listing.headline === h
              return (
                <button key={h} onClick={() => dispatch({ type: 'LISTING_PATCH', patch: { headline: h } })} className={cn('flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left font-semibold transition', on ? 'border-petrol-600 bg-petrol-50/60' : 'border-sand-300 bg-white hover:border-ink-faint')}>
                  <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', on ? 'border-petrol-700 bg-petrol-700' : 'border-sand-300')}>{on && <span className="h-2 w-2 rounded-full bg-white" />}</span>
                  {h}
                </button>
              )
            })}
          </div>
          <Field label="Egen rubrik" className="mt-4">
            <Input value={state.listing.headline} onChange={(e) => dispatch({ type: 'LISTING_PATCH', patch: { headline: e.target.value } })} />
          </Field>
        </Card>
      )}

      <Nav onBack={onBack} onNext={onNext} disabled={!text.trim() || !state.listing.headline.trim()} hint="Skriv en beskrivning och välj en rubrik." />
    </div>
  )
}

// ---------------------------------------------------------------- 5 Pris
function PriceStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { state, dispatch } = useSale()
  const [price, setPrice] = useState(state.property.askingPrice ? formatNumber(state.property.askingPrice) : '')
  const n = parseAmount(price)
  const perSqm = state.property.size ? Math.round(n / state.property.size) : 0
  const pt = state.listing.priceType
  const fixed = pt === 'Fast pris'
  return (
    <div className="space-y-6">
      <Q title="Hur vill du sälja bostaden?">
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ['Fast pris', 'Du anger vilket pris du vill sälja för. Köpare kan acceptera priset direkt.', true],
              ['Ta emot erbjudanden', 'Du anger ett önskat pris men köpare kan lämna egna erbjudanden.', false],
            ] as const
          ).map(([k, text, rec]) => (
            <button key={k} onClick={() => dispatch({ type: 'LISTING_PATCH', patch: { priceType: k } })} className={cn('rounded-2xl border-2 p-5 text-left transition', pt === k ? 'border-petrol-600 bg-petrol-50/60' : 'border-sand-300 bg-white hover:border-ink-faint')} aria-pressed={pt === k}>
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                <span className={cn('flex h-5 w-5 items-center justify-center rounded-full border-2', pt === k ? 'border-petrol-700 bg-petrol-700' : 'border-sand-300')}>{pt === k && <span className="h-2 w-2 rounded-full bg-white" />}</span>
                {k}
                {rec && <span className="rounded-full bg-mint-200 px-2 py-0.5 text-[11px] font-bold text-petrol-900">Rekommenderat</span>}
              </p>
              <p className="mt-2 text-sm text-ink-muted">{text}</p>
            </button>
          ))}
        </div>
      </Q>

      <Q title="Vilket pris vill du sälja bostaden för?" text={fixed ? 'Ange det pris du är beredd att sälja bostaden för. Köpare kan acceptera priset och gå direkt vidare mot kontrakt.' : 'Ange ditt önskade pris. Köpare kan acceptera det eller lämna ett eget erbjudande.'}>
        <Field label={fixed ? 'Fast pris' : 'Önskat pris'}>
          <div className="relative">
            <Input inputMode="numeric" value={price} onChange={(e) => setPrice(moneyInput(e.target.value))} className="h-16 pr-14 text-2xl font-bold" />
            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-lg text-ink-muted">kr</span>
          </div>
        </Field>
        {perSqm > 0 && <p className="mt-2 text-ink-muted">{formatSEK(perSqm)}/m²</p>}
        <div className="mt-6 rounded-2xl bg-sand-100 p-5">
          <p className="font-semibold">Så fungerar det</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            {fixed
              ? 'En köpare kan meddela att den vill köpa bostaden till ditt angivna pris. Du granskar därefter köparen, finansiering, önskat tillträde och eventuella villkor innan ni går vidare mot kontrakt.'
              : 'Köpare kan acceptera ditt önskade pris eller skicka ett eget erbjudande. Du jämför förslagen och väljer själv vem du går vidare med.'}
          </p>
        </div>
        <p className="mt-4 flex items-start gap-2 text-sm text-ink-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" /> Vi gör ingen automatisk värdering. Jämför gärna med sålda bostäder i området.
        </p>
        <Nav
          onBack={onBack}
          disabled={!n}
          hint="Ange ett pris."
          onNext={() => {
            dispatch({ type: 'UPDATE_PROPERTY', patch: { askingPrice: n } })
            onNext()
          }}
        />
      </Q>
    </div>
  )
}

// ---------------------------------------------------------------- 6 Förhandsgranska
function PreviewStep({ onEdit, onPublished }: { onEdit: (s: Sub) => void; onPublished: () => void }) {
  const { state, dispatch } = useSale()
  const v = state.viewing
  const [withViewing, setWithViewing] = useState(true)
  const [date, setDate] = useState(v?.date ?? '2026-10-04')
  const [start, setStart] = useState(v?.start ?? '13:00')
  const [end, setEnd] = useState(v?.end ?? '14:00')
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    dispatch({ type: 'SET_VIEWING', viewing: withViewing ? { date, start, end, allowPrivate: true, published: false, signups: 0, capacity: 30 } : null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withViewing, date, start, end])

  const listing = listingFromSale(state)
  const publish = () => {
    setPublishing(true)
    setTimeout(() => {
      dispatch({ type: 'PUBLISH', notified: matchBuyers(listing).notified })
      onPublished()
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Förhandsgranska</h1>
          <p className="mt-1 text-ink-muted">Exakt så här ser köparna din annons.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['Bostaden', 'basics1'],
              ['Egenskaper', 'features'],
              ['Bilder', 'photos'],
              ['Beskrivning', 'describe'],
              ['Pris', 'price'],
            ] as [string, Sub][]
          ).map(([label, s]) => (
            <Button key={s} variant="secondary" size="sm" onClick={() => onEdit(s)}>
              <Pencil className="h-3.5 w-3.5" /> {label}
            </Button>
          ))}
        </div>
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" checked={withViewing} onChange={(e) => setWithViewing(e.target.checked)} className="h-5 w-5 accent-petrol-700" />
            <span>
              <span className="block font-semibold">Visa en visningstid i annonsen</span>
              <span className="text-sm text-ink-muted">Du kan ändra eller lägga till fler senare.</span>
            </span>
          </label>
          {withViewing && (
            <div className="grid grid-cols-3 gap-2 sm:w-[420px]">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 px-2 text-sm" aria-label="Datum" />
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="h-10 px-2 text-sm" aria-label="Start" />
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="h-10 px-2 text-sm" aria-label="Slut" />
            </div>
          )}
        </div>
        {withViewing && (
          <p className="mt-2 text-xs text-ink-muted">
            {formatDateLong(date)} {start}–{end}
          </p>
        )}
      </Card>

      <div className="overflow-hidden rounded-3xl border-4 border-dashed border-petrol-200 bg-sand-100 pb-8">
        <p className="bg-petrol-100 px-5 py-2 text-center text-sm font-semibold text-petrol-800">Förhandsvisning – annonsen är inte publicerad än</p>
        <ListingBody listing={listing} preview />
      </div>

      <div className="sticky bottom-4 z-20 flex flex-col-reverse gap-3 rounded-2xl bg-white/95 p-4 shadow-lift ring-1 ring-sand-300 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={() => onEdit('price')}>
          <Pencil className="h-4 w-4" /> Redigera
        </Button>
        <Button size="lg" onClick={publish} disabled={publishing}>
          {publishing ? (
            <>
              <Spinner /> Publicerar…
            </>
          ) : (
            <>
              Publicera bostaden <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- 7 Publicerad
function PublishedStep() {
  const { state } = useSale()
  const navigate = useNavigate()
  const listing = listingFromSale(state)
  const m = matchBuyers(listing)
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="overflow-hidden text-center animate-pop">
        <div className="bg-petrol-800 px-6 py-10 text-white sm:px-10">
          <PartyPopper className="mx-auto h-14 w-14 text-mint-300" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Din bostad är publicerad</h1>
          <p className="mt-2 text-lg text-petrol-100">{state.property.street}</p>
        </div>
        <div className="p-6 sm:p-10">
          <p className="flex items-center justify-center gap-2 text-sm font-semibold text-petrol-700">
            <Users className="h-4 w-4" /> Köparbanken
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{m.total} registrerade köpare matchar redan din bostad</p>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl bg-petrol-50 p-4">
              <p className="text-3xl font-bold text-petrol-800">{m.veryGood}</p>
              <p className="text-sm text-petrol-800">mycket bra matchningar</p>
            </div>
            <div className="rounded-2xl bg-sand-100 p-4">
              <p className="text-3xl font-bold">{m.possible}</p>
              <p className="text-sm text-ink-muted">möjliga matchningar</p>
            </div>
          </div>
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-ink-soft">
            <Bell className="h-4 w-4 text-petrol-600" /> {m.notified} matchande köpare har fått en notis om din bostad
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => navigate('/min-forsaljning/kopare')}>
              Se matchande köpare <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/min-forsaljning')}>
              Till Min försäljning
            </Button>
          </div>
          <p className="mt-6 text-xs text-ink-muted">Köparbanken är mockdata i prototypen. Säljare ser aldrig köparnas namn eller kontaktuppgifter förrän köparen själv valt att dela dem.</p>
        </div>
      </Card>
    </div>
  )
}
