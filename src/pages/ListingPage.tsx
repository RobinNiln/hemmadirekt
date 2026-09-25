import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Calendar, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Eye, Gavel, Grid2x2, Hand, Heart, MessageSquare, ShieldCheck, Smartphone, Sparkles, Users, X } from 'lucide-react'
import { Badge, Button, Card, Container, Field, Input, Modal, Spinner, Textarea, cn } from '../components/ui'
import { Photo } from '../components/Photo'
import { DismissModal, MatchExplanation } from '../components/Match'
import { useListings } from '../state/useListings'
import { useSale } from '../state/SaleContext'
import { PurchaseRequestModal, BindingNote } from '../components/PurchaseRequest'
import { useBuyer, type BuyerRequest } from '../state/BuyerContext'
import { matchListing } from '../lib/matching'
import { featureLabel } from '../data/features'
import { formatDateLong, formatDateShort, formatSEK, nowTime, parseAmount, uid } from '../lib/format'
import { BRAND } from '../config/brand'
import type { Listing } from '../data/listings'
import NotFound from './NotFound'

type ModalKind = 'viewing' | 'accept' | 'offer' | 'contact' | 'interest'

export interface DealInfo {
  inProgress: boolean // säljaren har valt en köpare
  mine: boolean // …och det är du
  myRequest?: BuyerRequest // din aktiva förfrågan på bostaden
  onWaitlist: boolean
}

export default function ListingPage() {
  const { id } = useParams()
  const location = useLocation()
  const { listings, ownId } = useListings()
  const { buyer, markSeen, joinWaitlist } = useBuyer()
  const { state, dispatch } = useSale()
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
  const accepted = isOwn ? state.bids.find((b) => b.id === state.acceptedBidId) : undefined
  const myRequest = buyer.requests.find((r) => r.listingId === listing.id && r.status !== 'Tillbakadragen')
  const deal: DealInfo = {
    inProgress: !!accepted,
    mine: !!accepted && accepted.bidderId === 'demo-buyer',
    myRequest,
    onWaitlist: buyer.waitlist.includes(listing.id),
  }
  const waitlist = () => {
    joinWaitlist(listing.id)
    if (isOwn) dispatch({ type: 'NOTIFY', text: `${buyer.name} har anmält fortsatt intresse (reservlista).`, link: '/min-forsaljning/forfragningar' })
  }

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
      <ListingBody listing={listing} match={match} onAction={setModal} deal={deal} onWaitlist={waitlist} />
      <ViewingModal listing={listing} isOwn={isOwn} open={modal === 'viewing'} onClose={() => setModal(null)} />
      <PurchaseRequestModal listing={listing} kind="accept" isOwn={isOwn} open={modal === 'accept'} onClose={() => setModal(null)} />
      <PurchaseRequestModal listing={listing} kind="offer" isOwn={isOwn} open={modal === 'offer'} onClose={() => setModal(null)} />
      <ContactModal open={modal === 'contact'} onClose={() => setModal(null)} />
      <InterestModal listing={listing} isOwn={isOwn} open={modal === 'interest'} onClose={() => setModal(null)} />
    </div>
  )
}

// Själva annonsen. Används både på objektsidan och i säljarens förhandsgranskning.
export function ListingBody({ listing, match, onAction, preview, deal, onWaitlist }: { listing: Listing; match?: ReturnType<typeof matchListing> | null; onAction?: (m: ModalKind) => void; preview?: boolean; deal?: DealInfo; onWaitlist?: () => void }) {
  const fixed = (listing.priceType ?? 'Fast pris') === 'Fast pris'
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
          <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-2">
            <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">{formatSEK(listing.price)}</p>
            <PriceBadge fixed={fixed} />
          </div>
          <p className="mt-2 text-ink-soft">{fixed ? 'Det här är priset säljaren vill ha.' : 'Säljarens önskade pris. Du kan acceptera det eller lämna ett eget erbjudande.'}</p>

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

        {/* CTA-BOX – fast pris är huvudmodellen */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden">
            <div className="border-b border-sand-200 bg-sand-50 px-6 py-5">
              <PriceBadge fixed={fixed} />
              <p className="mt-2 text-3xl font-extrabold tracking-tight">{formatSEK(listing.price)}</p>
              <p className="text-sm text-ink-muted">{fixed ? 'Priset säljaren vill ha för bostaden.' : 'Säljaren tar emot erbjudanden.'}</p>
            </div>
            <div className="p-6">
              {deal?.mine ? (
                <div className="rounded-xl bg-mint-100 p-4">
                  <p className="font-bold text-petrol-900">Säljaren går vidare med dig</p>
                  <p className="mt-1 text-sm text-petrol-800">Nästa steg är att skapa köpekontraktet.</p>
                  <Button to="/mina-affarer" size="sm" className="mt-3">
                    Visa din affär
                  </Button>
                </div>
              ) : deal?.inProgress ? (
                <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
                  <p className="flex items-center gap-2 font-bold text-amber-900">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Affär pågår
                  </p>
                  <p className="mt-1 text-sm text-amber-900/90">Säljaren har valt att gå vidare med en köpare.</p>
                  {deal.onWaitlist ? (
                    <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-petrol-700">
                      <Check className="h-4 w-4" /> Du står på reservlistan
                    </p>
                  ) : (
                    <Button variant="secondary" size="sm" className="mt-3" onClick={onWaitlist} disabled={preview}>
                      Anmäl fortsatt intresse
                    </Button>
                  )}
                </div>
              ) : deal?.myRequest ? (
                <div className="rounded-xl bg-petrol-50 p-4 ring-1 ring-petrol-100">
                  <p className="font-bold text-petrol-900">{deal.myRequest.kind === 'offer' ? 'Ditt erbjudande är skickat' : 'Din köpförfrågan är skickad'}</p>
                  <p className="mt-1 text-sm text-petrol-800">
                    {formatSEK(deal.myRequest.amount)} · Väntar på säljaren
                  </p>
                  <Button to="/mina-affarer" size="sm" variant="secondary" className="mt-3">
                    Visa min förfrågan
                  </Button>
                </div>
              ) : (
                <>
                  <Button full size="lg" onClick={() => act(fixed ? 'accept' : 'offer')} disabled={preview} className="h-auto min-h-14 whitespace-normal py-3 text-left">
                    {fixed ? `Jag vill köpa för ${formatSEK(listing.price)}` : 'Lämna erbjudande'}
                  </Button>
                  {fixed && <p className="mt-2 text-sm text-ink-soft">Slipp traditionell budgivning. Om säljaren går vidare med dig går ni direkt mot kontrakt.</p>}
                  <Button full variant="secondary" className="mt-3" onClick={() => act(fixed ? 'offer' : 'accept')} disabled={preview}>
                    {fixed ? 'Lämna annat erbjudande' : `Köp för önskat pris`}
                  </Button>
                </>
              )}
              <BindingNote className="mt-4" />
              <div className="mt-5 space-y-1 border-t border-sand-200 pt-4">
                <Button full variant="ghost" onClick={() => act('viewing')} disabled={preview}>
                  <Calendar className="h-4 w-4" /> Boka visning
                </Button>
                <Button full variant="ghost" onClick={() => act('interest')} disabled={preview || shared}>
                  <Hand className="h-4 w-4" /> {shared ? 'Du har delat din profil ✓' : 'Jag är intresserad'}
                </Button>
                <Button full variant="ghost" onClick={() => act('contact')} disabled={preview}>
                  <MessageSquare className="h-4 w-4" /> Kontakta säljaren
                </Button>
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-mint-100/70 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-petrol-700" />
                <div>
                  <p className="text-sm font-semibold text-petrol-800">Säljaren använder {BRAND.name}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-petrol-800/80">Alla köpare legitimeras. Varje köpförfrågan får en tidsstämpel och sparas.</p>
                </div>
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

export function PriceBadge({ fixed }: { fixed: boolean }) {
  return fixed ? (
    <span className="mb-1.5 inline-flex rounded-full bg-petrol-700 px-3 py-1 text-xs font-bold text-white">Fast pris</span>
  ) : (
    <span className="mb-1.5 inline-flex rounded-full bg-sand-200 px-3 py-1 text-xs font-bold text-ink-soft">Tar emot erbjudanden</span>
  )
}
