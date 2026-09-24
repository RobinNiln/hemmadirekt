import { useState } from 'react'
import { BRAND, PRICES } from '../config/brand'
import { formatNumber, formatSEK, parseAmount } from '../lib/format'
import { Card, Field, Input } from './ui'

// Säljkalkyl: jämför ett mäklararvode med HemmaDirekts fasta pris.
export function SavingsCalculator() {
  const [price, setPrice] = useState('5 000 000')
  const [fee, setFee] = useState('60 000')
  const [pct, setPct] = useState('')

  const priceN = parseAmount(price)
  const brokerN = pct ? Math.round((priceN * parseFloat(pct.replace(',', '.'))) / 100) : parseAmount(fee)
  const savings = brokerN - PRICES.sellYourself

  const fmtInput = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseAmount(e.target.value)
    setter(n ? formatNumber(n) : '')
  }

  return (
    <Card className="p-6 sm:p-8">
      <h3 className="text-xl font-bold">Säljkalkyl</h3>
      <p className="mt-1 text-sm text-ink-muted">Fyll i ditt förväntade pris och vad en mäklare skulle ta.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Försäljningspris (kr)">
          <Input inputMode="numeric" value={price} onChange={fmtInput(setPrice)} />
        </Field>
        <Field label="Mäklararvode (kr)" hint="Eller ange procent nedan">
          <Input inputMode="numeric" value={pct ? formatNumber(brokerN) : fee} onChange={(e) => { setPct(''); fmtInput(setFee)(e) }} />
        </Field>
        <Field label="…eller arvode i procent" className="sm:col-span-2">
          <Input inputMode="decimal" placeholder="t.ex. 1,2" value={pct} onChange={(e) => setPct(e.target.value.replace(/[^0-9,.]/g, ''))} />
        </Field>
      </div>
      <div className="mt-6 divide-y divide-sand-200 rounded-xl border border-sand-200">
        <div className="flex justify-between px-4 py-3 text-[15px]">
          <span className="text-ink-muted">Mäklararvode</span>
          <span className="font-semibold">{formatSEK(brokerN)}</span>
        </div>
        <div className="flex justify-between px-4 py-3 text-[15px]">
          <span className="text-ink-muted">{BRAND.name} Sälj själv</span>
          <span className="font-semibold text-petrol-700">{formatSEK(PRICES.sellYourself)}</span>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-petrol-700 px-5 py-4 text-white">
        {savings > 0 ? (
          <>
            <p className="text-sm text-petrol-100">Resultat</p>
            <p className="text-3xl font-bold tracking-tight">Du sparar {formatSEK(savings)}</p>
          </>
        ) : (
          <p className="font-semibold">Med det arvodet sparar du inte pengar – men du får fortfarande full kontroll över din försäljning.</p>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-muted">Exemplet är illustrativt. Mäklararvoden varierar.</p>
    </Card>
  )
}
