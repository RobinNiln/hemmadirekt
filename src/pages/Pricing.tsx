import { Check } from 'lucide-react'
import { Button, Card, Container, Eyebrow, cn } from '../components/ui'
import { PRICES } from '../config/brand'
import { formatSEK } from '../lib/format'

const PLANS = [
  {
    name: 'Genomför affären',
    price: PRICES.directDeal,
    lead: 'För dig som redan hittat köpare.',
    items: ['Digital process', 'Avtalsunderlag', 'Dokumenthantering', 'Budhistorik', 'Tillträdesguide'],
    cta: 'Starta',
    to: '/genomfor-affaren',
  },
  {
    name: 'Sälj själv',
    price: PRICES.sellYourself,
    lead: 'Allt du behöver för att sälja din bostad.',
    popular: true,
    items: ['Bostadsannons', 'AI-annonsverktyg', 'Visningsbokning', 'Intressenthantering', 'Budgivning', 'Köparverifiering', 'Avtalsflöde', 'Dokumenthantering', 'Tillträde'],
    cta: 'Sälj din bostad',
    to: '/salj/start',
  },
  {
    name: 'Sälj själv Plus',
    price: PRICES.sellPlus,
    lead: 'Allt i Sälj själv, samt:',
    items: ['Professionell fotografering', 'Planritning', 'Juridisk kontroll av dokument', 'Personlig support'],
    cta: 'Välj Plus',
    to: '/salj/start?paket=plus',
  },
]

const FAQ = [
  ['Tillkommer det några andra avgifter?', 'Nej. Priset är fast och betalas först när annonsen publiceras eller affären skapas.'],
  ['Vad händer om bostaden inte blir såld?', 'I den riktiga tjänsten är tanken att du kan pausa annonsen utan extra kostnad. Detta är en prototyp.'],
  ['Är avtalen juridiskt granskade?', 'I prototypen är avtalen exempel och inte juridiskt material. I Plus ingår juridisk kontroll av dokumenten.'],
]

export default function Pricing() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Pris</Eyebrow>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Ett enklare pris för en enklare bostadsaffär</h1>
        <p className="mt-4 text-lg text-ink-muted">Fast pris. Ingen procent på slutpriset.</p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-start">
        {PLANS.map((p) => (
          <Card key={p.name} className={cn('relative flex flex-col p-7', p.popular && 'border-2 border-petrol-600 shadow-lift lg:-mt-4')}>
            {p.popular && <span className="absolute -top-3.5 left-7 rounded-full bg-petrol-700 px-3 py-1 text-xs font-bold text-white">Populärast</span>}
            <h2 className="text-xl font-bold">{p.name}</h2>
            <p className="mt-1 text-sm text-ink-muted">{p.lead}</p>
            <p className="mt-6 text-4xl font-extrabold tracking-tight">{formatSEK(p.price)}</p>
            <p className="text-sm text-ink-muted">engångskostnad</p>
            <ul className="mt-6 flex-1 space-y-2.5">
              {p.items.map((it) => (
                <li key={it} className="flex items-start gap-2.5 text-[15px]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-petrol-600" strokeWidth={3} />
                  {it}
                </li>
              ))}
            </ul>
            <Button to={p.to} variant={p.popular ? 'primary' : 'secondary'} size="lg" full className="mt-8">
              {p.cta}
            </Button>
          </Card>
        ))}
      </div>

      <div className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-2xl font-bold">Vanliga frågor</h2>
        <div className="mt-6 divide-y divide-sand-300 border-y border-sand-300">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                {q}
                <span className="ml-4 text-xl text-ink-muted transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-ink-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </Container>
  )
}
