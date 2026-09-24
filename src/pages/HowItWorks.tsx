import { ArrowRight, CalendarCheck, FileSignature, Gavel, Home, KeyRound, Megaphone, PartyPopper, UserCheck, Wallet } from 'lucide-react'
import { Button, Card, Container, Eyebrow } from '../components/ui'
import { DemoNotice } from '../components/Trust'
import { BRAND } from '../config/brand'

const STEPS = [
  { icon: Home, title: 'Skapa bostaden', text: 'Ange adressen så hämtar vi grunduppgifterna. Du kompletterar med avgift, byggår och önskat pris.', you: 'Fyll i uppgifter', us: 'Hämtar fakta och kontrollerar' },
  { icon: Megaphone, title: 'Publicera', text: 'Ladda upp bilder och få hjälp av AI att skriva beskrivningen. När du är nöjd publicerar du annonsen.', you: 'Bilder och text', us: 'AI-text och snygg annons' },
  { icon: CalendarCheck, title: 'Håll visning', text: 'Välj tid för visning. Köpare bokar plats själva och du ser vilka som kommer.', you: 'Visar bostaden', us: 'Bokning och påminnelser' },
  { icon: Gavel, title: 'Ta emot bud', text: 'Verifierade köpare lägger bud direkt i tjänsten. Alla bud syns med tid och budgivare.', you: 'Följer budgivningen', us: 'Verifierar budgivare' },
  { icon: UserCheck, title: 'Välj köpare', text: 'Du väljer vilket bud du vill gå vidare med. Det behöver inte vara det högsta.', you: 'Accepterar bud', us: 'Visar lånelöfte och tillträdesönskemål' },
  { icon: FileSignature, title: 'Skapa avtal', text: 'Vi bygger överlåtelseavtalet steg för steg: köpare, pris, tillträde och villkor. Sedan signerar ni digitalt.', you: 'Granskar och signerar', us: 'Genererar avtalet' },
  { icon: Wallet, title: 'Hantera handpenning', text: 'Köparen betalar handpenningen, normalt 10 % av priset, och vi registrerar den i affären.', you: 'Bekräftar mottagen', us: 'Underlag och kvitto' },
  { icon: KeyRound, title: 'Förbered tillträde', text: 'En checklista visar vad som ska göras innan nycklarna lämnas över – från BRF-godkännande till mätarställning.', you: 'Förbereder bostaden', us: 'Checklista och dokument' },
  { icon: PartyPopper, title: 'Affären är klar', text: 'Slutbetalningen görs, nycklarna lämnas över och alla dokument sparas i ditt arkiv.', you: 'Lämnar nycklarna', us: 'Arkiverar allt' },
]

export default function HowItWorks() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="max-w-3xl">
        <Eyebrow>Så fungerar det</Eyebrow>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Hela bostadsaffären i nio tydliga steg</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-muted">
          Du behöver inte kunna något om bostadsaffärer i förväg. {BRAND.name} visar alltid var du är, vad du ska göra nu och vad som händer sedan.
        </p>
      </div>

      <ol className="relative mt-14">
        <span className="absolute bottom-6 left-[27px] top-6 w-0.5 bg-gradient-to-b from-petrol-600 via-petrol-300 to-mint-300 sm:left-[31px]" aria-hidden />
        {STEPS.map(({ icon: Icon, title, text, you, us }, i) => (
          <li key={title} className="relative flex gap-5 pb-8 last:pb-0 sm:gap-8">
            <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-petrol-700 text-white shadow-card sm:h-16 sm:w-16">
              <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <Card className="flex-1 p-5 sm:p-6">
              <p className="text-sm font-bold text-petrol-600">Steg {i + 1}</p>
              <h2 className="mt-1 text-xl font-bold sm:text-2xl">{title}</h2>
              <p className="mt-2 leading-relaxed text-ink-muted">{text}</p>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-sand-100 px-3 py-2">
                  <span className="font-semibold">Du:</span> <span className="text-ink-soft">{you}</span>
                </div>
                <div className="rounded-lg bg-mint-100 px-3 py-2 text-petrol-800">
                  <span className="font-semibold">Vi:</span> {us}
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ol>

      <div className="mt-14 flex flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-bold">Redo att börja?</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button to="/salj/start" size="lg">
            Starta din försäljning <ArrowRight className="h-5 w-5" />
          </Button>
          <Button to="/genomfor-affaren" size="lg" variant="secondary">
            Jag har redan en köpare
          </Button>
        </div>
      </div>
      <DemoNotice className="mx-auto mt-12 max-w-2xl" />
    </Container>
  )
}
