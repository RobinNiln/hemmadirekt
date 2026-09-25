import { ArrowRight, Camera, CheckCircle2, Sparkles } from 'lucide-react'
import { Button, Container, Eyebrow } from '../components/ui'
import { Photo } from '../components/Photo'
import { SavingsCalculator } from '../components/SavingsCalculator'
import { DirectDealBand, FeatureGrid, FourSteps, Section } from '../components/HomeSections'
import { TrustRow } from '../components/Trust'
import { IMG } from '../lib/images'
import { BRAND, PRICES } from '../config/brand'
import { formatSEK } from '../lib/format'

export default function Sell() {
  return (
    <>
      <section>
        <Container className="grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-2">
          <div>
            <Eyebrow>Sälja bostad</Eyebrow>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Du har koll på din bostad. Vi har koll på processen.</h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">
              {BRAND.name} guidar dig genom varje steg – du behöver inte veta hur en bostadsaffär fungerar. Vi säger alltid vad som är klart, vad du ska göra nu och vad som händer sedan.
            </p>
            <ul className="mt-6 space-y-2">
              {['Fast pris från ' + formatSEK(PRICES.sellYourself) + ' – oavsett slutpris', 'Klar annons på under en timme', 'Fast pris, avtal och tillträde på ett ställe'].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-[15px]">
                  <CheckCircle2 className="h-5 w-5 text-petrol-600" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/salj/start" size="lg">
                Starta din försäljning <ArrowRight className="h-5 w-5" />
              </Button>
              <Button to="/pris" size="lg" variant="secondary">
                Se priser
              </Button>
            </div>
            <TrustRow compact className="mt-8" />
          </div>
          <div className="relative">
            <Photo src={IMG.livingScandi} alt="Ljust vardagsrum" className="aspect-[4/3] w-full rounded-3xl shadow-lift" eager />
            <div className="absolute -bottom-6 left-6 right-6 rounded-2xl bg-white p-4 shadow-lift sm:left-auto sm:w-72">
              <div className="flex items-center gap-2 text-xs font-semibold text-petrol-700">
                <Sparkles className="h-4 w-4" /> AI-förslag på beskrivning
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">”Ljus och välplanerad trea högt upp i huset med generöst ljusinsläpp…”</p>
            </div>
            <div className="absolute -top-4 right-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-lift">
              <Camera className="h-4 w-4 text-petrol-600" /> 10 bilder uppladdade
            </div>
          </div>
        </Container>
      </section>

      <Section className="bg-sand-50 py-16 sm:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Eyebrow>Räkna själv</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Hur mycket sparar du?</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">
              Ett mäklararvode ligger ofta på tiotusentals kronor och växer med priset. Hos oss betalar du ett fast pris. Pengarna du sparar stannar hos dig.
            </p>
          </div>
          <SavingsCalculator />
        </div>
      </Section>

      <Section>
        <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">Så enkelt fungerar det</h2>
        <FourSteps />
      </Section>

      <Section className="bg-sand-50 py-16 sm:py-24">
        <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">Du säljer bostaden. Vi håller ihop affären.</h2>
        <FeatureGrid />
      </Section>

      <Section>
        <DirectDealBand />
      </Section>
    </>
  )
}
