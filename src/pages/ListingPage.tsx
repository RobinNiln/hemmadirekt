import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Calendar, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Eye, Gavel, Grid2x2, Hand, Heart, MessageSquare, ShieldCheck, Smartphone, Sparkles, Users, X } from 'lucide-react'
import { Badge, Button, Card, Container, Field, Input, Modal, Spinner, Textarea, cn } from '../components/ui'
import { Photo } from '../components/Photo'
import { DismissModal, MatchExplanation } from '../components/Match'
import { useListings } from '../state/useListings'
import { useSale } from '../state/SaleContext'
import { useBuyer } from '../state/BuyerContext'
import { matchListing } from '../lib/matching'
import { featureLabel } from '../data/features'
import { formatDateLong, formatDateShort, formatSEK, nowTime, parseAmount, uid } from '../lib/format'
import { BRAND } from '../config/brand'
import type { Listing } from '../data/listings'
import NotFound from './NotFound'

type ModalKind = 'viewing' | 'bid' | 'contact' | 'interest'

export default function ListingPage() {
  const { id } = useParams()
  const location = useLocation()
  const { listings, ownId } = useListings()
  const { buyer, markSeen } = useBuyer()
  const listing = listings.find((l) => l.id === id)
  const [modal, setModal] = useState<ModalKind | null>(null)

  useEffect(() => {
    if (listing) markSeen(listing.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing?.id])
  useEffect(() => {
    if (location.hash === '#matchning') setTimeout(() => document.getElementById('matchning')?.scrollIntoView({ behavior: 'smooth' }), 150)
  }, [location.hash, listing?.id])

  if (!listing) return <NotFound />
  const isOwn = listing.id === ownId
  // I demon spelar samma person både säljare och köpare, så matchningen visas även på den egna annonsen.
  const match = buyer.profile ? matchListing(listing, buyer.profile) : null

  return (
    <div className="pb-10">
      <Container className="pt-6">
        <Link to={buyer.profile ? '/mina-matchningar' : '/kopa'} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> {buyer.profile ? 'Mina matchningar' : 'Alla bostäder'}
        </Link>
        {isOwn && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-petrol-700 px-4 py-3 text-sm text-white">
            <span>Det här är din annons – så här ser köparna den.{buyer.profile && ' (I demon ser du även din köparmatchning nedan.)'}</span>
            <Link to="/min-forsaljning" className="font-semibold text-mint-200 hover:underline">
              Till Min försäljning →
            </Link>
          </div>
        )}
      </Container>
      <ListingBody listing={listing} match={match} onAction={setModal} />
      <ViewingModal listing={listing} isOwn={isOwn} open={modal === 'viewing'} onClose={() => setModal(null)} />
      <BidModal listing={listing} isOwn={isOwn} open={modal === 'bid'} onClose={() => setModal(null)} />
      <ContactModal open={modal === 'contact'} onClose={() => setModal(null)} />
      <InterestModal listing={listing} isOwn={isOwn} open={modal === 'interest'} onClose={() => setModal(null)} />
    </div>
  )
}

// Själva annonsen. Används både på objektsidan och i säljarens förhandsgranskning.
export function ListingBody({ listing, match, onAction, preview }: { listing: Listing; match?: ReturnType<typeof matchListing> | null; onAction?: (m: ModalKind) => void; preview?: boolean }) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const { buyer, toggleSave } = useBuyer()
  const [dismissOpen, setDismissOpen] = useState(false)
  const pricePerSqm = Math.round(listing.price / listing.size)
  const isBrf = listing.tenure === 'Bostadsrätt'
  const act = (m: ModalKind) => !preview && onAction?.(m)
  const saved = buyer.saved.includes(listing.id)
  const shared = buyer.shared.includes(listing.id)
  const rot = (i: number) => listing.imageRotations?.[i] ?? 0

  const facts: [string, string][] = [
    ['Bostadstyp', listing.type],
    ['Upplåtelseform', listing.tenure],
    ['Rum', `${listing.rooms} rum, varav ${listing.bedrooms} sovrum`],
    ['Boyta', `${listing.size} m²`],
    ...(listing.plotArea ? ([['Tomtarea', `${listing.plotArea} m²`]] as [string, string][]) : []),
    ...(listing.floor ? ([['Våning', `${listing.floor}${listing.elevator ? ', hiss finns' : ', ingen hiss'}`]] as [string, string][]) : []),
    ['Byggår', String(listing.built)],
    [isBrf ? 'Avgift' : 'Driftkostnad', `${formatSEK(listing.fee)}/mån`],
    ...(listing.association ? ([['Förening', listing.association]] as [string, string][]) : []),
  ]

  return (
    <>
      {/* GALLERI */}
      <Container className="mt-5">
        <div className="relative grid gap-2 overflow-hidden rounded-3xl md:grid-cols-4 md:grid-rows-2">
          <button className="overflow-hidden md:col-span-2 md:row-span-2" onClick={() => setLightbox(0)}>
            <Photo src={listing.images[0]} rotation={rot(0)} alt={listing.street} eager className="aspect-[4/3] h-full w-full md:aspect-auto md:min-h-[440px]" />
          </button>
          {listing.images.slice(1, 5).map((img, i) => (
            <button key={img + i} className="hidden overflow-hidden md:block" onClick={() => setLightbox(i + 1)}>
              <Photo src={img} rotation={rot(i + 1)} alt={`${listing.street} bild ${i + 2}`} className="h-full min-h-[216px] w-full hover:opacity-90" />
            </button>
          ))}
          <Button variant="secondary" size="sm" className="absolute bottom-4 right-4 shadow-card" onClick={() => setLightbox(0)}>
            <Grid2x2 className="h-4 w-4" /> Visa alla {listing.images.length} bilder
          </Button>
        </div>
      </Container>

      <Container className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="green">{listing.type}</Badge>
            {listing.isNew && <Badge>Ny på {BRAND.name}</Badge>}
          </div>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{listing.street}</h1>
          <p className="mt-2 text-lg text-ink-muted">
            {listing.area}, {listing.city}
          </p>
          {listing.headline && <p className="mt-4 text-xl font-semibold text-ink-soft">{listing.headline}</p>}
          <p className="mt-6 text-3xl font-bold tracking-tight">
            {formatSEK(listing.price)} <span className="text-base font-medium text-ink-muted">{listing.priceType ?? 'Utgångspris'}</span>
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-sand-300/70 bg-sand-300/70 sm:grid-cols-3">
            {[
              ['Rum', `${listing.rooms} rum`],
              ['Boyta', `${listing.size} m²`],
              ...(listing.floor ? [['Våning', listing.floor]] : [['Byggår', String(listing.built)]]),
              [isBrf ? 'Avgift' : 'Driftkostnad', `${formatSEK(listing.fee)}/mån`],
              ['Pris per m²', formatSEK(pricePerSqm)],
              ['Sovrum', String(listing.bedrooms)],
            ].map(([k, v]) => (
              <div key={k} className="bg-white px-4 py-4">
                <dt className="text-xs text-ink-muted">{k}</dt>
                <dd className="mt-0.5 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          {match && (
            <div className="mt-10">
              <MatchExplanation match={match} />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => toggleSave(listing.id)}>
                  <Heart className={cn('h-4 w-4', saved && 'fill-rose-600 text-rose-600')} /> {saved ? 'Sparad' : 'Spara'}
                </Button>
                {!buyer.dismissed.some((d) => d.id === listing.id) && (
                  <Button variant="ghost" size="sm" onClick={() => setDismissOpen(true)}>
                    <X className="h-4 w-4" /> Inte för mig
                  </Button>
                )}
              </div>
              <DismissModal listingId={listing.id} open={dismissOpen} onClose={() => setDismissOpen(false)} />
            </div>
          )}

          <section className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight">Om bostaden</h2>
            <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-ink-soft">
              {(listing.description || 'Säljaren har inte skrivit någon beskrivning än.').split('\n').filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          {listing.features.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight">Egenskaper</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {listing.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-medium text-ink-soft ring-1 ring-sand-300">
                    <Check className="h-3.5 w-3.5 text-petrol-600" strokeWidth={3} /> {featureLabel(f)}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-ink-muted">Egenskaperna är angivna och bekräftade av säljaren.</p>
            </section>
          )}

          <section className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight">Fakta</h2>
            <dl className="mt-4 divide-y divide-sand-200 rounded-2xl border border-sand-300/70 bg-white px-5">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3.5 text-[15px]">
                  <dt className="text-ink-muted">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight">Visningar</h2>
            <Card className="mt-4 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-petrol-50 text-petrol-800">
                  <span className="text-[10px] font-bold uppercase">{formatDateShort(listing.viewing.date).split(' ')[1]?.slice(0, 3)}</span>
                  <span className="text-xl font-bold leading-none">{formatDateShort(listing.viewing.date).split(' ')[0]}</span>
                </div>
                <div>
                  <p className="font-semibold">{formatDateLong(listing.viewing.date)}</p>
                  <p className="text-ink-muted">
                    {listing.viewing.start}–{listing.viewing.end}
                  </p>
                  <p className="mt-1 text-sm font-medium text-petrol-700">{listing.viewing.spotsLeft} platser kvar</p>
                </div>
              </div>
              <Button onClick={() => act('viewing')} disabled={preview}>
                Boka plats
              </Button>
            </Card>
          </section>
        </div>

        {/* CTA-BOX */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <h2 className="text-xl font-bold">Intresserad av bostaden?</h2>
            <p className="mt-1 text-sm text-ink-muted">Boka visning, visa intresse eller lägg ett bud direkt här.</p>
            <div className="mt-5 space-y-2.5">
              <Button full size="lg" onClick={() => act('viewing')} disabled={preview}>
                <Calendar className="h-5 w-5" /> Boka visning
              </Button>
              <Button full size="lg" variant="secondary" onClick={() => act('interest')} disabled={preview || shared}>
                <Hand className="h-5 w-5" /> {shared ? 'Du har visat intresse ✓' : 'Jag är intresserad'}
              </Button>
              <Button full size="lg" variant="accent" onClick={() => act('bid')} disabled={preview}>
                <Gavel className="h-5 w-5" /> Lägg bud
              </Button>
              <Button full variant="ghost" onClick={() => act('contact')} disabled={preview}>
                <MessageSquare className="h-4 w-4" /> Kontakta säljaren
              </Button>
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-mint-100/70 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-petrol-700" />
              <div>
                <p className="text-sm font-semibold text-petrol-800">Säljaren använder {BRAND.name}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-petrol-800/80">Alla budgivare legitimeras. Budhistoriken är öppen och sparas.</p>
              </div>
            </div>
          </Card>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-muted">
            <Users className="h-3.5 w-3.5" /> {preview ? 'Förhandsvisning' : `${listing.daysOnMarket} dagar på ${BRAND.name}`}
          </p>
        </aside>
      </Container>
      <Lightbox listing={listing} index={lightbox} setIndex={setLightbox} />
    </>
  )
}

// "Jag är intresserad" – köparen väljer aktivt att dela sin profil med säljaren.
function InterestModal({ listing, isOwn, open, onClose }: { listing: Listing; isOwn: boolean; open: boolean; onClose: () => void }) {
  const { buyer, share } = useBuyer()
  const { dispatch } = useSale()
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (open) setDone(false)
  }, [open])
  const confirm = () => {
    share(listing.id)
    if (isOwn) {
      dispatch({ type: 'NOTIFY', text: `${buyer.name} har visat intresse och delat sin profil med dig.`, link: '/min-forsaljning/kopare' })
    }
    setDone(true)
  }
  return (
    <Modal open={open} onClose={onClose} title={done ? 'Säljaren har fått ditt intresse' : 'Vill du dela din profil med säljaren?'}>
      {done ? (
        <Done title="Tack!" text="Säljaren ser nu ditt förnamn och de uppgifter du valde att dela. Du får en notis om säljaren hör av sig." onClose={onClose} />
      ) : (
        <div>
          <p className="text-ink-soft">Säljaren får då se:</p>
          <ul className="mt-3 space-y-2 rounded-xl bg-sand-100 p-4 text-[15px]">
            <li className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-petrol-600" /> Förnamn: <span className="font-semibold">{buyer.name}</span>
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-petrol-600" /> Verifieringsstatus: <span className="font-semibold">Verifierad med BankID</span>
            </li>
            <li className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-petrol-600" /> Önskat tillträde: <span className="font-semibold">Flexibelt</span>
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-petrol-600" /> Finansieringsstatus: <span className="font-semibold">Lånelöfte registrerat</span>
            </li>
          </ul>
          <p className="mt-3 text-sm text-ink-muted">Ditt efternamn, personnummer och kontaktuppgifter delas inte. Du kan ångra dig när som helst.</p>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              Inte nu
            </Button>
            <Button onClick={confirm}>Ja, dela min profil</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function Lightbox({ listing, index, setIndex }: { listing: Listing; index: number | null; setIndex: (i: number | null) => void }) {
  const n = listing.images.length
  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((index + 1) % n)
      if (e.key === 'ArrowLeft') setIndex((index - 1 + n) % n)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [index, n, setIndex])

  return (
    <Modal open={index !== null} onClose={() => setIndex(null)} title={`${listing.street} · bild ${(index ?? 0) + 1} av ${n}`} size="lg">
      {index !== null && (
        <div>
          <div className="relative overflow-hidden rounded-xl">
            <Photo key={index} src={listing.images[index]} alt={`Bild ${index + 1}`} className="aspect-[3/2] w-full" eager />
            <button onClick={() => setIndex((index - 1 + n) % n)} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-card" aria-label="Föregående bild">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => setIndex((index + 1) % n)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-card" aria-label="Nästa bild">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {listing.images.map((img, i) => (
              <button key={img + i} onClick={() => setIndex(i)} className={cn('shrink-0 overflow-hidden rounded-lg ring-2', i === index ? 'ring-petrol-600' : 'ring-transparent opacity-70')}>
                <Photo src={img} alt={`Miniatyr ${i + 1}`} className="h-14 w-20" />
              </button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}

function useVerify(open: boolean) {
  const [phase, setPhase] = useState<'intro' | 'verifying' | 'form' | 'done'>('intro')
  useEffect(() => {
    if (open) setPhase('intro')
  }, [open])
  useEffect(() => {
    if (phase !== 'verifying') return
    const t = setTimeout(() => setPhase('form'), 1800)
    return () => clearTimeout(t)
  }, [phase])
  return [phase, setPhase] as const
}

function VerifyStep({ text, onStart, verifying }: { text: string; onStart: () => void; verifying: boolean }) {
  return (
    <div className="py-2 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-petrol-50">
        {verifying ? <Spinner className="h-7 w-7 text-petrol-700" /> : <Smartphone className="h-8 w-8 text-petrol-700" />}
      </div>
      <p className="mt-4 font-semibold">{verifying ? 'Väntar på BankID…' : 'Först behöver vi veta vem du är'}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">{verifying ? 'Öppna BankID-appen på din telefon.' : text}</p>
      {!verifying && (
        <Button className="mt-5" onClick={onStart}>
          Legitimera med BankID
        </Button>
      )}
      <p className="mt-4 text-xs text-ink-faint">Simulerat – ingen riktig BankID-koppling.</p>
    </div>
  )
}

function ViewingModal({ listing, isOwn, open, onClose }: { listing: Listing; isOwn: boolean; open: boolean; onClose: () => void }) {
  const { state, dispatch } = useSale()
  const [phase, setPhase] = useVerify(open)

  const confirm = () => {
    if (isOwn && state.viewing) {
      dispatch({ type: 'SET_VIEWING', viewing: { ...state.viewing, signups: state.viewing.signups + 1 } })
      dispatch({ type: 'NOTIFY', text: 'En ny person har bokat plats på din visning.', link: '/min-forsaljning' })
    }
    setPhase('done')
  }

  return (
    <Modal open={open} onClose={onClose} title="Boka visning">
      {phase === 'intro' || phase === 'verifying' ? (
        <VerifyStep text="Visningsbokning kräver legitimering. Det gör visningen tryggare för både dig och säljaren." verifying={phase === 'verifying'} onStart={() => setPhase('verifying')} />
      ) : phase === 'form' ? (
        <div>
          <p className="text-sm text-ink-muted">Välj visning för {listing.street}</p>
          <label className="mt-3 flex cursor-pointer items-center gap-4 rounded-xl border-2 border-petrol-600 bg-petrol-50/50 p-4">
            <input type="radio" defaultChecked className="accent-petrol-700" name="slot" />
            <div>
              <p className="font-semibold">{formatDateLong(listing.viewing.date)}</p>
              <p className="text-sm text-ink-muted">
                {listing.viewing.start}–{listing.viewing.end} · {listing.viewing.spotsLeft} platser kvar
              </p>
            </div>
          </label>
          <label className="mt-2 flex cursor-pointer items-center gap-4 rounded-xl border border-sand-300 p-4">
            <input type="radio" className="accent-petrol-700" name="slot" />
            <div>
              <p className="font-semibold">Önska privat visning</p>
              <p className="text-sm text-ink-muted">Säljaren återkommer med förslag på tid</p>
            </div>
          </label>
          <Button full size="lg" className="mt-5" onClick={confirm}>
            Bekräfta bokning
          </Button>
        </div>
      ) : (
        <Done title="Du är bokad!" text={`Välkommen på visning ${formatDateLong(listing.viewing.date).toLowerCase()} kl. ${listing.viewing.start}. Vi skickar en påminnelse dagen innan.`} onClose={onClose} />
      )}
    </Modal>
  )
}

function BidModal({ listing, isOwn, open, onClose }: { listing: Listing; isOwn: boolean; open: boolean; onClose: () => void }) {
  const { dispatch, highestBid, state } = useSale()
  const [phase, setPhase] = useVerify(open)
  const current = isOwn && highestBid ? highestBid.amount : null
  const minBid = current ? current + 10000 : Math.round(listing.price * 0.95)
  const [amount, setAmount] = useState('')
  const [access, setAccess] = useState('2026-12-15')
  useEffect(() => {
    if (open) setAmount(String(current ? current + 25000 : listing.price))
  }, [open, current, listing.price])

  const value = parseAmount(amount)
  const tooLow = value < minBid
  const locked = isOwn && state.acceptedBidId !== null

  const submit = () => {
    if (tooLow) return
    if (isOwn) {
      dispatch({
        type: 'ADD_BID',
        bid: { id: uid('b'), bidderId: 'demo-buyer', bidderName: 'Du (demoköpare)', amount: value, time: nowTime(), desiredAccess: access },
      })
    }
    setPhase('done')
  }

  return (
    <Modal open={open} onClose={onClose} title="Lägg bud">
      {locked ? (
        <p className="text-ink-muted">Säljaren har redan accepterat ett bud på den här bostaden. Budgivningen är avslutad.</p>
      ) : phase === 'intro' || phase === 'verifying' ? (
        <VerifyStep text="Alla budgivare legitimeras med BankID. Det gör budgivningen säker och transparent." verifying={phase === 'verifying'} onStart={() => setPhase('verifying')} />
      ) : phase === 'form' ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-sand-100 px-4 py-3">
            <p className="text-xs text-ink-muted">{current ? 'Nuvarande högsta bud' : 'Utgångspris'}</p>
            <p className="text-xl font-bold">{formatSEK(current ?? listing.price)}</p>
          </div>
          <Field label="Ditt bud (kr)" hint={`Lägsta tillåtna bud: ${formatSEK(minBid)}`}>
            <Input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Önskat tillträde">
            <Input type="date" value={access} onChange={(e) => setAccess(e.target.value)} />
          </Field>
          <p className="text-xs text-ink-muted">Ett bud på en bostad är inte juridiskt bindande förrän köpekontraktet är signerat.</p>
          <Button full size="lg" disabled={tooLow} onClick={submit}>
            Lägg bud på {formatSEK(value)}
          </Button>
        </div>
      ) : (
        <Done
          title="Ditt bud är lagt"
          text={isOwn ? 'Budet syns nu i säljarens budgivning (i demon: din egen dashboard).' : `Du har lagt ${formatSEK(value)}. Du får en notis om någon lägger ett högre bud.`}
          onClose={onClose}
          link={isOwn ? { to: '/min-forsaljning/budgivning', label: 'Se budgivningen' } : undefined}
        />
      )}
    </Modal>
  )
}

function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [sent, setSent] = useState(false)
  useEffect(() => {
    if (open) setSent(false)
  }, [open])
  return (
    <Modal open={open} onClose={onClose} title="Kontakta säljaren">
      {sent ? (
        <Done title="Meddelandet är skickat" text="Säljaren får ditt meddelande i sin inkorg på plattformen. Du får svar här och via e-post." onClose={onClose} />
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <Field label="Ditt namn">
            <Input required placeholder="För- och efternamn" />
          </Field>
          <Field label="E-post">
            <Input required type="email" placeholder="namn@exempel.se" />
          </Field>
          <Field label="Meddelande">
            <Textarea required rows={4} defaultValue="Hej! Jag är intresserad av bostaden och undrar om det går att boka en privat visning?" />
          </Field>
          <Button full type="submit">
            Skicka meddelande
          </Button>
        </form>
      )}
    </Modal>
  )
}

function Done({ title, text, onClose, link }: { title: string; text: string; onClose: () => void; link?: { to: string; label: string } }) {
  return (
    <div className="py-2 text-center animate-pop">
      <CheckCircle2 className="mx-auto h-14 w-14 text-petrol-600" />
      <p className="mt-3 text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">{text}</p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        {link && <Button to={link.to}>{link.label}</Button>}
        <Button variant="secondary" onClick={onClose}>
          Stäng
        </Button>
      </div>
      <p className="mt-4 flex items-center justify-center gap-1 text-xs text-ink-faint">
        <Clock className="h-3 w-3" /> {nowTime()}
      </p>
    </div>
  )
}
