import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, Clock, Info, Send } from 'lucide-react'
import { Button, CheckboxRow, Field, Input, Modal, StepIndicator, Textarea, cn } from './ui'
import { useSale } from '../state/SaleContext'
import { useBuyer } from '../state/BuyerContext'
import { FINANCING_LABEL } from '../state/presets'
import { formatDateShort, formatNumber, formatSEK, nowTime, parseAmount, uid } from '../lib/format'
import type { Listing } from '../data/listings'
import type { Bid, Financing, FinancingType, RequestKind } from '../state/types'

// ---------------------------------------------------------------------------
// Köparens flöde: "Jag vill köpa för X kr" (köpförfrågan) eller "Lämna annat erbjudande".
// Ingenting här är bindande – det är först ett undertecknat köpekontrakt som binder parterna.
// ---------------------------------------------------------------------------

export const BINDING_NOTE = 'Affären blir bindande först när ett giltigt köpekontrakt har undertecknats av parterna.'

export const CONDITION_OPTIONS = ['Finansieringsvillkor', 'Besiktningsvillkor', 'Jag behöver sälja min nuvarande bostad', 'Annat']

const FINANCING_OPTIONS: { id: FinancingType; label: string }[] = [
  { id: 'lanelofte', label: 'Jag har lånelöfte' },
  { id: 'klar', label: 'Finansiering är klar' },
  { id: 'kontant', label: 'Jag köper utan bolån' },
  { id: 'behover', label: 'Jag behöver ordna finansiering' },
]

const STEPS = ['Pris', 'Finansiering', 'Tillträde', 'Villkor', 'Kontroll']

export function accessText(b: { desiredAccess: string; flexible: boolean }) {
  return b.flexible || !b.desiredAccess ? 'Flexibelt' : formatDateShort(b.desiredAccess)
}

export function conditionsText(b: { conditions: string[]; otherCondition: string }) {
  const list = b.conditions.map((c) => (c === 'Annat' && b.otherCondition ? b.otherCondition : c))
  return list.length ? list.join(', ') : 'Inga särskilda villkor'
}

export function PurchaseRequestModal({ listing, kind, open, onClose, isOwn }: { listing: Listing; kind: RequestKind; open: boolean; onClose: () => void; isOwn: boolean }) {
  const { dispatch } = useSale()
  const { buyer, addRequest } = useBuyer()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [confirmed, setConfirmed] = useState(false)
  const [offer, setOffer] = useState('')
  const [fin, setFin] = useState<Financing>({ type: 'lanelofte', bank: 'Exempelbanken', amount: 4_000_000, validTo: '2027-02-28' })
  const [finChosen, setFinChosen] = useState(false)
  const [access, setAccess] = useState('2026-12-15')
  const [flexible, setFlexible] = useState(false)
  const [conds, setConds] = useState<string[]>([])
  const [noConds, setNoConds] = useState(true)
  const [other, setOther] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!open) return
    setStep(1)
    setConfirmed(false)
    setOffer(formatNumber(Math.round((listing.price * 0.97) / 10_000) * 10_000))
    setFinChosen(false)
    setFlexible(false)
    setConds([])
    setNoConds(true)
    setOther('')
    setSent(false)
  }, [open, listing.price])

  const amount = kind === 'accept' ? listing.price : parseAmount(offer)
  const isOffer = kind === 'offer'
  const noun = isOffer ? 'erbjudande' : 'köpförfrågan'

  const step1ok = isOffer ? amount > 0 : confirmed
  const step3ok = flexible || !!access
  const step4ok = noConds || conds.length > 0

  const submit = () => {
    const id = uid('r')
    const req = {
      kind,
      amount,
      desiredAccess: flexible ? '' : access,
      flexible,
      financing: fin,
      conditions: noConds ? [] : conds,
      otherCondition: !noConds && conds.includes('Annat') ? other : '',
    }
    if (isOwn) {
      // I demon hamnar köparens förfrågan direkt hos säljaren (du själv).
      const bid: Bid = { id, bidderId: 'demo-buyer', bidderName: `${buyer.name} (demoköpare)`, time: nowTime(), status: 'Skickad', ...req }
      dispatch({ type: 'ADD_BID', bid })
    }
    addRequest({ id, listingId: listing.id, street: listing.street, askingPrice: listing.price, time: nowTime(), status: 'Skickad', ...req })
    setSent(true)
  }

  const title = sent ? (isOffer ? 'Ditt erbjudande är skickat' : 'Din köpförfrågan är skickad') : isOffer ? 'Lämna ett erbjudande' : 'Skicka köpförfrågan'

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      {sent ? (
        <div className="text-center animate-pop">
          <CheckCircle2 className="mx-auto h-14 w-14 text-petrol-600" />
          <p className="mx-auto mt-3 max-w-md text-lg">
            {isOffer ? (
              <>
                Du har lämnat ett erbjudande på {listing.street} om <strong>{formatSEK(amount)}</strong>.
              </>
            ) : (
              <>
                Du har meddelat säljaren att du vill köpa {listing.street} för <strong>{formatSEK(amount)}</strong>.
              </>
            )}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
            <Clock className="h-4 w-4" /> Väntar på säljaren
          </p>
          <dl className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3 text-left">
            <Mini k="Pris" v={formatSEK(amount)} />
            <Mini k="Önskat tillträde" v={accessText({ desiredAccess: access, flexible })} />
            <Mini k="Finansiering" v="Angiven" />
          </dl>
          <p className="mt-6 text-xs text-ink-muted">{BINDING_NOTE}</p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button
              onClick={() => {
                onClose()
                navigate('/mina-affarer')
              }}
            >
              Visa min förfrågan
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Stäng
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <StepIndicator steps={STEPS} current={step} className="mb-6" />

          {step === 1 &&
            (isOffer ? (
              <Section title="Ditt erbjudande">
                <div className="rounded-xl bg-sand-100 px-4 py-3">
                  <p className="text-xs text-ink-muted">Säljarens pris</p>
                  <p className="text-xl font-bold">{formatSEK(listing.price)}</p>
                </div>
                <Field label="Ditt erbjudande (kr)" className="mt-4">
                  <Input inputMode="numeric" value={offer} onChange={(e) => setOffer(parseAmount(e.target.value) ? formatNumber(parseAmount(e.target.value)) : '')} className="h-14 text-xl font-bold" />
                </Field>
                <p className="mt-3 text-sm text-ink-muted">Säljaren kan välja att gå vidare med ditt erbjudande, tacka nej eller skicka ett meddelande.</p>
              </Section>
            ) : (
              <Section title="Priset">
                <div className="rounded-2xl bg-petrol-800 p-5 text-white">
                  <span className="rounded-full bg-mint-300 px-2.5 py-0.5 text-xs font-bold text-petrol-900">Fast pris</span>
                  <p className="mt-2 text-3xl font-bold tracking-tight">{formatSEK(listing.price)}</p>
                </div>
                <p className="mt-4 text-ink-soft">Du meddelar nu säljaren att du vill köpa bostaden till det angivna priset.</p>
                <div className="mt-4">
                  <CheckboxRow checked={confirmed} onChange={setConfirmed} label={`Jag vill köpa bostaden för ${formatSEK(listing.price)}`} />
                </div>
              </Section>
            ))}

          {step === 2 && (
            <Section title="Hur tänker du finansiera köpet?">
              <div className="grid gap-2 sm:grid-cols-2">
                {FINANCING_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setFin({ ...fin, type: o.id })
                      setFinChosen(true)
                    }}
                    className={cn('flex items-center gap-3 rounded-xl border-2 p-4 text-left font-medium transition', finChosen && fin.type === o.id ? 'border-petrol-600 bg-petrol-50/60' : 'border-sand-300 bg-white hover:border-ink-faint')}
                  >
                    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', finChosen && fin.type === o.id ? 'border-petrol-700 bg-petrol-700' : 'border-sand-300')}>
                      {finChosen && fin.type === o.id && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                    {o.label}
                  </button>
                ))}
              </div>
              {finChosen && fin.type === 'lanelofte' && (
                <div className="mt-4 grid gap-3 rounded-xl bg-sand-100 p-4 sm:grid-cols-3">
                  <Field label="Bank">
                    <Input value={fin.bank ?? ''} onChange={(e) => setFin({ ...fin, bank: e.target.value })} className="h-10 text-sm" />
                  </Field>
                  <Field label="Belopp (kr)">
                    <Input inputMode="numeric" value={fin.amount ? formatNumber(fin.amount) : ''} onChange={(e) => setFin({ ...fin, amount: parseAmount(e.target.value) })} className="h-10 text-sm" />
                  </Field>
                  <Field label="Giltigt till">
                    <Input type="date" value={fin.validTo ?? ''} onChange={(e) => setFin({ ...fin, validTo: e.target.value })} className="h-10 text-sm" />
                  </Field>
                </div>
              )}
              {finChosen && (
                <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-petrol-700">
                  <CheckCircle2 className="h-4 w-4" /> Finansiering angiven
                </p>
              )}
              <p className="mt-2 text-xs text-ink-muted">Uppgifterna är dina egna. I prototypen kontrolleras de inte mot någon bank.</p>
            </Section>
          )}

          {step === 3 && (
            <Section title="När vill du flytta in?">
              <Field label="Önskat tillträde">
                <Input type="date" value={access} onChange={(e) => setAccess(e.target.value)} disabled={flexible} className="max-w-xs" />
              </Field>
              <div className="mt-4">
                <CheckboxRow checked={flexible} onChange={setFlexible} label="Jag är flexibel" hint={flexible ? 'Du kan komma överens om exakt datum med säljaren.' : undefined} />
              </div>
            </Section>
          )}

          {step === 4 && (
            <Section title="Har du några villkor?">
              <div className="space-y-2">
                <CheckboxRow
                  checked={noConds}
                  onChange={(v) => {
                    setNoConds(v)
                    if (v) setConds([])
                  }}
                  label="Inga särskilda villkor"
                />
                {CONDITION_OPTIONS.map((c) => (
                  <CheckboxRow
                    key={c}
                    checked={conds.includes(c)}
                    onChange={(v) => {
                      setConds(v ? [...conds, c] : conds.filter((x) => x !== c))
                      if (v) setNoConds(false)
                    }}
                    label={c}
                  />
                ))}
                {conds.includes('Annat') && <Textarea rows={2} value={other} onChange={(e) => setOther(e.target.value)} placeholder="Beskriv villkoret" />}
              </div>
            </Section>
          )}

          {step === 5 && (
            <Section title={isOffer ? 'Ditt erbjudande' : 'Din köpförfrågan'}>
              <dl className="divide-y divide-sand-200 rounded-xl border border-sand-200">
                {[
                  ['Bostad', listing.street],
                  [isOffer ? 'Ditt erbjudande' : 'Pris', formatSEK(amount)],
                  ...(isOffer ? [['Säljarens pris', formatSEK(listing.price)]] : []),
                  ['Finansiering', FINANCING_LABEL[fin.type]],
                  ['Önskat tillträde', accessText({ desiredAccess: access, flexible })],
                  ['Villkor', conditionsText({ conditions: noConds ? [] : conds, otherCondition: other })],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 px-4 py-3 text-[15px]">
                    <dt className="text-ink-muted">{k}</dt>
                    <dd className="text-right font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-bold text-amber-900">Detta är inte ett bindande bostadsköp.</p>
                <p className="mt-1 text-sm text-amber-900/90">Om säljaren vill gå vidare skapas nästa steg i affären. Köpet blir bindande först när giltigt köpekontrakt har undertecknats.</p>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-petrol-700">
                <BadgeCheck className="h-4 w-4" /> Du skickar som {buyer.name}, verifierad med BankID (simulerat)
              </p>
            </Section>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4" /> Tillbaka
              </Button>
            ) : (
              <span />
            )}
            {step < 5 ? (
              <Button onClick={() => setStep(step + 1)} disabled={(step === 1 && !step1ok) || (step === 2 && !finChosen) || (step === 3 && !step3ok) || (step === 4 && !step4ok)}>
                Fortsätt <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submit}>
                <Send className="h-4 w-4" /> Skicka {noun}
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-xl font-bold">{title}</h3>
      {children}
    </div>
  )
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-sand-100 p-3">
      <dt className="text-xs text-ink-muted">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  )
}

export function BindingNote({ className }: { className?: string }) {
  return (
    <p className={cn('flex items-start gap-1.5 text-xs text-ink-muted', className)}>
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {BINDING_NOTE}
    </p>
  )
}
