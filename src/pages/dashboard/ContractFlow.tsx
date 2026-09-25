import { useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, FileSignature, ListChecks, Info, Pencil, PenLine, Sparkles, UserRound } from 'lucide-react'
import { Button, Card, CheckboxRow, Field, Input, PageHeader, ProgressBar, Spinner, StepIndicator, Textarea, cn } from '../../components/ui'
import { ContractDocument } from '../../components/ContractDocument'
import { BankIdModal } from '../../components/BankIdModal'
import { useSale } from '../../state/SaleContext'
import { buyerPnr, INCLUDED_OPTIONS, SELLER_PNR } from '../../state/presets'
import { contractData } from '../../lib/documents'
import { contractName, nextStep } from '../../lib/docRegistry'
import { formatDateShort, formatNumber, formatSEK, parseAmount } from '../../lib/format'
import { EmptyPanel } from './DashboardLayout'

const STEPS = ['Säljare', 'Köpare', 'Bostaden', 'Pris', 'Tillträde', 'Villkor', 'Vad ingår?', 'Kontroll']

function isoInDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export default function ContractFlow() {
  const { state, dispatch, acceptedBid, highestBid, later } = useSale()
  const c = state.contract
  const [bankId, setBankId] = useState(false)
  const [buyerSigning, setBuyerSigning] = useState(false)
  const name = contractName(state)
  const brf = state.property.kind === 'brf'

  if (!acceptedBid) {
    return (
      <div className="space-y-6">
        <PageHeader title="Avtal" />
        <EmptyPanel icon={<FileSignature className="h-7 w-7" />} title="Avtalet skapas när du valt köpare" text="När du valt vilken köpare du vill gå vidare med guidar vi dig genom avtalet – steg för steg.">
          <Button to="/min-forsaljning/forfragningar">
            <ListChecks className="h-4 w-4" /> Till köpförfrågningarna
          </Button>
        </EmptyPanel>
      </div>
    )
  }

  const data = contractData(state, acceptedBid)
  const signed = c.signedBySeller && c.signedByBuyer
  const stage: 'wizard' | 'draft' | 'signing' | 'done' = signed ? 'done' : c.approved ? 'signing' : c.draftCreated ? 'draft' : 'wizard'
  const setStep = (n: number) => {
    dispatch({ type: 'CONTRACT_PATCH', patch: { step: n } })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const patch = (p: Partial<typeof c>) => dispatch({ type: 'CONTRACT_PATCH', patch: p })

  const simulateBuyerSigning = () => {
    setBuyerSigning(true)
    later(2000, () => {
      dispatch({ type: 'CONTRACT_PATCH', patch: { signedByBuyer: true } })
      // Handpenningen förfaller strax efter signering.
      dispatch({ type: 'DOCS_PATCH', patch: { deposit: { ...state.docs.deposit, dueDate: isoInDays(2) } } })
      dispatch({ type: 'NOTIFY', text: `${acceptedBid.bidderName} har signerat. ${name}et är klart!`, link: '/min-forsaljning/dokument' })
      setBuyerSigning(false)
    })
  }

  const title = { wizard: `Skapa ${name.toLowerCase()}`, draft: `${name} – utkast`, signing: 'Signera avtalet', done: `${name}et är signerat` }[stage]

  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={stage === 'wizard' ? 'Vi går igenom avtalet tillsammans, en sak i taget. Det tar cirka fem minuter.' : undefined} />

      {stage === 'wizard' && (
        <div>
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold">
              Steg {c.step} av {STEPS.length}
            </span>
            <span className="text-ink-muted">{STEPS[c.step - 1]}</span>
          </div>
          <ProgressBar value={(c.step / STEPS.length) * 100} />
          <StepIndicator steps={STEPS} current={c.step} className="mt-4 hidden md:flex" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 animate-rise" key={stage + c.step}>
          {stage === 'wizard' && c.step === 1 && (
            <StepCard title="Säljare" text="Kontrollera dina uppgifter och hur stor del av bostaden du äger.">
              <PartyCard role="Säljare" name={data.seller} pnr={SELLER_PNR} />
              <Field label="Ägarandel (%)" className="mt-4 max-w-[200px]" hint="Äger ni bostaden tillsammans behöver alla ägare vara med i avtalet.">
                <Input inputMode="numeric" value={String(c.sellerShare)} onChange={(e) => patch({ sellerShare: Math.min(100, parseAmount(e.target.value)) })} />
              </Field>
              <Nav onNext={() => setStep(2)} nextLabel="Stämmer" disabled={!c.sellerShare} />
            </StepCard>
          )}

          {stage === 'wizard' && c.step === 2 && (
            <StepCard title="Köpare" text="Köparen legitimerade sig med BankID när köpförfrågan skickades.">
              <PartyCard role="Köpare" name={data.buyer} pnr={buyerPnr(acceptedBid.bidderId)} verifiedLabel="Identitet verifierad" />
              <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Stämmer" />
            </StepCard>
          )}

          {stage === 'wizard' && c.step === 3 && (
            <StepCard title="Bostaden" text="Det här är bostaden som avtalet gäller.">
              <div className="rounded-xl border border-sand-300 p-5">
                <p className="text-xl font-bold">{state.property.street}</p>
                <p className="text-ink-muted">
                  {state.property.postalCode} {state.property.city}
                </p>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {brf ? (
                    <>
                      <Fact k="Lägenhet" v={state.property.apartmentNo} />
                      <Fact k="Förening" v={state.property.association} />
                    </>
                  ) : (
                    <>
                      <Fact k="Fastighetsbeteckning" v={state.property.designation} />
                      <Fact k="Upplåtelseform" v="Äganderätt" />
                    </>
                  )}
                  <Fact k="Boyta" v={`${state.property.size} m²`} />
                  <Fact k="Rum" v={`${state.property.rooms} rum`} />
                </dl>
              </div>
              <Nav onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel="Stämmer" />
            </StepCard>
          )}

          {stage === 'wizard' && c.step === 4 && <PriceStep onBack={() => setStep(3)} onNext={() => setStep(5)} />}

          {stage === 'wizard' && c.step === 5 && (
            <StepCard title="Tillträde" text="Tillträdesdagen är dagen då köparen betalar resten av köpeskillingen och får nycklarna.">
              <Field label="Tillträdesdag" hint={acceptedBid.desiredAccess ? `Köparen önskade ${formatDateShort(acceptedBid.desiredAccess)} i sin köpförfrågan.` : 'Köparen är flexibel – kom överens om ett datum.'}>
                <Input type="date" value={c.accessDate} onChange={(e) => patch({ accessDate: e.target.value })} className="max-w-xs" />
              </Field>
              <Hint>Vanligt är 1–3 månader efter avtalet. {brf ? 'Köparen behöver hinna bli godkänd av föreningen.' : 'Köparen behöver hinna ordna lån och pantbrev.'}</Hint>
              <Nav onBack={() => setStep(4)} onNext={() => setStep(6)} disabled={!c.accessDate} />
            </StepCard>
          )}

          {stage === 'wizard' && c.step === 6 && <ConditionsStep onBack={() => setStep(5)} onNext={() => setStep(7)} />}

          {stage === 'wizard' && c.step === 7 && <IncludedStep onBack={() => setStep(6)} onNext={() => setStep(8)} />}

          {stage === 'wizard' && c.step === 8 && (
            <StepCard title="Kontroll" text="Stämmer allt? Klicka på Ändra för att justera något.">
              <dl className="divide-y divide-sand-200 rounded-xl border border-sand-200">
                {[
                  ['Säljare', data.seller, 1],
                  ['Köpare', data.buyer, 2],
                  ['Bostad', brf ? `${data.street}, lägenhet ${data.apartmentNo}` : `${data.street}, ${data.designation}`, 3],
                  ['Pris', formatSEK(data.price), 4],
                  ['Handpenning', formatSEK(data.deposit), 4],
                  ['Tillträde', formatDateShort(data.accessDate), 5],
                  ['Villkor', data.conditions.length ? data.conditions.join(' ') : 'Inga särskilda villkor', 6],
                  ['Ingår i köpet', data.included.join(', ') || '–', 7],
                ].map(([k, v, s]) => (
                  <div key={k as string} className="flex items-start justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <dt className="text-sm font-semibold">{k}</dt>
                      <dd className="text-[15px] text-ink-soft">{v}</dd>
                    </div>
                    <button className="shrink-0 text-sm font-semibold text-petrol-700 hover:underline" onClick={() => setStep(s as number)}>
                      Ändra
                    </button>
                  </div>
                ))}
              </dl>
              <Nav
                onBack={() => setStep(7)}
                onNext={() => {
                  patch({ draftCreated: true })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                nextLabel="Skapa avtalsutkast"
              />
            </StepCard>
          )}

          {stage === 'draft' && (
            <div className="space-y-4">
              <ContractDocument data={data} draft />
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button variant="secondary" onClick={() => patch({ draftCreated: false, step: 8 })}>
                  <Pencil className="h-4 w-4" /> Redigera uppgifter
                </Button>
                <Button size="lg" onClick={() => patch({ approved: true })}>
                  Godkänn för signering <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {stage === 'signing' && (
            <StepCard title="Signera avtalet" text="Både du och köparen signerar digitalt med BankID. Avtalet gäller när båda har signerat.">
              <div className="space-y-3">
                <SignRow
                  name={data.seller}
                  role="Du (säljare)"
                  done={c.signedBySeller}
                  action={
                    <Button onClick={() => setBankId(true)}>
                      <PenLine className="h-4 w-4" /> Signera med BankID
                    </Button>
                  }
                />
                <SignRow
                  name={data.buyer}
                  role="Köpare"
                  done={c.signedByBuyer}
                  action={
                    c.signedBySeller ? (
                      <Button variant="secondary" onClick={simulateBuyerSigning} disabled={buyerSigning}>
                        {buyerSigning && <Spinner className="h-4 w-4" />}
                        {buyerSigning ? 'Köparen signerar…' : 'Simulera att köparen signerar'}
                      </Button>
                    ) : (
                      <span className="text-sm text-ink-muted">Bjuds in när du signerat</span>
                    )
                  }
                />
              </div>
              <Hint>Signeringen är simulerad. När båda har signerat sparas avtalet under Dokument.</Hint>
              <div className="mt-6">
                <Button variant="ghost" onClick={() => patch({ approved: false })} disabled={c.signedBySeller}>
                  <ArrowLeft className="h-4 w-4" /> Tillbaka till utkastet
                </Button>
              </div>
            </StepCard>
          )}

          {stage === 'done' && <DoneView />}
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
        title={`Signera ${name.toLowerCase()}et`}
        action="signera avtalet"
        doneText="Du har signerat avtalet."
        onDone={() => {
          setBankId(false)
          dispatch({ type: 'CONTRACT_PATCH', patch: { signedBySeller: true } })
        }}
      />
    </div>
  )

  function DoneView() {
    const next = nextStep(state, acceptedBid, highestBid)
    return (
      <div className="space-y-6">
        <Card className="p-6 text-center sm:p-10 animate-pop">
          <CheckCircle2 className="mx-auto h-16 w-16 text-petrol-600" />
          <h2 className="mt-4 text-2xl font-bold">Avtalet är klart.</h2>
          <p className="mx-auto mt-2 max-w-md text-ink-muted">Båda parter har signerat. Avtalet och bilagorna är sparade under Dokument.</p>
        </Card>
        <div className="rounded-2xl bg-petrol-800 p-6 text-white shadow-card">
          <p className="flex items-center gap-2 text-sm font-semibold text-mint-200">
            <Sparkles className="h-4 w-4" /> Nästa steg
          </p>
          <h3 className="mt-1 text-xl font-bold">{next.title}</h3>
          <p className="mt-1 text-petrol-100">{next.text}</p>
          <Button to={next.to} variant="accent" size="lg" className="mt-5">
            {next.cta} <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
        <ContractDocument data={data} signed={{ seller: true, buyer: true }} />
      </div>
    )
  }
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

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  )
}

function PartyCard({ role, name, pnr, verifiedLabel = 'Verifierad med BankID' }: { role: string; name: string; pnr: string; verifiedLabel?: string }) {
  return (
    <div className="rounded-xl border border-sand-300 p-5">
      <p className="text-sm text-ink-muted">{role}</p>
      <div className="mt-2 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-petrol-100 text-petrol-800">
          <UserRound className="h-5 w-5" />
        </span>
        <div>
          <p className="text-lg font-bold">{name}</p>
          <p className="text-sm text-ink-muted">{pnr}</p>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-petrol-700">
        <BadgeCheck className="h-4 w-4" /> ✓ {verifiedLabel}
      </p>
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
    <StepCard title="Pris" text="Köpeskillingen kommer från köpförfrågan du valde att gå vidare med.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-sand-100 p-5">
          <p className="text-sm text-ink-muted">Köpeskilling</p>
          <p className="text-2xl font-bold">{formatSEK(c.price)}</p>
        </div>
        <Field label="Handpenning (kr)" hint={`${pct.toFixed(1).replace('.', ',')} % av köpeskillingen`}>
          <Input inputMode="numeric" value={deposit} onChange={(e) => setDeposit(parseAmount(e.target.value) ? formatNumber(parseAmount(e.target.value)) : '')} />
        </Field>
      </div>
      <Hint>Handpenningen är normalt en del av köpeskillingen och betalas före tillträdet. Oftast är den 10 %.</Hint>
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
  const brf = state.property.kind === 'brf'
  const set = (patch: Partial<typeof cond>) => dispatch({ type: 'SET_CONDITIONS', conditions: { ...cond, ...patch } })
  return (
    <StepCard title="Villkor" text="Villkor gör att köpet bara gäller om vissa saker uppfylls. Välj de som passar er affär.">
      <div className="space-y-3">
        {brf ? (
          <CheckboxRow checked={cond.brf} onChange={(v) => set({ brf: v })} label="Köparen ska godkännas som medlem i bostadsrättsföreningen" hint="Rekommenderas alltid vid köp av bostadsrätt." />
        ) : (
          <CheckboxRow checked={cond.inspection} onChange={(v) => set({ inspection: v })} label="Besiktningsvillkor" hint="Köparen får besiktiga huset efter kontraktet och kan häva köpet vid allvarliga fel." />
        )}
        <CheckboxRow checked={cond.financing} onChange={(v) => set({ financing: v })} label="Finansieringsvillkor" hint="Köpet gäller bara om köparen får sitt lån beviljat." />
        <CheckboxRow checked={cond.sale} onChange={(v) => set({ sale: v })} label="Försäljningsvillkor" hint="Köpet gäller bara om köparen lyckas sälja sin nuvarande bostad." />
        <CheckboxRow checked={cond.other} onChange={(v) => set({ other: v })} label="Annat villkor" />
        {cond.other && <Textarea rows={3} value={cond.otherText} onChange={(e) => set({ otherText: e.target.value })} placeholder="Beskriv villkoret…" />}
      </div>
      <Nav onBack={onBack} onNext={onNext} />
    </StepCard>
  )
}

function IncludedStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { state, dispatch } = useSale()
  const c = state.contract
  const options = INCLUDED_OPTIONS[state.property.kind]
  const toggle = (item: string, on: boolean) => dispatch({ type: 'CONTRACT_PATCH', patch: { included: on ? [...c.included, item] : c.included.filter((i) => i !== item) } })
  return (
    <StepCard title="Vad ingår?" text="Bocka i det som följer med bostaden. Det undviker missförstånd på tillträdesdagen.">
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <CheckboxRow key={o} checked={c.included.includes(o)} onChange={(v) => toggle(o, v)} label={o} />
        ))}
      </div>
      <Field label="Övrigt" className="mt-4">
        <Textarea rows={2} value={c.includedOther} onChange={(e) => dispatch({ type: 'CONTRACT_PATCH', patch: { includedOther: e.target.value } })} placeholder="T.ex. hyllan i hallen och gardinstängerna" />
      </Field>
      <Nav onBack={onBack} onNext={onNext} />
    </StepCard>
  )
}
