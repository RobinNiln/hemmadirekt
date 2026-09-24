import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Info, MapPin, Plus, Sparkles, X } from 'lucide-react'
import { Button, Card, Container, Field, Input, ProgressBar, Spinner, StepIndicator, Textarea, cn } from '../../components/ui'
import { DEMO_PROFILE, useBuyer } from '../../state/BuyerContext'
import { useListings } from '../../state/useListings'
import { AREAS } from '../../data/areas'
import { PROPERTY_TYPES, type PropertyType } from '../../data/listings'
import { PREFERENCES, REQUIREMENTS, matchAll, prefLabel, reqLabel, type BuyerProfile, type PreferenceId, type Priority, type TextTag } from '../../lib/matching'
import { interpretFreeText, type Interpretation } from '../../lib/aiBuyer'
import { formatNumber, formatSEK, parseAmount } from '../../lib/format'
import { BRAND } from '../../config/brand'

// ---------------------------------------------------------------------------
// "Hitta rätt bostad" – köparens sökprofil som ett kort samtal i sju steg.
// ---------------------------------------------------------------------------

const STEPS = ['Område', 'Budget', 'Bostad', 'Krav', 'Önskemål', 'Din beskrivning', 'Matchningar']
const SHOWN_PREFS = PREFERENCES.filter((p) => p.id !== 'balkong-uteplats')

// Exempeltext för demon – beskriver samma saker som profilen, så att matchningen går att följa.
const DEMO_TEXT = 'Jag vill bo ljust och nära tunnelbanan, gärna med renoverat kök och öppen planlösning. Parkering vore ett plus men är inget krav.'
const PLACEHOLDER =
  'Vi är två vuxna och två barn och vill flytta lite utanför stan. Vi vill gärna ha minst tre sovrum, balkong eller uteplats och nära till natur. Vi har bil så parkering är viktigt, men vi vill samtidigt kunna ta oss till city på ungefär 30 minuter.'

export default function BuyerOnboarding() {
  const { buyer, setProfile } = useBuyer()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editing = params.get('redigera') === '1'
  const [step, setStep] = useState(1)
  const [p, setP] = useState<BuyerProfile>(() => buyer.profile ?? { ...DEMO_PROFILE, freeText: '' })
  const patch = (x: Partial<BuyerProfile>) => setP((cur) => ({ ...cur, ...x }))

  useEffect(() => {
    if (buyer.profile && !editing) navigate('/mina-matchningar', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const go = (n: number) => {
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="pb-16">
      <div className="border-b border-sand-300/60 bg-white">
        <Container className="py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{editing ? 'Redigera din bostadsprofil' : 'Hitta rätt bostad'}</p>
            <p className="text-xs text-ink-muted">Steg {step} av 7</p>
          </div>
          <ProgressBar value={(step / 7) * 100} className="mt-3 md:hidden" />
          <StepIndicator steps={STEPS} current={step} className="mt-3 hidden md:flex" />
        </Container>
      </div>
      <Container className="mt-8 max-w-3xl">
        <div className="animate-rise" key={step}>
          {step === 1 && <AreaStep p={p} patch={patch} onNext={() => go(2)} />}
          {step === 2 && <BudgetStep p={p} patch={patch} onNext={() => go(3)} onBack={() => go(1)} />}
          {step === 3 && <HomeStep p={p} patch={patch} onNext={() => go(4)} onBack={() => go(2)} />}
          {step === 4 && <MustStep p={p} patch={patch} onNext={() => go(5)} onBack={() => go(3)} />}
          {step === 5 && <WishStep p={p} patch={patch} onNext={() => go(6)} onBack={() => go(4)} />}
          {step === 6 && (
            <TextStep
              p={p}
              patch={patch}
              onBack={() => go(5)}
              onEdit={go}
              onConfirm={(final) => {
                setProfile({ ...final, status: 'active' })
                go(7)
              }}
            />
          )}
          {step === 7 && <FindingStep p={p} />}
        </div>
      </Container>
    </div>
  )
}

// ---------- Samtalsliknande fråga ----------
function Ask({ q, sub, children }: { q: string; sub?: string; children: ReactNode }) {
  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-petrol-700 text-xs font-bold text-white" aria-hidden>
          {BRAND.name.slice(0, 1)}
        </span>
        <div className="rounded-2xl rounded-tl-md bg-sand-100 px-4 py-3">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{q}</h1>
          {sub && <p className="mt-1 text-[15px] text-ink-muted">{sub}</p>}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </Card>
  )
}

function Nav({ onBack, onNext, disabled, label = 'Fortsätt', hint }: { onBack?: () => void; onNext: () => void; disabled?: boolean; label?: string; hint?: string }) {
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
          {label} <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
      {disabled && hint && <p className="mt-2 text-right text-xs text-ink-muted">{hint}</p>}
    </div>
  )
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={on} className={cn('flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ring-1 transition', on ? 'bg-petrol-700 text-white ring-petrol-700' : 'bg-white text-ink-soft ring-sand-300 hover:ring-ink-faint')}>
      {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      {children}
    </button>
  )
}

type StepProps = { p: BuyerProfile; patch: (x: Partial<BuyerProfile>) => void; onNext: () => void; onBack?: () => void }

// ---------- 1 Område ----------
function AreaStep({ p, patch, onNext }: StepProps) {
  const [q, setQ] = useState('')
  const options = AREAS.filter((a) => a.region === 'Stockholm' && !p.preferredAreas.includes(a.name) && a.name.toLowerCase().includes(q.trim().toLowerCase()))
  const add = (name: string) => {
    patch({ preferredAreas: [...p.preferredAreas, name], wholeStockholm: false })
    setQ('')
  }
  return (
    <Ask q="Var letar du bostad?" sub="Lägg till ett eller flera områden.">
      <div className="flex flex-wrap gap-2">
        {p.preferredAreas.map((a) => (
          <span key={a} className="flex items-center gap-1.5 rounded-full bg-petrol-700 py-2 pl-4 pr-2 text-sm font-medium text-white">
            {a}
            <button onClick={() => patch({ preferredAreas: p.preferredAreas.filter((x) => x !== a) })} className="rounded-full p-0.5 hover:bg-white/20" aria-label={`Ta bort ${a}`}>
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <Chip on={p.wholeStockholm} onClick={() => patch({ wholeStockholm: !p.wholeStockholm, preferredAreas: p.wholeStockholm ? p.preferredAreas : [] })}>
          Hela Stockholm
        </Chip>
      </div>
      {!p.wholeStockholm && (
        <div className="relative mt-4">
          <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-ink-faint" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sök område, t.ex. Aspudden" className="pl-11" />
          <div className="mt-2 flex flex-wrap gap-2">
            {options.slice(0, q ? 8 : 6).map((a) => (
              <button key={a.name} onClick={() => add(a.name)} className="flex items-center gap-1 rounded-full bg-sand-100 px-3 py-1.5 text-sm text-ink-soft hover:bg-sand-200">
                <Plus className="h-3.5 w-3.5" /> {a.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <Nav onNext={onNext} disabled={!p.wholeStockholm && p.preferredAreas.length === 0} hint="Välj minst ett område." />
    </Ask>
  )
}

// ---------- 2 Budget ----------
function MoneyField({ label, value, onChange, hint, suffix = 'kr' }: { label: string; value: number; onChange: (n: number) => void; hint?: string; suffix?: string }) {
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <Input inputMode="numeric" value={value ? formatNumber(value) : ''} onChange={(e) => onChange(parseAmount(e.target.value))} className="pr-16" />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-muted">{suffix}</span>
      </div>
    </Field>
  )
}

function BudgetStep({ p, patch, onNext, onBack }: StepProps) {
  return (
    <Ask q="Vad får bostaden maximalt kosta?">
      <MoneyField label="Maxpris" value={p.maxPrice} onChange={(n) => patch({ maxPrice: n })} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <MoneyField label="Minpris" hint="Valfritt" value={p.minPrice} onChange={(n) => patch({ minPrice: n })} />
        <MoneyField label="Maximal månadsavgift" hint="Valfritt – gäller bostadsrätter" suffix="kr/mån" value={p.maxMonthlyFee} onChange={(n) => patch({ maxMonthlyFee: n })} />
      </div>
      <Nav onBack={onBack} onNext={onNext} disabled={!p.maxPrice || p.minPrice > p.maxPrice} hint="Ange ett maxpris som är högre än minpriset." />
    </Ask>
  )
}

// ---------- 3 Bostad ----------
function HomeStep({ p, patch, onNext, onBack }: StepProps) {
  const toggleType = (t: PropertyType) => patch({ propertyTypes: p.propertyTypes.includes(t) ? p.propertyTypes.filter((x) => x !== t) : [...p.propertyTypes, t] })
  return (
    <Ask q="Vilken typ av bostad söker du?">
      <div className="flex flex-wrap gap-2">
        {PROPERTY_TYPES.map((t) => (
          <Chip key={t} on={p.propertyTypes.includes(t)} onClick={() => toggleType(t)}>
            {t}
          </Chip>
        ))}
        <Chip on={p.propertyTypes.length === 0} onClick={() => patch({ propertyTypes: [] })}>
          Flera typer
        </Chip>
      </div>

      <p className="mb-2 mt-8 font-semibold">Hur många rum behöver du minst?</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => patch({ minRooms: n })} className={cn('h-12 w-14 rounded-xl text-lg font-semibold ring-1', p.minRooms === n ? 'bg-petrol-700 text-white ring-petrol-700' : 'bg-white ring-sand-300 hover:ring-ink-faint')} aria-pressed={p.minRooms === n}>
            {n === 5 ? '5+' : n}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Field label="Minsta boyta" hint="I kvadratmeter">
          <div className="relative">
            <Input inputMode="numeric" value={p.minLivingArea ? String(p.minLivingArea) : ''} onChange={(e) => patch({ minLivingArea: parseAmount(e.target.value) })} className="pr-12" />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-muted">m²</span>
          </div>
        </Field>
        <Field label="Minst antal sovrum" hint="Valfritt">
          <Input inputMode="numeric" value={p.minBedrooms ? String(p.minBedrooms) : ''} onChange={(e) => patch({ minBedrooms: parseAmount(e.target.value) })} placeholder="T.ex. 2" />
        </Field>
      </div>
      <Nav onBack={onBack} onNext={onNext} />
    </Ask>
  )
}

// ---------- 4 Måste finnas ----------
function MustStep({ p, patch, onNext, onBack }: StepProps) {
  const [other, setOther] = useState(!!p.otherRequirement)
  return (
    <Ask q="Vad måste bostaden ha?" sub="Vi kommer inte rekommendera bostäder som saknar dessa egenskaper.">
      <div className="flex flex-wrap gap-2">
        {REQUIREMENTS.map((r) => {
          const on = p.requiredFeatures.includes(r.id)
          return (
            <Chip key={r.id} on={on} onClick={() => patch({ requiredFeatures: on ? p.requiredFeatures.filter((x) => x !== r.id) : [...p.requiredFeatures, r.id] })}>
              {r.label}
            </Chip>
          )
        })}
        <Chip on={other} onClick={() => setOther(!other)}>
          Annat
        </Chip>
      </div>
      {other && (
        <Field label="Vad mer måste finnas?" className="mt-4" hint="Vi kan inte alltid kontrollera fritext automatiskt – det sparas som en anteckning i din profil.">
          <Input value={p.otherRequirement} onChange={(e) => patch({ otherRequirement: e.target.value })} />
        </Field>
      )}
      <p className="mt-5 text-sm text-ink-muted">Tips: välj bara det som verkligen är ett måste. Ju fler krav, desto färre bostäder.</p>
      <Nav onBack={onBack} onNext={onNext} />
    </Ask>
  )
}

// ---------- 5 Önskemål ----------
function WishStep({ p, patch, onNext, onBack }: StepProps) {
  const current = (id: PreferenceId) => p.preferredFeatures.find((x) => x.id === id)?.priority
  const set = (id: PreferenceId, pr: Priority) => {
    const without = p.preferredFeatures.filter((x) => x.id !== id)
    patch({ preferredFeatures: current(id) === pr ? without : [...without, { id, priority: pr }] })
  }
  return (
    <Ask q="Vad är viktigt för dig?" sub="Det behöver inte vara ett absolut krav, men vi prioriterar bostäder som matchar.">
      <ul className="divide-y divide-sand-200 rounded-2xl border border-sand-200">
        {SHOWN_PREFS.map((pref) => {
          const c = current(pref.id)
          return (
            <li key={pref.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className={cn('font-medium', c ? 'text-ink' : 'text-ink-soft')}>{pref.label}</span>
              <div className="flex gap-1.5">
                {(
                  [
                    ['high', 'Mycket viktigt'],
                    ['nice', 'Bra om det finns'],
                  ] as [Priority, string][]
                ).map(([pr, label]) => (
                  <button key={pr} onClick={() => set(pref.id, pr)} aria-pressed={c === pr} className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition', c === pr ? (pr === 'high' ? 'bg-petrol-700 text-white ring-petrol-700' : 'bg-mint-200 text-petrol-900 ring-mint-300') : 'bg-white text-ink-muted ring-sand-300 hover:ring-ink-faint')}>
                    {label}
                  </button>
                ))}
              </div>
            </li>
          )
        })}
      </ul>
      <Nav onBack={onBack} onNext={onNext} />
    </Ask>
  )
}

// ---------- 6 Fritext + AI-tolkning ----------
interface Accepted {
  patch: Record<string, boolean>
  required: Record<string, boolean>
  tags: Record<string, boolean>
}

function TextStep({ p, patch, onBack, onConfirm, onEdit }: { p: BuyerProfile; patch: (x: Partial<BuyerProfile>) => void; onBack: () => void; onConfirm: (p: BuyerProfile) => void; onEdit: (step: number) => void }) {
  const [phase, setPhase] = useState<'write' | 'thinking' | 'review'>('write')
  const [interp, setInterp] = useState<Interpretation | null>(null)
  const [acc, setAcc] = useState<Accepted>({ patch: {}, required: {}, tags: {} })

  const run = () => {
    setPhase('thinking')
    setTimeout(() => {
      const r = interpretFreeText(p.freeText)
      setInterp(r)
      setAcc({
        patch: Object.fromEntries(Object.keys(r.patch).map((k) => [k, true])),
        required: Object.fromEntries(r.addRequired.map((k) => [k, true])),
        tags: Object.fromEntries(r.textTags.map((t) => [t.id, true])),
      })
      setPhase('review')
    }, 1400)
  }

  // Profilen som den blir om köparen säger "Ja, det stämmer".
  const final: BuyerProfile = (() => {
    if (!interp) return p
    const pt: Partial<BuyerProfile> = {}
    for (const [k, v] of Object.entries(interp.patch)) if (acc.patch[k]) (pt as Record<string, number>)[k] = v as number
    const req = [...p.requiredFeatures, ...interp.addRequired.filter((r) => acc.required[r] && !p.requiredFeatures.includes(r))]
    const tags: TextTag[] = interp.textTags.filter((t) => acc.tags[t.id])
    return { ...p, ...pt, requiredFeatures: req, textTags: tags }
  })()

  if (phase === 'write')
    return (
      <Ask q="Beskriv ditt drömboende" sub="Skriv precis som du skulle beskriva det för en vän. Vi hjälper dig att översätta det till en bostadssökning.">
        <Textarea rows={7} value={p.freeText} onChange={(e) => patch({ freeText: e.target.value })} placeholder={PLACEHOLDER} />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button onClick={() => patch({ freeText: DEMO_TEXT })} className="text-sm font-semibold text-petrol-700 hover:underline">
            Använd exempeltext (demo)
          </button>
          <span className="text-xs text-ink-muted">{p.freeText.length} tecken</span>
        </div>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Tillbaka
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="secondary" size="lg" onClick={run}>
              Hoppa över
            </Button>
            <Button size="lg" onClick={run} disabled={!p.freeText.trim()}>
              <Sparkles className="h-5 w-5" /> Tolka med AI
            </Button>
          </div>
        </div>
      </Ask>
    )

  if (phase === 'thinking')
    return (
      <Card className="flex flex-col items-center px-6 py-16 text-center">
        <Spinner className="h-8 w-8 text-petrol-600" />
        <p className="mt-4 text-lg font-semibold">Vi läser det du skrivit…</p>
        <p className="text-sm text-ink-muted">Och översätter det till krav och önskemål.</p>
      </Card>
    )

  // ---- Har vi förstått dig rätt? ----
  const i = interp!
  const fromText = (on: boolean) => on && <span className="ml-1.5 rounded bg-mint-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-petrol-800">Från din text</span>
  const must: ReactNode[] = [
    <Row key="price" label={`Max ${formatSEK(final.maxPrice)}`} extra={fromText(!!i.patch.maxPrice && acc.patch.maxPrice)} />,
    <Row key="area" label={final.wholeStockholm ? 'Hela Stockholm' : final.preferredAreas.join(', ')} />,
    ...(final.propertyTypes.length ? [<Row key="type" label={final.propertyTypes.join(' eller ')} />] : []),
    <Row key="rooms" label={`Minst ${final.minRooms} rum`} extra={fromText(!!i.patch.minRooms && acc.patch.minRooms)} />,
    <Row key="size" label={`Minst ${final.minLivingArea} m²`} extra={fromText(!!i.patch.minLivingArea && acc.patch.minLivingArea)} />,
    ...(final.minBedrooms ? [<Row key="bed" label={`Minst ${final.minBedrooms} sovrum`} extra={fromText(!!i.patch.minBedrooms && acc.patch.minBedrooms)} />] : []),
    ...final.requiredFeatures.map((r) => <Row key={r} label={reqLabel(r)} extra={fromText(i.addRequired.includes(r))} />),
  ]
  // Taggar från texten som motsvarar något som redan finns i profilen visas inte dubbelt.
  const newTags = final.textTags.filter((t) => !t.maps || !final.preferredFeatures.some((x) => x.id === t.maps))
  const high = [...final.preferredFeatures.filter((x) => x.priority === 'high').map((x) => prefLabel(x.id))]
  const nice = [...final.preferredFeatures.filter((x) => x.priority === 'nice').map((x) => prefLabel(x.id))]

  const toggles: { key: string; label: string; on: boolean; flip: () => void; note?: string }[] = [
    ...Object.entries(i.patch).map(([k, v]) => ({
      key: `p-${k}`,
      label: k === 'maxPrice' ? `Max ${formatSEK(v as number)}` : k === 'minRooms' ? `Minst ${v} rum` : k === 'minBedrooms' ? `Minst ${v} sovrum` : `Minst ${v} m²`,
      on: acc.patch[k],
      flip: () => setAcc({ ...acc, patch: { ...acc.patch, [k]: !acc.patch[k] } }),
    })),
    ...i.addRequired.map((r) => ({ key: `r-${r}`, label: `${reqLabel(r)} (krav)`, on: acc.required[r], flip: () => setAcc({ ...acc, required: { ...acc.required, [r]: !acc.required[r] } }) })),
    ...i.textTags.map((t) => ({ key: `t-${t.id}`, label: `${t.label} (${t.priority === 'high' ? 'mycket viktigt' : 'önskemål'})`, on: acc.tags[t.id], flip: () => setAcc({ ...acc, tags: { ...acc.tags, [t.id]: !acc.tags[t.id] } }), note: t.note })),
  ]

  return (
    <div className="space-y-6">
      <Ask q="Har vi förstått dig rätt?" sub="Så här tolkar vi din sökning. Inget sparas förrän du bekräftar.">
        {p.freeText.trim() && (
          <div className="mb-6 rounded-2xl border border-sand-300 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-petrol-600">Det här hittade vi i din text</p>
            {toggles.length ? (
              <ul className="mt-3 space-y-2">
                {toggles.map((t) => (
                  <li key={t.key}>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input type="checkbox" checked={t.on} onChange={t.flip} className="mt-1 h-4 w-4 accent-petrol-700" />
                      <span>
                        <span className={cn('text-[15px]', !t.on && 'text-ink-faint line-through')}>{t.label}</span>
                        {t.note ? <span className="block text-xs text-ink-muted">{t.note}</span> : null}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">Vi hittade inget nytt utöver det du redan valt – din profil ser likadan ut.</p>
            )}
            {i.notes.map((n) => (
              <p key={n} className="mt-3 flex items-start gap-2 rounded-lg bg-sand-100 px-3 py-2 text-xs text-ink-soft">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-petrol-600" /> {n}
              </p>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Group title="Måste">{must}</Group>
          <Group title="Mycket viktigt">
            {[...high, ...newTags.filter((t) => t.priority === 'high').map((t) => t.label)].filter((v, idx, arr) => arr.indexOf(v) === idx).map((h) => (
              <Row key={h} label={h} />
            ))}
          </Group>
          <Group title="Önskemål">
            {[...nice, ...newTags.filter((t) => t.priority === 'nice').map((t) => t.label)].filter((v, idx, arr) => arr.indexOf(v) === idx).map((h) => (
              <Row key={h} label={h} />
            ))}
          </Group>
        </div>
        {final.otherRequirement && <p className="mt-4 text-sm text-ink-muted">Anteckning: {final.otherRequirement}</p>}
      </Ask>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setPhase('write')}>
            Ändra
          </Button>
          <Button variant="ghost" onClick={() => onEdit(4)}>
            Ändra krav
          </Button>
          <Button variant="ghost" onClick={() => onEdit(5)}>
            Ändra önskemål
          </Button>
        </div>
        <Button size="lg" onClick={() => onConfirm(final)}>
          <Check className="h-5 w-5" /> Ja, det stämmer
        </Button>
      </div>
    </div>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  const empty = Array.isArray(children) && children.length === 0
  return (
    <div className="rounded-2xl bg-sand-50 p-4 ring-1 ring-inset ring-sand-200">
      <p className="mb-2 text-sm font-bold">{title}</p>
      {empty ? <p className="text-sm text-ink-faint">Inget valt</p> : <ul className="space-y-1.5">{children}</ul>}
    </div>
  )
}

function Row({ label, extra }: { label: string; extra?: ReactNode }) {
  return (
    <li className="flex items-start gap-1.5 text-[15px]">
      <Check className="mt-1 h-4 w-4 shrink-0 text-petrol-600" strokeWidth={3} />
      <span>
        {label}
        {extra}
      </span>
    </li>
  )
}

// ---------- 7 Matchningar ----------
function FindingStep({ p }: { p: BuyerProfile }) {
  const navigate = useNavigate()
  const { listings } = useListings()
  const count = matchAll(listings, p).length
  useEffect(() => {
    const t = setTimeout(() => navigate('/mina-matchningar?ny=1'), 1800)
    return () => clearTimeout(t)
  }, [navigate])
  return (
    <Card className="flex flex-col items-center px-6 py-16 text-center">
      <Spinner className="h-8 w-8 text-petrol-600" />
      <p className="mt-4 text-lg font-semibold">Vi letar bland {listings.length} bostäder…</p>
      <p className="text-sm text-ink-muted">Först filtrerar vi på dina krav, sedan jämför vi dina önskemål.</p>
      <p className="mt-6 text-3xl font-bold text-petrol-700 animate-pop">{count} bostäder matchar din profil</p>
    </Card>
  )
}
