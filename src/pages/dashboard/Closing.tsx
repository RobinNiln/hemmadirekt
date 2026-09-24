import { useState } from 'react'
import { CalendarDays, FileSignature, KeyRound, PartyPopper, Wallet } from 'lucide-react'
import { Button, Card, Checklist, CheckboxRow, Modal, PageHeader, ProgressBar, Spinner } from '../../components/ui'
import { useSale } from '../../state/SaleContext'
import { isSigned } from '../../state/progress'
import { formatDateShort, formatSEK } from '../../lib/format'
import { EmptyPanel } from './DashboardLayout'

const PREP = [
  { key: 'meter', label: 'Läs av el- och vattenmätare', hint: 'Skicka mätarställningarna till köparen och elbolaget.' },
  { key: 'clean', label: 'Flyttstäda bostaden', hint: 'Bostaden ska lämnas väl städad enligt avtalet.' },
  { key: 'keys', label: 'Samla alla nycklar och taggar', hint: 'Även förrådsnycklar, porttaggar och tvättstugecylinder.' },
  { key: 'manuals', label: 'Lägg fram manualer och kvitton', hint: 'Vitvaror, garantier och renoveringsunderlag.' },
  { key: 'brf', label: 'Meddela föreningen att du flyttar', hint: 'Vi har skickat underlaget – du behöver bara bekräfta.' },
]

export default function Closing() {
  const { state, dispatch, acceptedBid } = useSale()
  const [prepOpen, setPrepOpen] = useState(false)
  const [checked, setChecked] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const c = state.closing

  if (!isSigned(state)) {
    return (
      <div className="space-y-6">
        <PageHeader title="Tillträde" />
        <EmptyPanel icon={<KeyRound className="h-7 w-7" />} title="Tillträdet planeras när avtalet är signerat" text="När både du och köparen har signerat avtalet får du en checklista för allt som ska göras fram till överlämningen.">
          <Button to="/min-forsaljning/avtal">
            <FileSignature className="h-4 w-4" /> Till avtalet
          </Button>
        </EmptyPanel>
      </div>
    )
  }

  const items = [
    { label: 'Avtal klart', done: true },
    { label: 'Handpenning registrerad', done: c.depositRegistered, hint: c.depositRegistered ? formatSEK(state.contract.deposit) : 'Väntar på köparens betalning' },
    { label: 'Köparen godkänd av BRF', done: c.brfApproved },
    { label: 'Slutbetalning', done: c.finalPayment, hint: formatSEK(state.contract.price - state.contract.deposit) },
    { label: 'Nycklar överlämnas', done: c.keysHandedOver },
    { label: 'Affären avslutas', done: c.completed },
  ]
  const firstOpen = items.findIndex((i) => !i.done)
  const list = items.map((it, i) => ({ ...it, current: i === firstOpen }))
  const pct = Math.round((items.filter((i) => i.done).length / items.length) * 100)

  const daysLeft = Math.max(0, Math.ceil((new Date(state.contract.accessDate + 'T12:00:00').getTime() - Date.now()) / 86400000))

  const simulateAccessDay = () => {
    setRunning(true)
    setTimeout(() => {
      dispatch({ type: 'CLOSING_PATCH', patch: { finalPayment: true } })
      dispatch({ type: 'NOTIFY', text: `Slutbetalningen på ${formatSEK(state.contract.price - state.contract.deposit)} är mottagen.` })
    }, 900)
    setTimeout(() => dispatch({ type: 'CLOSING_PATCH', patch: { keysHandedOver: true } }), 1900)
    setTimeout(() => {
      dispatch({ type: 'CLOSING_PATCH', patch: { completed: true } })
      dispatch({ type: 'NOTIFY', text: 'Grattis! Affären är avslutad.', link: '/min-forsaljning/dokument' })
      setRunning(false)
    }, 2900)
  }

  return (
    <div className="space-y-6">
      {c.completed && (
        <Card className="overflow-hidden animate-pop">
          <div className="bg-petrol-800 p-8 text-center text-white sm:p-12">
            <PartyPopper className="mx-auto h-14 w-14 text-mint-300" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Grattis – bostaden är såld!</h2>
            <p className="mx-auto mt-2 max-w-md text-petrol-100">
              {acceptedBid?.bidderName} har fått nycklarna till {state.property.street}. Alla dokument finns sparade i ditt arkiv.
            </p>
            <Button to="/min-forsaljning/dokument" variant="accent" size="lg" className="mt-6">
              Se alla dokument
            </Button>
          </div>
        </Card>
      )}

      <PageHeader eyebrow="Nästa steg" title="Tillträde" subtitle="Här ser du allt som ska hända fram till att nycklarna lämnas över." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-petrol-700 text-white">
              <CalendarDays className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm text-ink-muted">Tillträdesdag</p>
              <p className="text-3xl font-bold tracking-tight">{formatDateShort(state.contract.accessDate)}</p>
              {!c.completed && <p className="text-sm text-ink-muted">om {daysLeft} dagar</p>}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-sand-100 p-4">
              <p className="text-xs text-ink-muted">Köpare</p>
              <p className="font-semibold">{acceptedBid?.bidderName}</p>
            </div>
            <div className="rounded-xl bg-sand-100 p-4">
              <p className="text-xs text-ink-muted">Kvar att betala</p>
              <p className="font-semibold">{formatSEK(state.contract.price - state.contract.deposit)}</p>
            </div>
          </div>
          {!c.completed && (
            <div className="mt-6 space-y-3">
              <Button size="lg" full onClick={() => setPrepOpen(true)}>
                <KeyRound className="h-5 w-5" /> {c.prepared ? 'Förberedelser klara ✓' : 'Förbered tillträdet'}
              </Button>
              {c.prepared && (
                <Button size="lg" full variant="accent" onClick={simulateAccessDay} disabled={running || !c.depositRegistered || !c.brfApproved}>
                  {running ? <Spinner /> : <Wallet className="h-5 w-5" />}
                  {running ? 'Tillträdet genomförs…' : 'Simulera tillträdesdagen (demo)'}
                </Button>
              )}
              {c.prepared && (!c.depositRegistered || !c.brfApproved) && <p className="text-center text-xs text-ink-muted">Väntar på handpenning och BRF-godkännande…</p>}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Checklista</h2>
            <span className="text-sm text-ink-muted">{pct} %</span>
          </div>
          <ProgressBar value={pct} className="mt-3" />
          <Checklist items={list} className="mt-3" />
        </Card>
      </div>

      <Modal
        open={prepOpen}
        onClose={() => setPrepOpen(false)}
        title="Förbered tillträdet"
        footer={
          <Button
            disabled={!c.prepared && checked.length < PREP.length}
            onClick={() => {
              dispatch({ type: 'CLOSING_PATCH', patch: { prepared: true } })
              setPrepOpen(false)
            }}
          >
            Klart – jag är redo
          </Button>
        }
      >
        <p className="mb-4 text-ink-muted">Bocka av när du är klar. Det här brukar du behöva göra veckan före tillträdet.</p>
        <div className="space-y-2">
          {PREP.map((p) => (
            <CheckboxRow key={p.key} checked={checked.includes(p.key) || c.prepared} onChange={(v) => setChecked(v ? [...checked, p.key] : checked.filter((k) => k !== p.key))} label={p.label} hint={p.hint} />
          ))}
        </div>
      </Modal>
    </div>
  )
}
