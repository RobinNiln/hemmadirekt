import { BadgeCheck, CalendarCheck, FileSignature, FolderLock, Gavel, LayoutTemplate, ListChecks, MessagesSquare, Sparkles, Users, ArrowRight, Handshake } from 'lucide-react'
import { BRAND, PRICES } from '../config/brand'
import { formatSEK } from '../lib/format'
import { Button, Card, Container, Eyebrow } from './ui'

export const FOUR_STEPS = [
  { n: '01', title: 'Skapa din bostad', text: 'Lägg in uppgifter, bilder och fakta. Vi hjälper dig skapa en komplett annons.' },
  { n: '02', title: 'Hitta köpare', text: 'Publicera bostaden, boka visningar och samla intressenter.' },
  { n: '03', title: 'Ta emot bud', text: 'Verifierade köpare kan lägga bud direkt via plattformen.' },
  { n: '04', title: 'Genomför affären', text: 'Vi guidar dig genom avtal, dokument och tillträde.' },
]

export function FourSteps() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {FOUR_STEPS.map((s) => (
        <Card key={s.n} className="p-6">
          <span className="text-sm font-bold text-petrol-600">{s.n}</span>
          <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{s.text}</p>
        </Card>
      ))}
    </div>
  )
}

const FEATURES = [
  { icon: LayoutTemplate, title: 'Annonsverktyg', text: 'Bilder, fakta och beskrivning i en snygg annons – klar på under en timme.' },
  { icon: Sparkles, title: 'AI-hjälp för bostadsbeskrivning', text: 'Få ett genomarbetat textförslag som du kan redigera fritt.' },
  { icon: CalendarCheck, title: 'Visningsbokning', text: 'Köpare bokar tid själva. Du ser alla anmälda på ett ställe.' },
  { icon: Users, title: 'Digital intressentlista', text: 'Se vilka som är intresserade, verifierade och har lånelöfte.' },
  { icon: Gavel, title: 'Budgivning', text: 'Bud läggs digitalt och syns direkt med tid och budgivare.' },
  { icon: BadgeCheck, title: 'Köparverifiering', text: 'Budgivare legitimerar sig innan de kan lägga bud.' },
  { icon: FolderLock, title: 'Dokumenthantering', text: 'Alla dokument för affären samlade och sparade.' },
  { icon: FileSignature, title: 'Avtalsgenerator', text: 'Vi skapar överlåtelseavtalet steg för steg utifrån affären.' },
  { icon: ListChecks, title: 'Checklista inför tillträde', text: 'Du vet alltid vad som är klart och vad som återstår.' },
  { icon: MessagesSquare, title: 'Samlad kommunikation', text: 'Frågor, notiser och besked – allt i samma tråd.' },
]

export function FeatureGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {FEATURES.map(({ icon: Icon, title, text }) => (
        <Card key={title} className="p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-100 text-petrol-700">
            <Icon className="h-5 w-5" />
          </span>
          <h3 className="mt-4 font-bold leading-snug">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{text}</p>
        </Card>
      ))}
    </div>
  )
}

export function CostComparison() {
  const price = 5000000
  const broker = 60000
  const ours = PRICES.sellYourself
  const savings = broker - ours
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div>
        <Eyebrow>Kostnad</Eyebrow>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Varför betala tiotusentals kronor bara för att sälja din bostad?</h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          Med {BRAND.name} betalar du ett fast pris – oavsett vad bostaden säljs för. Du gör visningen själv, vi håller ihop allt annat.
        </p>
        <Button to="/salja" variant="secondary" className="mt-6">
          Räkna på din bostad <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <Card className="p-6 sm:p-8">
        <dl className="divide-y divide-sand-200">
          <div className="flex items-baseline justify-between py-4">
            <dt className="text-ink-muted">Försäljningspris</dt>
            <dd className="text-lg font-semibold">{formatSEK(price)}</dd>
          </div>
          <div className="flex items-baseline justify-between py-4">
            <dt className="text-ink-muted">Traditionellt mäklararvode</dt>
            <dd className="text-lg font-semibold text-ink-soft line-through decoration-ink-faint">ca {formatSEK(broker)}</dd>
          </div>
          <div className="flex items-baseline justify-between py-4">
            <dt className="font-semibold text-petrol-700">{BRAND.name}</dt>
            <dd className="text-lg font-bold text-petrol-700">{formatSEK(ours)}</dd>
          </div>
        </dl>
        <div className="mt-2 rounded-xl bg-mint-100 px-5 py-4">
          <p className="text-sm text-petrol-800">Du sparar cirka</p>
          <p className="text-3xl font-bold tracking-tight text-petrol-800">{formatSEK(Math.round(savings / 1000) * 1000)}</p>
        </div>
        <p className="mt-4 text-xs text-ink-muted">Exemplet är illustrativt. Mäklararvoden varierar.</p>
      </Card>
    </div>
  )
}

export function DirectDealBand() {
  return (
    <div className="overflow-hidden rounded-3xl bg-petrol-800 text-white">
      <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.5fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-mint-200">
            <Handshake className="h-4 w-4" /> Separat tjänst
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Redan hittat en köpare?</h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-petrol-100">
            Om du redan vet vem som ska köpa bostaden behöver du inte betala för marknadsföring och försäljning. Vi hjälper er med avtal, handpenning, dokument och tillträde.
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <p className="text-sm text-petrol-200">Pris</p>
          <p className="mt-1 text-4xl font-bold tracking-tight">Från {formatSEK(PRICES.directDeal)}</p>
          <ul className="mt-4 space-y-1.5 text-sm text-petrol-100">
            <li>✓ Avtalsunderlag och signering</li>
            <li>✓ Dokumenthantering</li>
            <li>✓ Guide ända fram till tillträdet</li>
          </ul>
          <Button to="/genomfor-affaren" variant="accent" size="lg" full className="mt-6">
            Genomför bara affären
          </Button>
        </div>
      </div>
    </div>
  )
}

export function Section({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={className ?? 'py-16 sm:py-24'}>
      <Container>{children}</Container>
    </section>
  )
}
