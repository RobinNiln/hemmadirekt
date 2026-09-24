import { useState } from 'react'
import { BadgeCheck, Bell, CalendarDays, Check, EyeOff, Landmark, Lock, Send, Users } from 'lucide-react'
import { Button, Card, PageHeader, cn } from '../../components/ui'
import { MatchBadge } from '../../components/Match'
import { useSale } from '../../state/SaleContext'
import { useBuyer } from '../../state/BuyerContext'
import { listingFromSale } from '../../state/useListings'
import { describeBuyer, matchBuyers, type BankMatch } from '../../lib/buyerBank'
import { DEMO_SHARED_INTERESTS, type SharedInterest } from '../../data/buyers'
import { RINGVAGEN_ID } from '../../data/listings'
import { EmptyPanel } from './DashboardLayout'

// Köparbanken ur säljarens perspektiv. Anonymt tills köparen själv delar sin profil.

export function useSellerMatches() {
  const { state } = useSale()
  const { buyer } = useBuyer()
  const bank = matchBuyers(listingFromSale(state))
  const shared: SharedInterest[] = [
    ...(buyer.shared.includes(RINGVAGEN_ID) ? [{ id: 'me', firstName: buyer.name, verified: true, desiredAccess: 'Flexibelt', financing: 'Lånelöfte registrerat' as const, sharedAgo: 'nyss' }] : []),
    ...(state.marketSimulated ? DEMO_SHARED_INTERESTS : []),
  ]
  return { bank, shared }
}

type Filter = 'alla' | 'Mycket bra match' | 'Bra match' | 'Möjlig match'

export default function MatchingBuyers() {
  const { state } = useSale()
  const { bank, shared } = useSellerMatches()
  const [filter, setFilter] = useState<Filter>('alla')
  const [invited, setInvited] = useState<string[]>([])

  if (!state.published || state.mode === 'direct') {
    return (
      <div className="space-y-6">
        <PageHeader title="Matchande köpare" />
        <EmptyPanel icon={<Users className="h-7 w-7" />} title="Publicera bostaden först" text="När annonsen är publicerad matchar vi den mot alla registrerade köpare och visar här hur många som söker en bostad som din.">
          <Button to="/salj/start">Lägg upp bostad</Button>
        </EmptyPanel>
      </div>
    )
  }

  const list = bank.list.filter((m) => filter === 'alla' || m.match.level === filter)

  return (
    <div className="space-y-6">
      <PageHeader title="Matchande köpare" subtitle="Registrerade köpare vars sökprofil passar din bostad. Du ser bara vad de söker – aldrig vilka de är." />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl bg-petrol-800 p-6 text-white shadow-card">
          <p className="text-sm text-petrol-200">Köparbanken</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{bank.total} personer söker en bostad som din</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-2xl font-bold">{bank.veryGood}</p>
              <p className="text-sm text-petrol-100">mycket bra matchningar</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-2xl font-bold">{bank.possible}</p>
              <p className="text-sm text-petrol-100">möjliga matchningar</p>
            </div>
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-mint-200">
            <Bell className="h-4 w-4" /> {bank.notified} matchande köpare har fått en notis om din bostad
          </p>
        </div>
        <Card className="p-6">
          <p className="flex items-center gap-2 font-bold">
            <Lock className="h-4 w-4 text-petrol-600" /> Så skyddar vi köparna
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li className="flex gap-2">
              <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" /> Namn och kontaktuppgifter visas aldrig i köparbanken.
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" /> Först när en köpare själv klickar "Jag är intresserad" och godkänner ser du förnamn, verifiering, önskat tillträde och finansieringsstatus.
            </li>
          </ul>
        </Card>
      </div>

      {/* Köpare som delat sin profil */}
      <section>
        <h2 className="text-xl font-bold">Har visat intresse ({shared.length})</h2>
        <p className="text-sm text-ink-muted">De här köparna har själva valt att dela sin profil med dig.</p>
        {shared.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {shared.map((s) => (
              <Card key={s.id} className={cn('p-5', s.id === 'me' && 'ring-2 ring-petrol-300')}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-petrol-100 font-bold text-petrol-800">{s.firstName[0]}</span>
                  <div>
                    <p className="font-bold">{s.firstName}</p>
                    <p className="text-xs text-ink-muted">Delade {s.sharedAgo}</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  <li className="flex items-center gap-1.5 text-petrol-700">
                    <BadgeCheck className="h-4 w-4" /> Verifierad med BankID
                  </li>
                  <li className="flex items-center gap-1.5 text-ink-soft">
                    <CalendarDays className="h-4 w-4 text-ink-muted" /> Tillträde: {s.desiredAccess}
                  </li>
                  <li className="flex items-center gap-1.5 text-ink-soft">
                    <Landmark className="h-4 w-4 text-ink-muted" /> {s.financing}
                  </li>
                </ul>
                {invited.includes(s.id) ? (
                  <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-petrol-700">
                    <Check className="h-4 w-4" /> Inbjudan skickad
                  </p>
                ) : (
                  <Button size="sm" variant="secondary" full className="mt-4" onClick={() => setInvited([...invited, s.id])}>
                    <Send className="h-4 w-4" /> Bjud in till visning
                  </Button>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mt-4 p-6 text-sm text-ink-muted">Ingen har delat sin profil än. Köpare som klickar "Jag är intresserad" på din annons dyker upp här.</Card>
        )}
      </section>

      {/* Anonyma matchningar */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Anonyma matchningar</h2>
            <p className="text-sm text-ink-muted">Sökprofiler från köparbanken som passar din bostad.</p>
          </div>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {(['alla', 'Mycket bra match', 'Bra match', 'Möjlig match'] as Filter[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn('shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1', filter === f ? 'bg-petrol-700 text-white ring-petrol-700' : 'bg-white text-ink-soft ring-sand-300')}>
                {f === 'alla' ? `Alla (${bank.total})` : f.replace(' match', '')}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m) => (
            <BuyerCard key={m.buyer.id} m={m} />
          ))}
        </div>
      </section>
    </div>
  )
}

export function BuyerCard({ m }: { m: BankMatch }) {
  const d = describeBuyer(m.buyer)
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold">Köpare #{m.buyer.publicId}</p>
        <MatchBadge level={m.match.level} />
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="text-xs text-ink-muted">Söker</dt>
          <dd className="font-medium">{d.seeking}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">Maxpris</dt>
          <dd className="font-medium">{d.maxPrice}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">Viktigt</dt>
          <dd className="font-medium">{d.important.join(' · ')}</dd>
        </div>
      </dl>
    </Card>
  )
}
