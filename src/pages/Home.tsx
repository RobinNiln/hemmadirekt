import { useNavigate } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Gavel, PlayCircle } from 'lucide-react'
import { Button, Container, Eyebrow } from '../components/ui'
import { Photo } from '../components/Photo'
import { TrustRow } from '../components/Trust'
import { CostComparison, DirectDealBand, FeatureGrid, FourSteps, Section } from '../components/HomeSections'
import { IMG } from '../lib/images'
import { useSale } from '../state/SaleContext'

export default function Home() {
  const { dispatch } = useSale()
  const navigate = useNavigate()

  const startDemo = () => {
    dispatch({ type: 'LOAD_DEMO' })
    navigate('/min-forsaljning')
  }

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <Container className="grid items-center gap-12 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24">
          <div>
            <Eyebrow>Bostadsförsäljning utan mäklare</Eyebrow>
            <h1 className="mt-4 text-[40px] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
              Sälj din bostad själv. <span className="text-petrol-700">Vi hjälper dig med resten.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted sm:text-xl">
              Från annons och visning till budgivning, avtal och tillträde. Ett enklare sätt att sälja bostad – utan traditionellt mäklararvode.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/salj/start" size="lg">
                Starta din försäljning <ArrowRight className="h-5 w-5" />
              </Button>
              <Button to="/sa-fungerar-det" size="lg" variant="secondary">
                Se hur det fungerar
              </Button>
            </div>
            <button onClick={startDemo} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-petrol-700 hover:underline">
              <PlayCircle className="h-5 w-5" /> Testa en pågående försäljning
            </button>
            <TrustRow compact className="mt-10 border-t border-sand-300 pt-6" />
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[28px] shadow-lift">
              <Photo src={IMG.heroHome} alt="Modern svensk bostad" eager className="aspect-[4/5] w-full sm:aspect-[5/5] lg:aspect-[4/5]" />
            </div>
            {/* Flytande kort som visar produkten */}
            <div className="absolute -left-4 bottom-10 w-64 rounded-2xl bg-white p-4 shadow-lift animate-rise sm:-left-10">
              <div className="flex items-center gap-2 text-xs font-semibold text-petrol-700">
                <Gavel className="h-4 w-4" /> Nytt bud
              </div>
              <p className="mt-1 text-2xl font-bold tracking-tight">4 620 000 kr</p>
              <p className="mt-0.5 text-sm text-ink-muted">Anna A. · 12:48</p>
            </div>
            <div className="absolute -right-2 top-8 flex items-center gap-2 rounded-full bg-white py-2 pl-2 pr-4 text-sm font-semibold shadow-lift sm:-right-6">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint-200 text-petrol-800">
                <BadgeCheck className="h-4 w-4" />
              </span>
              BankID-verifierad köpare
            </div>
          </div>
        </Container>
      </section>

      {/* SÅ ENKELT FUNGERAR DET */}
      <Section className="border-t border-sand-300/60 bg-sand-50 py-16 sm:py-24">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Eyebrow>Fyra steg</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Så enkelt fungerar det</h2>
          </div>
          <Button to="/sa-fungerar-det" variant="ghost">
            Hela processen <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <FourSteps />
      </Section>

      {/* FUNKTIONER */}
      <Section>
        <div className="mb-10 max-w-2xl">
          <Eyebrow>Allt på ett ställe</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Du säljer bostaden. Vi håller ihop affären.</h2>
        </div>
        <FeatureGrid />
      </Section>

      {/* FÖR KÖPARE */}
      <Section className="bg-petrol-900 py-16 text-white sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mint-300">För dig som letar bostad</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Berätta vad du söker så hjälper vi dig hitta rätt.</h2>
            <p className="mt-4 text-lg leading-relaxed text-petrol-100">
              Beskriv ditt drömboende med egna ord. Vi översätter det till en sökprofil, matchar den mot alla bostäder och förklarar varför en bostad passar – och vad den saknar.
            </p>
            <Button to="/hitta-bostad" variant="accent" size="lg" className="mt-8">
              Hitta rätt bostad <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="rounded-3xl bg-white p-6 text-ink shadow-lift" aria-hidden>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-petrol-700 px-3 py-1 text-xs font-bold text-white">Mycket bra match</span>
              <span className="text-xs text-ink-muted">Exempel</span>
            </div>
            <p className="mt-4 text-xl font-bold">Ringvägen 128</p>
            <p className="text-sm text-ink-muted">Södermalm · 3 rum · 76 m²</p>
            <p className="mt-3 text-sm font-semibold text-petrol-800">6 av 6 krav uppfyllda</p>
            <p className="text-sm text-ink-muted">4 av 5 önskemål uppfyllda</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {['Balkong', 'Hiss', 'Inom din budget'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="text-petrol-600">✓</span> {t}
                </li>
              ))}
              <li className="flex items-center gap-2 text-ink-muted">
                <span className="text-amber-600">–</span> Ingen parkeringsplats ingår
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* KOSTNAD */}
      <Section className="bg-sand-50 py-16 sm:py-24">
        <CostComparison />
      </Section>

      {/* REDAN HITTAT KÖPARE */}
      <Section>
        <DirectDealBand />
      </Section>

      {/* DEMO */}
      <Section className="pb-4">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-sand-300 bg-white p-8 shadow-card sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Vill du se hur det ser ut inifrån?</h2>
            <p className="mt-2 text-ink-muted">Hoppa in i en pågående försäljning av Ringvägen 128 – med visning, intressenter, bud och statistik.</p>
          </div>
          <Button size="lg" onClick={startDemo} className="w-full sm:w-auto">
            <PlayCircle className="h-5 w-5" /> Testa en pågående försäljning
          </Button>
        </div>
      </Section>
    </>
  )
}
