import { useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, FileSignature, Gavel, Info, PenLine, UserRound } from 'lucide-react'
import { Button, Card, CheckboxRow, Field, Input, PageHeader, Spinner, StepIndicator, Textarea, cn } from '../../components/ui'
import { ContractDocument } from '../../components/ContractDocument'
import { BankIdModal } from '../../components/BankIdModal'
import { useSale } from '../../state/SaleContext'
import { contractData } from '../../lib/documents'
import { formatDateShort, formatNumber, formatSEK, parseAmount } from '../../lib/format'
import { EmptyPanel } from './DashboardLayout'

const STEPS = ['Köpare', 'Pris', 'Tillträde', 'Villkor', 'Kontroll', 'Signering']

export default function ContractFlow() {
  const { state, dispatch, acceptedBid } = useSale()
  const c = state.contract
  const [bankId, setBankId] = useState(false)
  const [buyerSigning, setBuyerSigning] = useState(false)

  if (!acceptedBid) {
    return (
      <div className="space-y-6">
        <PageHeader title="Avtal" />
        <EmptyPanel icon={<FileSignature className="h-7 w-7" />} title="Avtalet skapas när du valt köpare" text="När du accepterat ett bud guidar vi dig genom överlåtelseavtalet – steg för steg.">
          <Button to="/min-forsaljning/budgivning">
            <Gavel className="h-4 w-4" /> Till budgivningen
          </Button>
        </EmptyPanel>
      </div>
    )
  }

  const data = contractData(state, acceptedBid)
  const signed = c.signedBySeller && c.signedByBuyer
  const step = signed ? 7 : c.step
  const setStep = (n: number) => {
    dispatch({ type: 'CONTRACT_PATCH', patch: { step: n } })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const simulateBuyerSigning = () => {
    setBuyerSigning(true)
    setTimeout(() => {
      dispatch({ type: 'CONTRACT_PATCH', patch: { signedByBuyer: true } })
      dispatch({ type: 'NOTIFY', text: `${acceptedBid.bidderName} har signerat avtalet. Affären är klar att gå mot tillträde.`, link: '/min-forsaljning/tilltrade' })
      setBuyerSigning(false)
      // Simulerar det som händer de närmaste dagarna efter signering.
      setTimeout(() => {
        dispatch({ type: 'CLOSING_PATCH', patch: { depositRegistered: true } })
        dispatch({ type: 'NOTIFY', text: `Handpenningen på ${formatSEK(c.deposit)} är registrerad.`, link: '/min-forsaljning/tilltrade' })
      }, 1200)
      setTimeout(() => {
        dispatch({ type: 'CLOSING_PATCH', patch: { brfApproved: true } })
        dispatch({ type: 'NOTIFY', text: `${acceptedBid.bidderName} är godkänd som medlem i föreningen.`, link: '/min-forsaljning/tilltrade' })
      }, 2400)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <PageHeader title={signed ? 'Avtalet är signerat' : 'Nu skapar vi avtalet'} subtitle={signed ? 'Båda parter har signerat överlåtelseavtalet.' : 'Vi går igenom avtalet tillsammans, en sak i taget. Du kan alltid gå tillbaka och ändra.'} />
      <StepIndicator steps={STEPS} current={step} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 animate-rise" key={step}>
          {step === 1 && (
            <StepCard title="Stämmer parterna?" text="Både du och köparen är verifierade med BankID. Kontrollera att namnen stämmer.">
              <div className="grid gap-4 sm:grid-cols-2">
                <PartyCard role="Säljare" name={data.seller} />
                <PartyCard role="Köpare" name={data.buyer} />
              </div>
              <Nav onNext={() => setStep(2)} nextLabel="Det stämmer" />
            </StepCard>
          )}

          {step === 2 && <PriceStep onBack={() => setStep(1)} onNext={() => setStep(3)} />}

          {step === 3 && (
            <StepCard title="När ska köparen få tillträde?" text="Tillträdesdagen är dagen då köparen betalar resten av köpeskillingen och får nycklarna.">
              <Field label="Tillträdesdag" hint={`Köparen önskade ${formatDateShort(acceptedBid.desiredAccess)} i sitt bud.`}>
                <Input type="date" value={c.accessDate} onChange={(e) => dispatch({ type: 'CONTRACT_PATCH', patch: { accessDate: e.target.value } })} />
              </Field>
              <Hint>Vanligt är 1–3 månader efter avtalet. Tänk på att köparen behöver tid att bli godkänd av föreningen.</Hint>
              <Nav onBack={() => setStep(2)} onNext={() => setStep(4)} disabled={!c.accessDate} />
            </StepCard>
          )}

          {step === 4 && <ConditionsStep onBack={() => setStep(3)} onNext={() => setStep(5)} />}

          {step === 5 && (
            <StepCard title="Avtalet är klart för kontroll" text="Läs igenom avtalet. Stämmer något inte kan du gå tillbaka och ändra.">
              <ContractDocument data={data} />
              <Nav
                onBack={() => setStep(4)}
                onNext={() => {
                  dispatch({ type: 'CONTRACT_PATCH', patch: { approved: true, step: 6 } })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                nextLabel="Godkänn avtalet"
              />
            </StepCard>
          )}

          {step === 6 && (
            <StepCard title="Signera avtalet" text="Både du och köparen signerar digitalt med BankID. Avtalet gäller när båda har signerat.">
              <div className="space-y-3">
                <SignRow name={data.seller} role="Du (säljare)" done={c.signedBySeller} action={<Button onClick={() => setBankId(true)}><PenLine className="h-4 w-4" /> Signera med BankID</Button>} />
                <SignRow
                  name={data.buyer}
                  role="Köpare"
                  done={c.signedByBuyer}
                  action={
                    c.signedBySeller ? (
                      <Button variant="secondary" onClick={simulateBuyerSigning} disabled={buyerSigning}>
                        {buyerSigning ? <Spinner className="h-4 w-4" /> : null}
                        {buyerSigning ? 'Köparen signerar…' : 'Simulera att köparen signerar'}
                      </Button>
                    ) : (
                      <span className="text-sm text-ink-muted">Bjuds in när du signerat</span>
                    )
                  }
                />
              </div>
              <Hint>När båda har signerat skickas avtalet till er båda och sparas under Dokument.</Hint>
              <div className="mt-6">
                <Button variant="ghost" onClick={() => setStep(5)}>
                  <ArrowLeft className="h-4 w-4" /> Läs avtalet igen
                </Button>
              </div>
            </StepCard>
          )}

          {step === 7 && (
            <div className="space-y-6">
              <Card className="p-6 text-center sm:p-10 animate-pop">
                <CheckCircle2 className="mx-auto h-16 w-16 text-petrol-600" />
                <h2 className="mt-4 text-2xl font-bold">Avtalet är signerat av båda parter</h2>
                <p className="mx-auto mt-2 max-w-md text-ink-muted">Nästa steg är tillträdet {formatDateShort(c.accessDate)}. Vi håller koll på handpenning, medlemskap och slutbetalning.</p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button to="/min-forsaljning/tilltrade" size="lg">
                    Till tillträdet <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button to="/min-forsaljning/dokument" size="lg" variant="secondary">
                    Se dokument
                  </Button>
                </div>
              </Card>
              <ContractDocument data={data} signed={{ seller: true, buyer: true }} />
            </div>
          )}
        </div>

        {/* SAMMANFATTNING */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <h2 className="font-bold">Affären</h2>
            <dl className="mt-4 space-y-3 text-[15px]">
              {[
                ['Säljare', data.seller],
                ['Köpare', data.buyer],
                ['Bostad', data.street],
                ['Pris', formatSEK(data.price)],
                ['Handpenning', formatSEK(data.deposit)],
                ['Tillträde', data.accessDate ? formatDateShort(data.accessDate) : '–'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-ink-muted">{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </aside>
      </div>

      <BankIdModal
        open={bankId}
        onClose={() => setBankId(false)}
        title="Signera överlåtelseavtalet"
        action="signera avtalet"
        doneText="Du har signerat avtalet."
        onDone={() => {
          setBankId(false)
          dispatch({ type: 'CONTRACT_PATCH', patch: { signedBySeller: true } })
        }}
      />
    </div>
  )
}

function StepCard({ title, text, children }: { title: string; text?: string; children: React.ReactNode }) {
  return (
    <Card className="p-6 sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {text && <p className="mt-1 text-ink-muted">{text}</p>}
      <div className="mt-6">{children}</div>
    </Card>
  )
}

function Nav({ onBack, onNext, nextLabel = 'Fortsätt', disabled }: { onBack?: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean }) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
      {onBack ? (
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Tillbaka
        </Button>
      ) : (
        <span />
      )}
      <Button size="lg" onClick={onNext} disabled={disabled}>
        {nextLabel} <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 flex items-start gap-2 rounded-xl bg-sand-100 px-4 py-3 text-sm text-ink-soft">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-petrol-600" />
      <span>{children}</span>
    </p>
  )
}

function PartyCard({ role, name }: { role: string; name: string }) {
  return (
    <div className="rounded-xl border border-sand-300 p-5">
      <p className="text-sm text-ink-muted">{role}</p>
      <div className="mt-2 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-petrol-100 text-petrol-800">
          <UserRound className="h-5 w-5" />
        </span>
        <div>
          <p className="font-bold">{name}</p>
          <p className="flex items-center gap-1 text-xs font-semibold text-petrol-700">
            <BadgeCheck className="h-3.5 w-3.5" /> Verifierad med BankID
          </p>
        </div>
      </div>
    </div>
  )
}

function SignRow({ name, role, done, action }: { name: string; role: string; done: boolean; action: React.ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between', done ? 'border-mint-300 bg-mint-100/50' : 'border-sand-300')}>
      <div>
        <p className="text-sm text-ink-muted">{role}</p>
        <p className="font-bold">{name}</p>
      </div>
      {done ? (
        <span className="flex items-center gap-1.5 font-semibold text-petrol-700">
          <CheckCircle2 className="h-5 w-5" /> Signerat
        </span>
      ) : (
        action
      )}
    </div>
  )
}

function PriceStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { state, dispatch } = useSale()
  const c = state.contract
  const [deposit, setDeposit] = useState(formatNumber(c.deposit))
  const pct = c.price ? (parseAmount(deposit) / c.price) * 100 : 0
  return (
    <StepCard title="Pris och handpenning" text="Priset kommer från budet du accepterade.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-sand-100 p-5">
          <p className="text-sm text-ink-muted">Köpeskilling</p>
          <p className="text-2xl font-bold">{formatSEK(c.price)}</p>
        </div>
        <Field label="Handpenning (kr)" hint={`${pct.toFixed(1).replace('.', ',')} % av priset`}>
          <Input inputMode="numeric" value={deposit} onChange={(e) => setDeposit(parseAmount(e.target.value) ? formatNumber(parseAmount(e.target.value)) : '')} />
        </Field>
      </div>
      <Hint>Handpenningen är en första del av betalningen, oftast 10 %. Köparen betalar den när avtalet är signerat. Resten betalas på tillträdesdagen.</Hint>
      <Nav
        onBack={onBack}
        onNext={() => {
          dispatch({ type: 'CONTRACT_PATCH', patch: { deposit: parseAmount(deposit) } })
          onNext()
        }}
        disabled={!parseAmount(deposit)}
      />
    </StepCard>
  )
}

function ConditionsStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { state, dispatch } = useSale()
  const cond = state.contract.conditions
  const set = (patch: Partial<typeof cond>) => dispatch({ type: 'SET_CONDITIONS', conditions: { ...cond, ...patch } })
  return (
    <StepCard title="Villkor" text="Villkor gör att köpet bara gäller om vissa saker uppfylls. Välj de som passar er affär.">
      <div className="space-y-3">
        <CheckboxRow checked={cond.brf} onChange={(v) => set({ brf: v })} label="Köpet gäller under förutsättning att köparen godkänns som medlem i bostadsrättsföreningen" hint="Rekommenderas alltid vid köp av bostadsrätt." />
        <CheckboxRow checked={cond.financing} onChange={(v) => set({ financing: v })} label="Finansieringsvillkor" hint="Köpet gäller bara om köparen får sitt bolån beviljat." />
        <CheckboxRow checked={cond.other} onChange={(v) => set({ other: v })} label="Övrigt villkor" hint="Till exempel att viss inredning ingår i köpet." />
        {cond.other && <Textarea rows={3} value={cond.otherText} onChange={(e) => set({ otherText: e.target.value })} placeholder="Beskriv villkoret…" />}
      </div>
      <Nav onBack={onBack} onNext={onNext} nextLabel="Skapa avtalet" />
    </StepCard>
  )
}
