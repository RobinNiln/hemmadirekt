import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Handshake } from 'lucide-react'
import { Button, Card, Container, Eyebrow, Field, Input, StepIndicator } from '../components/ui'
import { DemoNotice } from '../components/Trust'
import { useSale } from '../state/SaleContext'
import { PRICES } from '../config/brand'
import { formatNumber, formatSEK, parseAmount } from '../lib/format'

// "Genomför bara affären" – för den som redan har en köpare.
export default function DirectDeal() {
  const { state, dispatch } = useSale()
  const navigate = useNavigate()
  const [street, setStreet] = useState('Ringvägen 128')
  const [city, setCity] = useState('Stockholm')
  const [buyer, setBuyer] = useState('Anna Andersson')
  const [price, setPrice] = useState('4 620 000')
  const [access, setAccess] = useState('2026-12-15')

  const valid = street.trim() && buyer.trim() && parseAmount(price) > 0 && access

  const create = () => {
    if (!valid) return
    if (state.started && !window.confirm('Du har redan en pågående försäljning i demon. Vill du ersätta den?')) return
    dispatch({ type: 'START_DIRECT_DEAL', buyerName: buyer.trim(), price: parseAmount(price), accessDate: access, property: { street: street.trim(), city: city.trim() } })
    navigate('/min-forsaljning/avtal')
  }

  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <StepIndicator steps={['Affären', 'Avtal', 'Tillträde']} current={1} />
      <div className="mt-8">
        <Eyebrow>Genomför affären · {formatSEK(PRICES.directDeal)}</Eyebrow>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Ni har kommit överens. Vi sköter resten.</h1>
        <p className="mt-3 text-lg text-ink-muted">Fyll i vad ni har kommit överens om, så skapar vi avtalet och guidar er fram till tillträdet.</p>
      </div>

      <Card className="mt-8 space-y-8 p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-bold">Bostaden</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr]">
            <Field label="Adress">
              <Input value={street} onChange={(e) => setStreet(e.target.value)} />
            </Field>
            <Field label="Ort">
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold">Köparen och villkoren</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Köparens namn" hint="Köparen bjuds in och legitimerar sig med BankID">
              <Input value={buyer} onChange={(e) => setBuyer(e.target.value)} />
            </Field>
            <Field label="Överenskommet pris (kr)">
              <Input inputMode="numeric" value={price} onChange={(e) => setPrice(parseAmount(e.target.value) ? formatNumber(parseAmount(e.target.value)) : '')} />
            </Field>
            <Field label="Tillträdesdag">
              <Input type="date" value={access} onChange={(e) => setAccess(e.target.value)} />
            </Field>
          </div>
        </div>
        <Button size="lg" full disabled={!valid} onClick={create}>
          <Handshake className="h-5 w-5" /> Skapa affären och gå till avtalet <ArrowRight className="h-5 w-5" />
        </Button>
      </Card>
      <DemoNotice className="mt-6" />
    </Container>
  )
}
