import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, GripVertical, ImagePlus, Info, MapPin, Search, Sparkles, Star, Trash2, Upload, Users } from 'lucide-react'
import { Badge, Button, Card, CheckboxRow, Container, Field, Input, Spinner, StepIndicator, Textarea, cn } from '../components/ui'
import { Photo } from '../components/Photo'
import { DemoNotice, TrustRow } from '../components/Trust'
import { useSale } from '../state/SaleContext'
import { DEFAULT_PROPERTY } from '../state/presets'
import { EXAMPLE_UPLOADS } from '../lib/images'
import { generateDescription } from '../lib/aiText'
import { formatDateLong, formatNumber, formatSEK, parseAmount, uid } from '../lib/format'
import { PRICES } from '../config/brand'
import type { SalePhoto } from '../state/types'

const MAIN_STEPS = ['Bostaden', 'Annons', 'Visning', 'Budgivning', 'Avtal', 'Tillträde']

// Delsteg i onboardingen
type Sub = 'address' | 'found' | 'details' | 'listing' | 'viewing' | 'review'
const SUB_TO_MAIN: Record<Sub, number> = { address: 1, found: 1, details: 1, listing: 2, viewing: 3, review: 3 }

const GUIDE: Record<Sub, { now: string; next: string }> = {
  address: { now: 'Ange adressen till bostaden du vill sälja.', next: 'Vi hämtar grunduppgifterna så att du slipper skriva allt själv.' },
  found: { now: 'Kontrollera att vi hittat rätt bostad.', next: 'Du kompletterar med avgift, byggår och önskat pris.' },
  details: { now: 'Fyll i det som köpare vill veta.', next: 'Du laddar upp bilder och skriver annonstexten – med AI-hjälp.' },
  listing: { now: 'Lägg till bilder och en beskrivning.', next: 'Du väljer när du vill visa bostaden.' },
  viewing: { now: 'Välj datum och tid för visningen.', next: 'Du granskar allt och publicerar annonsen.' },
  review: { now: 'Kontrollera att allt ser bra ut.', next: 'Annonsen publiceras och köpare kan boka visning och lägga bud.' },
}

export default function SellFlow() {
  const { state, dispatch } = useSale()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const pkg = params.get('paket') === 'plus' ? 'plus' : 'standard'
  const [sub, setSub] = useState<Sub>('address')

  // Starta en ny försäljning om det inte redan finns en påbörjad.
  const needsFresh = !state.started || state.mode === 'direct'
  useEffect(() => {
    if (needsFresh) dispatch({ type: 'START_SALE', pkg })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state.started && state.mode === 'sell' && state.published) {
    return (
      <Container className="max-w-xl py-20 text-center">
        <h1 className="text-3xl font-bold">Du har redan en publicerad försäljning</h1>
        <p className="mt-3 text-ink-muted">
          {state.property.street} är publicerad. Vill du fortsätta där eller börja om med en ny bostad?
        </p>
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
            Börja om (demo)
          </Button>
        </div>
      </Container>
    )
  }

  const go = (s: Sub) => {
    setSub(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="pb-10">
      <div className="border-b border-sand-300/60 bg-white">
        <Container className="py-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold">
              Sälj din bostad
              {state.pkg === 'plus' && (
                <Badge tone="green" className="ml-2">
                  Plus
                </Badge>
              )}
            </p>
            <p className="text-xs text-ink-muted">Sparas automatiskt</p>
          </div>
          <StepIndicator steps={MAIN_STEPS} current={SUB_TO_MAIN[sub]} className="mt-3" />
        </Container>
      </div>

      <Container className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 animate-rise" key={sub}>
          {sub === 'address' && <AddressStep onFound={() => go('found')} />}
          {sub === 'found' && <FoundStep onConfirm={() => go('details')} onManual={() => go('details')} onBack={() => go('address')} />}
          {sub === 'details' && <DetailsStep onNext={() => go('listing')} onBack={() => go('address')} />}
          {sub === 'listing' && <ListingStep onNext={() => go('viewing')} onBack={() => go('details')} />}
          {sub === 'viewing' && <ViewingStep onNext={() => go('review')} onBack={() => go('listing')} />}
          {sub === 'review' && (
            <ReviewStep
              onBack={() => go('viewing')}
              onEdit={go}
              onPublish={() => {
                dispatch({ type: 'PUBLISH' })
                navigate('/min-forsaljning?publicerad=1')
              }}
            />
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-petrol-600">Du är här</p>
            <p className="mt-1 font-semibold">
              Steg {SUB_TO_MAIN[sub]} · {MAIN_STEPS[SUB_TO_MAIN[sub] - 1]}
            </p>
            <p className="mt-3 text-sm text-ink-soft">{GUIDE[sub].now}</p>
            <div className="mt-4 border-t border-sand-200 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Sedan</p>
              <p className="mt-1 text-sm text-ink-soft">{GUIDE[sub].next}</p>
            </div>
          </Card>
          <Card className="p-5">
            <TrustRow compact className="flex-col gap-y-3" />
          </Card>
        </aside>
      </Container>
    </div>
  )
}

function StepHeading({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {text && <p className="mt-2 text-lg text-ink-muted">{text}</p>}
    </div>
  )
}

function NavButtons({ onBack, onNext, nextLabel = 'Fortsätt', disabled }: { onBack?: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean }) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
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
  )
}

// ---------------------------------------------------------------- Steg 1a
function AddressStep({ onFound }: { onFound: () => void }) {
  const { dispatch } = useSale()
  const [address, setAddress] = useState('Ringvägen 128, Stockholm')
  const [searching, setSearching] = useState(false)

  const search = () => {
    if (!address.trim()) return
    setSearching(true)
    const [streetRaw, cityRaw] = address.split(',').map((s) => s.trim())
    const isDemo = /ringvägen\s*128/i.test(streetRaw)
    setTimeout(() => {
      dispatch({
        type: 'UPDATE_PROPERTY',
        patch: {
          ...DEFAULT_PROPERTY,
          street: streetRaw.charAt(0).toUpperCase() + streetRaw.slice(1),
          city: cityRaw || 'Stockholm',
          area: isDemo ? 'Södermalm' : cityRaw || 'Stockholm',
        },
      })
      setSearching(false)
      onFound()
    }, 1300)
  }

  return (
    <Card className="p-6 sm:p-8">
      <StepHeading title="Vi börjar med bostaden" text="Vilken bostad ska du sälja?" />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          search()
        }}
      >
        <Field label="Adress" hint="Exempel: Ringvägen 128, Stockholm">
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Gatuadress, ort" className="h-14 pl-11 text-lg" autoFocus />
          </div>
        </Field>
        <Button type="submit" size="lg" className="mt-6" full disabled={searching || !address.trim()}>
          {searching ? (
            <>
              <Spinner /> Söker bostaden…
            </>
          ) : (
            <>
              <Search className="h-5 w-5" /> Hitta min bostad
            </>
          )}
        </Button>
      </form>
      <p className="mt-4 flex items-start gap-2 text-sm text-ink-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0" /> I prototypen simuleras uppslaget – alla adresser ger exempeldata.
      </p>
    </Card>
  )
}

// ---------------------------------------------------------------- Steg 1b
function FoundStep({ onConfirm, onManual, onBack }: { onConfirm: () => void; onManual: () => void; onBack: () => void }) {
  const { state, dispatch } = useSale()
  const p = state.property
  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint-200 text-petrol-800">
          <Check className="h-5 w-5" strokeWidth={3} />
        </span>
        <h1 className="text-3xl font-bold tracking-tight">Vi hittade bostaden</h1>
      </div>
      <div className="rounded-2xl border-2 border-petrol-600 bg-petrol-50/40 p-6">
        <p className="text-2xl font-bold">{p.street}</p>
        <p className="text-ink-muted">
          {p.area}, {p.city}
        </p>
        <dl className="mt-5 grid grid-cols-3 gap-4">
          <div>
            <dt className="text-xs text-ink-muted">Lägenhet</dt>
            <dd className="text-lg font-semibold">{p.apartmentNo}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Boyta</dt>
            <dd className="text-lg font-semibold">{p.size} m²</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Rum</dt>
            <dd className="text-lg font-semibold">{p.rooms} rum</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-ink-muted">Källa: lägenhetsregistret (simulerat)</p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={onConfirm}>
          <Check className="h-5 w-5" /> Det stämmer
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => {
            dispatch({ type: 'UPDATE_PROPERTY', patch: { size: 0, rooms: 0, floor: '', fee: 0, built: 0, association: '', askingPrice: 0 } })
            onManual()
          }}
        >
          Fyll i uppgifterna själv
        </Button>
      </div>
      <button onClick={onBack} className="mt-6 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Ändra adress
      </button>
    </Card>
  )
}

// ---------------------------------------------------------------- Steg 1c
function DetailsStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { state, dispatch } = useSale()
  const p = state.property
  const num = (n: number) => (n ? String(n) : '')
  const [kind, setKind] = useState(p.kind)
  const brf = kind === 'brf'
  const [v, setV] = useState({
    designation: p.designation,
    size: num(p.size),
    rooms: num(p.rooms),
    floor: p.floor,
    fee: p.fee ? formatNumber(p.fee) : '',
    built: num(p.built),
    association: p.association,
    askingPrice: p.askingPrice ? formatNumber(p.askingPrice) : '',
  })
  const set = (k: keyof typeof v, money = false) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setV({ ...v, [k]: money ? (parseAmount(raw) ? formatNumber(parseAmount(raw)) : '') : raw })
  }
  const valid = parseAmount(v.size) > 0 && parseAmount(v.rooms) > 0 && parseAmount(v.askingPrice) > 0 && parseAmount(v.fee) > 0

  const next = () => {
    dispatch({
      type: 'UPDATE_PROPERTY',
      patch: {
        kind,
        designation: v.designation,
        size: parseAmount(v.size),
        rooms: parseAmount(v.rooms),
        floor: brf ? v.floor : '',
        fee: parseAmount(v.fee),
        built: parseAmount(v.built),
        association: brf ? v.association : '',
        askingPrice: parseAmount(v.askingPrice),
      },
    })
    onNext()
  }

  const ppsqm = parseAmount(v.size) ? Math.round(parseAmount(v.askingPrice) / parseAmount(v.size)) : 0

  return (
    <Card className="p-6 sm:p-8">
      <StepHeading title="Berätta lite mer" text="Det här är uppgifterna köpare letar efter först." />
      <Field label="Vilken typ av bostad är det?" hint="Vi anpassar dokumenten efter bostadstypen.">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['brf', 'Bostadsrätt', 'Lägenhet i en förening'],
              ['villa', 'Villa / fastighet', 'Hus som du äger'],
            ] as const
          ).map(([k, label, sub]) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn('rounded-xl border-2 p-4 text-left transition', kind === k ? 'border-petrol-600 bg-petrol-50/60' : 'border-sand-300 bg-white hover:border-ink-faint')}
            >
              <span className="block font-semibold">{label}</span>
              <span className="block text-sm text-ink-muted">{sub}</span>
            </button>
          ))}
        </div>
      </Field>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Boyta (m²)">
          <Input inputMode="numeric" value={v.size} onChange={set('size')} placeholder="76" />
        </Field>
        <Field label="Antal rum">
          <Input inputMode="numeric" value={v.rooms} onChange={set('rooms')} placeholder="3" />
        </Field>
        {brf ? (
          <Field label="Våning" hint="T.ex. 4 av 5">
            <Input value={v.floor} onChange={set('floor')} placeholder="4 av 5" />
          </Field>
        ) : (
          <Field label="Fastighetsbeteckning" hint="Finns på lagfartsbeviset">
            <Input value={v.designation} onChange={set('designation')} placeholder="Kommun Område 1:23" />
          </Field>
        )}
        <Field label={brf ? 'Månadsavgift (kr)' : 'Driftkostnad (kr/mån)'}>
          <Input inputMode="numeric" value={v.fee} onChange={set('fee', true)} placeholder="4 250" />
        </Field>
        <Field label="Byggår">
          <Input inputMode="numeric" value={v.built} onChange={set('built')} placeholder="1929" />
        </Field>
        {brf && (
          <Field label="Förening">
            <Input value={v.association} onChange={set('association')} placeholder="Bostadsrättsföreningen Solgläntan" />
          </Field>
        )}
      </div>
      <div className="mt-6 rounded-2xl bg-sand-100 p-5">
        <Field label="Önskat pris (kr)" hint="Priset du annonserar med. Det slutliga priset avgörs av budgivningen.">
          <Input inputMode="numeric" value={v.askingPrice} onChange={set('askingPrice', true)} placeholder="4 495 000" className="h-14 text-lg font-semibold" />
        </Field>
        {ppsqm > 0 && <p className="mt-3 text-sm text-ink-muted">Motsvarar {formatSEK(ppsqm)} per m².</p>}
      </div>
      <NavButtons onBack={onBack} onNext={next} disabled={!valid} />
      {!valid && <p className="mt-3 text-right text-xs text-ink-muted">Fyll i boyta, rum, avgift/driftkostnad och pris för att fortsätta.</p>}
    </Card>
  )
}

// ---------------------------------------------------------------- Steg 2
function ListingStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { state, dispatch } = useSale()
  const [photos, setPhotos] = useState<SalePhoto[]>(state.photos)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [text, setText] = useState(state.description)
  const [writing, setWriting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number>()

  // Visa 8 exempelbilder som "laddas upp" första gången man kommer hit.
  useEffect(() => {
    if (photos.length) return
    setUploading(true)
    const t = setTimeout(() => {
      setPhotos(EXAMPLE_UPLOADS)
      setUploading(false)
    }, 1200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => clearInterval(timer.current), [])

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const added = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => ({ id: uid('p'), url: URL.createObjectURL(f), label: f.name.replace(/\.[^.]+$/, '') }))
    setPhotos((p) => [...p, ...added])
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length || from === to) return
    const next = [...photos]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setPhotos(next)
  }

  const writeWithAI = () => {
    const full = generateDescription(state.property)
    setWriting(true)
    setText('')
    let i = 0
    clearInterval(timer.current)
    timer.current = window.setInterval(() => {
      i += 6
      setText(full.slice(0, i))
      if (i >= full.length) {
        clearInterval(timer.current)
        setWriting(false)
      }
    }, 16)
  }

  const next = () => {
    dispatch({ type: 'SET_PHOTOS', photos })
    dispatch({ type: 'SET_DESCRIPTION', text })
    onNext()
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <StepHeading title="Nu skapar vi din annons" text="Bra bilder är det viktigaste i en bostadsannons. Den första bilden blir omslagsbild." />

        <div
          onDragOver={(e) => {
            e.preventDefault()
            if (dragIndex === null) setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            if (dragIndex === null) addFiles(e.dataTransfer.files)
          }}
          className={cn('flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition', dragOver ? 'border-petrol-500 bg-petrol-50' : 'border-sand-300 bg-sand-50')}
        >
          <Upload className="h-8 w-8 text-petrol-600" />
          <p className="mt-3 font-semibold">Dra och släpp bilder här</p>
          <p className="text-sm text-ink-muted">eller</p>
          <Button variant="secondary" size="sm" className="mt-2" onClick={() => fileRef.current?.click()}>
            <ImagePlus className="h-4 w-4" /> Välj bilder från datorn
          </Button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm font-semibold">
            {uploading ? 'Laddar upp…' : `${photos.length} bilder uppladdade`}
          </p>
          {!uploading && photos.length > 1 && <p className="hidden text-xs text-ink-muted sm:block">Dra bilderna för att ändra ordning</p>}
        </div>

        {uploading ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex aspect-[4/3] items-center justify-center rounded-xl bg-sand-200">
                <Spinner className="text-ink-faint" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                <Photo src={ph.url} alt={ph.label} className="aspect-[4/3] w-full" />
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold">
                  <GripVertical className="h-3 w-3 text-ink-faint" />
                  {i === 0 ? (
                    <>
                      <Star className="h-3 w-3 fill-petrol-600 text-petrol-600" /> Omslag
                    </>
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
                    {i !== 0 && (
                      <IconBtn label="Gör till omslagsbild" onClick={() => move(i, 0)}>
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
          </ul>
        )}
      </Card>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Bostadsbeskrivning</h2>
            <p className="text-sm text-ink-muted">Beskriv bostaden, föreningen och området.</p>
          </div>
          <Button variant="accent" onClick={writeWithAI} disabled={writing}>
            {writing ? <Spinner className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {writing ? 'Skriver…' : text ? 'Skriv om med AI' : 'Skriv med AI'}
          </Button>
        </div>
        <Textarea rows={11} className="mt-4" value={text} onChange={(e) => setText(e.target.value)} placeholder="Skriv själv eller klicka på ✨ Skriv med AI för att få ett förslag som du sedan kan redigera." readOnly={writing} />
        <p className="mt-2 flex justify-between text-xs text-ink-muted">
          <span>Texten är ett förslag – redigera fritt så att den låter som du.</span>
          <span>{text.length} tecken</span>
        </p>
      </Card>

      <NavButtons onBack={onBack} onNext={next} disabled={uploading || photos.length === 0 || !text.trim() || writing} />
    </div>
  )
}

function IconBtn({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-ink hover:bg-white disabled:opacity-30">
      {children}
    </button>
  )
}

// ---------------------------------------------------------------- Steg 3
function ViewingStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { state, dispatch } = useSale()
  const v = state.viewing
  const [date, setDate] = useState(v?.date ?? '2026-10-04')
  const [start, setStart] = useState(v?.start ?? '13:00')
  const [end, setEnd] = useState(v?.end ?? '14:00')
  const [allowPrivate, setAllowPrivate] = useState(v?.allowPrivate ?? true)
  const [created, setCreated] = useState(!!v)

  const valid = date && start && end && end > start

  const create = () => {
    dispatch({ type: 'SET_VIEWING', viewing: { date, start, end, allowPrivate, published: false, signups: 0, capacity: 30 } })
    setCreated(true)
  }

  return (
    <Card className="p-6 sm:p-8">
      <StepHeading title="När vill du visa bostaden?" text="De flesta visningar hålls en söndag eller en vardagskväll och varar en timme." />
      {!created ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Datum">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Starttid">
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </Field>
            <Field label="Sluttid">
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </Field>
          </div>
          <div className="mt-4">
            <CheckboxRow checked={allowPrivate} onChange={setAllowPrivate} label="Tillåt privata visningar" hint="Intressenter kan önska en egen tid. Du godkänner varje förfrågan." />
          </div>
          {!valid && <p className="mt-3 text-sm text-red-700">Sluttiden måste vara efter starttiden.</p>}
          <NavButtons onBack={onBack} onNext={create} nextLabel="Skapa visning" disabled={!valid} />
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4 rounded-2xl border-2 border-petrol-600 bg-petrol-50/40 p-6 sm:flex-row sm:items-center sm:justify-between animate-pop">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-petrol-700 text-white">
                <CalendarDays className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xl font-bold">{formatDateLong(state.viewing?.date ?? date)}</p>
                <p className="text-ink-muted">
                  {state.viewing?.start}–{state.viewing?.end}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Users className="h-4 w-4" /> 0 anmälda
            </div>
          </div>
          {state.viewing?.allowPrivate && <p className="mt-3 text-sm text-ink-muted">✓ Privata visningar är tillåtna</p>}
          <button className="mt-4 text-sm font-semibold text-petrol-700 hover:underline" onClick={() => setCreated(false)}>
            Ändra tid
          </button>
          <NavButtons onBack={onBack} onNext={onNext} nextLabel="Publicera visning" />
        </>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------- Granska & publicera
function ReviewStep({ onBack, onEdit, onPublish }: { onBack: () => void; onEdit: (s: Sub) => void; onPublish: () => void }) {
  const { state } = useSale()
  const p = state.property
  const price = state.pkg === 'plus' ? PRICES.sellPlus : PRICES.sellYourself
  const [publishing, setPublishing] = useState(false)

  const publish = () => {
    setPublishing(true)
    setTimeout(onPublish, 1100)
  }

  const Row = ({ label, value, edit }: { label: string; value: React.ReactNode; edit: Sub }) => (
    <div className="flex items-start justify-between gap-4 py-4">
      <div>
        <p className="text-sm text-ink-muted">{label}</p>
        <div className="mt-0.5 font-medium">{value}</div>
      </div>
      <button className="text-sm font-semibold text-petrol-700 hover:underline" onClick={() => onEdit(edit)}>
        Ändra
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <Photo src={state.photos[0]?.url ?? ''} alt={p.street} className="aspect-[21/9] w-full" />
        <div className="p-6 sm:p-8">
          <Badge tone="green">Förhandsvisning</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Allt ser bra ut – dags att publicera</h1>
          <div className="mt-4 divide-y divide-sand-200">
            <Row label="Bostad" value={`${p.street}, ${p.area} · ${p.rooms} rum · ${p.size} m² · våning ${p.floor || '–'}`} edit="details" />
            <Row label="Pris och avgift" value={`${formatSEK(p.askingPrice)} · avgift ${formatSEK(p.fee)}/mån`} edit="details" />
            <Row label="Annons" value={`${state.photos.length} bilder · beskrivning ${state.description.length} tecken`} edit="listing" />
            <Row label="Visning" value={state.viewing ? `${formatDateLong(state.viewing.date)} ${state.viewing.start}–${state.viewing.end}` : 'Ingen visning'} edit="viewing" />
          </div>
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{state.pkg === 'plus' ? 'Sälj själv Plus' : 'Sälj själv'}</p>
            <p className="text-sm text-ink-muted">Fast pris, betalas vid publicering</p>
          </div>
          <p className="text-2xl font-bold">{formatSEK(price)}</p>
        </div>
        <DemoNotice className="mt-5">Ingen betalning dras i prototypen.</DemoNotice>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Tillbaka
          </Button>
          <Button size="lg" onClick={publish} disabled={publishing}>
            {publishing ? (
              <>
                <Spinner /> Publicerar…
              </>
            ) : (
              <>
                Publicera annonsen <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
