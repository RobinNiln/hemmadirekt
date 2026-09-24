import { useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, CheckCircle2, FileUp, Info, Lock, Plus, Send, Trash2, Upload } from 'lucide-react'
import { Button, Field, Input, Select, Textarea, cn } from './ui'
import { DocStatusBadge } from './DocStatus'
import { useSale } from '../state/SaleContext'
import { buyerPnr, SELLER_PNR } from '../state/presets'
import { buyerHasFinancing, contractName, daysUntil, isSignedContract, type DocItem } from '../lib/docRegistry'
import { includedTexts, settlementTotals } from '../lib/documents'
import { formatDateShort, formatNumber, formatSEK, parseAmount, uid } from '../lib/format'
import type { SettlementItem } from '../state/types'

// Uppladdade filer finns bara kvar under sessionen (de skickas ingenstans).
const uploadedUrls = new Map<string, string>()

// ---------------------------------------------------------------------------
// Innehållet i sidopanelen när man klickar på ett dokument.
// ---------------------------------------------------------------------------
export function DocDetail({ doc }: { doc: DocItem }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoBlock label="Vad är detta?" className="sm:col-span-2">
          {doc.what}
        </InfoBlock>
        <InfoBlock label="När behövs det?">{doc.when}</InfoBlock>
        <InfoBlock label="Vem ansvarar?">{doc.responsible}</InfoBlock>
      </div>
      <div className="rounded-2xl border border-sand-300/70 bg-white p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Status</p>
        <DocStatusBadge kind={doc.status.kind} label={doc.status.label} />
        <div className="mt-5">
          <DocAction doc={doc} />
        </div>
      </div>
      <p className="flex items-start gap-2 text-xs text-ink-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Demo – uppgifterna är påhittade och dokumentet är inte juridiskt material.
      </p>
    </div>
  )
}

function InfoBlock({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl bg-white p-4 ring-1 ring-inset ring-sand-300/70', className)}>
      <p className="text-xs font-semibold uppercase tracking-wider text-petrol-600">{label}</p>
      <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{children}</p>
    </div>
  )
}

function Facts({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-sand-200 rounded-xl border border-sand-200">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
          <dt className="text-ink-muted">{k}</dt>
          <dd className="text-right font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

function Locked({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-sand-100 px-4 py-3 text-sm text-ink-muted">
      <Lock className="mt-0.5 h-4 w-4 shrink-0" /> {children}
    </p>
  )
}

function DoneLine({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 font-semibold text-petrol-700 animate-pop">
      <CheckCircle2 className="h-5 w-5" /> {children}
    </p>
  )
}

function DocAction({ doc }: { doc: DocItem }) {
  const { state, acceptedBid } = useSale()
  const p = state.property
  const navigate = useNavigate()
  const signed = isSignedContract(state)

  switch (doc.id) {
    case 'agare':
      return <Facts rows={[['Namn', state.sellerName], ['Personnummer', SELLER_PNR], ['Ägarandel', `${state.contract.sellerShare} %`], ['Identitet', '✓ Verifierad med BankID']]} />
    case 'objekt':
      return (
        <Facts
          rows={[
            ['Adress', `${p.street}, ${p.postalCode} ${p.city}`],
            ...(p.kind === 'brf' ? ([['Lägenhetsnummer', p.apartmentNo]] as [string, string][]) : ([['Fastighetsbeteckning', p.designation]] as [string, string][])),
            ['Boyta', `${p.size} m²`],
            ['Antal rum', `${p.rooms} rum`],
            ...(p.floor ? ([['Våning', p.floor]] as [string, string][]) : []),
            [p.kind === 'brf' ? 'Månadsavgift' : 'Driftkostnad', `${formatSEK(p.fee)}/mån`],
            ...(p.kind === 'brf' ? ([['Förening', p.association]] as [string, string][]) : []),
            ['Säljarens ägarandel', `${state.contract.sellerShare} %`],
          ]}
        />
      )
    case 'energi':
      return <Facts rows={[['Energiklass', 'C (exempel)'], ['Energiprestanda', '118 kWh/m² och år (exempel)'], ['Giltig till', '2031 (exempel)']]} />
    case 'forening':
      return <AssociationCheck />
    case 'fastighetsbeteckning':
      return <Facts rows={[['Beteckning', p.designation], ['Kommun', p.city], ['Tomtareal', '845 m² (exempel)']]} />
    case 'fastighetsinfo':
      return <Facts rows={[['Tomtareal', '845 m² (exempel)'], ['Byggnader', `Bostadshus (${p.built}), garage`], ['Lagfaren ägare', `${state.sellerName} (100 %)`]]} />
    case 'servitut':
      return <Facts rows={[['Antal servitut', '1 (exempel)'], ['Innebörd', 'Grannfastigheten får använda infartsvägen']]} />
    case 'pantbrev':
      return <Facts rows={[['Uttagna pantbrev', '3 st (exempel)'], ['Totalt belopp', '2 400 000 kr (exempel)']]} />
    case 'inteckningar':
      return <Facts rows={[['Inteckningar', '3 st (exempel)'], ['Totalt belopp', '2 400 000 kr (exempel)']]} />
    case 'taxering':
      return <Facts rows={[['Taxeringsvärde', '3 150 000 kr (exempel)'], ['Typkod', '220 – småhusenhet']]} />
    case 'fragelista':
      return <Questionnaire />
    case 'besiktning':
      return <InspectionUpload />
    case 'budhistorik':
      return (
        <div>
          <p className="mb-3 text-sm text-ink-muted">Budhistoriken skapas automatiskt från registrerade bud.</p>
          {state.bids.length ? (
            <ul className="space-y-1.5">
              {state.bids.map((b) => (
                <li key={b.id} className="flex justify-between rounded-lg bg-sand-100 px-3 py-2 text-sm">
                  <span className="font-semibold">{formatSEK(b.amount)}</span>
                  <span className="text-ink-muted">
                    {b.bidderName.split(' ')[0]} · {b.time}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Locked>Inga bud har kommit in än.</Locked>
          )}
        </div>
      )
    case 'kopare':
      return acceptedBid ? (
        <Facts rows={[['Namn', acceptedBid.bidderName], ['Personnummer', buyerPnr(acceptedBid.bidderId)], ['Identitet', '✓ Verifierad med BankID']]} />
      ) : (
        <Locked>Uppgifterna fylls i automatiskt när du accepterat ett bud.</Locked>
      )
    case 'finansiering':
      return <Financing />
    case 'avtal': {
      const name = contractName(state)
      if (!acceptedBid) return <Locked>Blir tillgängligt när du valt köpare i budgivningen.</Locked>
      const label = signed ? 'Visa avtalet' : state.contract.draftCreated ? 'Fortsätt med avtalet' : `Skapa ${name.toLowerCase()}`
      return (
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">Ett guidat flöde i åtta steg: säljare, köpare, bostaden, pris, tillträde, villkor, vad som ingår och kontroll. Det tar cirka fem minuter.</p>
          <Button onClick={() => navigate('/min-forsaljning/avtal')}>
            {label} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )
    }
    case 'bilagor':
      return state.contract.draftCreated ? (
        <div className="space-y-3 text-sm">
          <p className="font-semibold">Bilaga 1 – Vad ingår i köpet</p>
          <ul className="list-inside list-disc text-ink-soft">
            {includedTexts(state).map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <p className="font-semibold">Bilaga 2 – Objektsinformation</p>
        </div>
      ) : (
        <Locked>Bilagorna skapas automatiskt tillsammans med avtalet.</Locked>
      )
    case 'besiktningsvillkor':
      return (
        <div className="space-y-3 text-sm text-ink-soft">
          <p>{state.contract.conditions.inspection ? 'Besiktningsvillkoret är valt i köpekontraktet.' : 'Besiktningsvillkoret är inte valt. Du kan lägga till det i steget Villkor i köpekontraktet.'}</p>
          {acceptedBid && !signed && (
            <Button variant="secondary" size="sm" onClick={() => navigate('/min-forsaljning/avtal')}>
              Till avtalet
            </Button>
          )}
        </div>
      )
    case 'medlem':
      return <Membership />
    case 'handpenning':
      return <Deposit />
    case 'likvid':
      return <Settlement />
    case 'kopebrev':
      return <Deed />
    case 'slutbetalning':
    case 'nycklar':
      return (
        <div className="space-y-3">
          <p className="text-sm text-ink-soft">Bockas av på tillträdesdagen under fliken Tillträde.</p>
          <Button variant="secondary" onClick={() => navigate('/min-forsaljning/tilltrade')}>
            Till tillträdet <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )
    case 'lagfart':
      return <Title />
  }
}

// ---------------------------------------------------------------- Föreningsinformation
function AssociationCheck() {
  const { state, dispatch } = useSale()
  const p = state.property
  return (
    <div className="space-y-4">
      <Facts
        rows={[
          ['Förening', p.association],
          ['Organisationsnummer', `${p.associationOrgNr} (exempel)`],
          ['Månadsavgift', `${formatSEK(p.fee)}/mån`],
          ['Pantsättning', 'Ingen registrerad (exempel)'],
          ['Förvaltare', 'Exempelförvaltning AB · 08-000 00 00'],
        ]}
      />
      {state.docs.associationVerified ? (
        <DoneLine>Du har kontrollerat uppgifterna</DoneLine>
      ) : (
        <Button onClick={() => dispatch({ type: 'DOCS_PATCH', patch: { associationVerified: true } })}>
          <Check className="h-4 w-4" /> Uppgifterna stämmer
        </Button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- Säljarens frågelista (villa)
const QUESTIONS = ['Känner du till fukt- eller vattenskador?', 'Finns det kända problem med avlopp eller dränering?', 'Har det funnits skadedjur i huset?', 'Har huset renoverats de senaste tio åren?']

function Questionnaire() {
  const { state, dispatch } = useSale()
  const [answers, setAnswers] = useState<Record<number, 'Ja' | 'Nej'>>({})
  const [other, setOther] = useState('')
  if (state.docs.questionnaireDone) return <DoneLine>Frågelistan är ifylld och sparad</DoneLine>
  const complete = QUESTIONS.every((_, i) => answers[i])
  return (
    <div className="space-y-3">
      {QUESTIONS.map((q, i) => (
        <div key={q} className="flex flex-col gap-2 rounded-xl border border-sand-200 p-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm">{q}</span>
          <div className="flex gap-1.5">
            {(['Ja', 'Nej'] as const).map((a) => (
              <button key={a} onClick={() => setAnswers({ ...answers, [i]: a })} className={cn('rounded-lg px-3 py-1.5 text-sm font-semibold ring-1', answers[i] === a ? 'bg-petrol-700 text-white ring-petrol-700' : 'bg-white text-ink-soft ring-sand-300')}>
                {a}
              </button>
            ))}
          </div>
        </div>
      ))}
      <Field label="Övrigt du vill berätta">
        <Textarea rows={3} value={other} onChange={(e) => setOther(e.target.value)} placeholder="T.ex. vilka renoveringar som gjorts" />
      </Field>
      <Button disabled={!complete} onClick={() => dispatch({ type: 'DOCS_PATCH', patch: { questionnaireDone: true } })}>
        Spara frågelistan
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------- Besiktningsprotokoll (uppladdning)
function InspectionUpload() {
  const { state, dispatch } = useSale()
  const ref = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [preview, setPreview] = useState(false)
  const file = state.docs.inspectionFile

  const take = (files: FileList | null) => {
    const f = files?.[0]
    if (!f) return
    uploadedUrls.set(f.name, URL.createObjectURL(f))
    dispatch({ type: 'DOCS_PATCH', patch: { inspectionFile: f.name } })
    setPreview(false)
  }
  const demoFile = () => dispatch({ type: 'DOCS_PATCH', patch: { inspectionFile: `besiktning_${state.property.street.split(' ')[0].toLowerCase()}.pdf` } })

  if (file) {
    const url = uploadedUrls.get(file)
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-mint-300 bg-mint-100/50 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <FileUp className="h-5 w-5 shrink-0 text-petrol-700" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{file}</p>
              <p className="text-xs font-semibold text-petrol-700">✓ Uppladdad</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => (url ? window.open(url, '_blank') : setPreview(!preview))}>
            Visa
          </Button>
          <Button size="sm" variant="secondary" onClick={() => ref.current?.click()}>
            Ersätt
          </Button>
          <Button size="sm" variant="danger" onClick={() => dispatch({ type: 'DOCS_PATCH', patch: { inspectionFile: null } })}>
            <Trash2 className="h-4 w-4" /> Ta bort
          </Button>
        </div>
        {preview && <p className="rounded-xl bg-sand-100 p-4 text-sm text-ink-muted">Förhandsvisning av {file} (simulerad). I prototypen sparas bara filnamnet.</p>}
        <input ref={ref} type="file" className="hidden" onChange={(e) => take(e.target.files)} />
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        take(e.dataTransfer.files)
      }}
      className={cn('flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-8 text-center', over ? 'border-petrol-500 bg-petrol-50' : 'border-sand-300 bg-sand-50')}
    >
      <Upload className="h-7 w-7 text-petrol-600" />
      <p className="mt-2 font-semibold">Drag & drop</p>
      <p className="text-sm text-ink-muted">eller</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => ref.current?.click()}>
          Välj fil
        </Button>
        <Button size="sm" variant="ghost" onClick={demoFile}>
          Använd exempelfil
        </Button>
      </div>
      <p className="mt-3 text-xs text-ink-faint">Filen stannar i din webbläsare – den laddas inte upp någonstans.</p>
      <input ref={ref} type="file" className="hidden" onChange={(e) => take(e.target.files)} />
    </div>
  )
}

// ---------------------------------------------------------------- Finansiering
function Financing() {
  const { state, dispatch, acceptedBid, later } = useSale()
  const [busy, setBusy] = useState(false)
  if (!acceptedBid) return <Locked>Fylls i när du valt köpare.</Locked>
  if (buyerHasFinancing(state, acceptedBid)) return <Facts rows={[['Köpare', acceptedBid.bidderName], ['Lånelöfte', '✓ Registrerat (simulerat)'], ['Täcker köpeskillingen', 'Ja']]} />
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-soft">{acceptedBid.bidderName} har inte registrerat något lånelöfte än. Vi har skickat en påminnelse.</p>
      <Button
        variant="secondary"
        disabled={busy}
        onClick={() => {
          setBusy(true)
          later(1200, () => {
            dispatch({ type: 'DOCS_PATCH', patch: { financingRegistered: true } })
            dispatch({ type: 'NOTIFY', text: `${acceptedBid.bidderName} har registrerat lånelöfte.`, link: '/min-forsaljning/dokument' })
          })
        }}
      >
        Simulera: köparen registrerar lånelöfte
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------- Medlemsansökan BRF
function Membership() {
  const { state, dispatch, acceptedBid, later } = useSale()
  const m = state.docs.membership
  const [phone, setPhone] = useState(m.phone)
  const [email, setEmail] = useState(m.email)
  const [deciding, setDeciding] = useState(false)
  const signed = isSignedContract(state)
  if (!acceptedBid || !signed) return <Locked>Blir tillgängligt när avtalet är signerat av båda parter.</Locked>
  const patch = (x: Partial<typeof m>) => dispatch({ type: 'DOCS_PATCH', patch: { membership: { ...m, ...x } } })

  if (m.approved) return <DoneLine>{acceptedBid.bidderName} är godkänd som medlem i föreningen</DoneLine>
  if (m.sent)
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink-soft">Ansökan är skickad till {state.property.association}. Styrelsen brukar svara inom några veckor.</p>
        <Button
          variant="secondary"
          disabled={deciding}
          onClick={() => {
            setDeciding(true)
            later(1500, () => {
              dispatch({ type: 'DOCS_PATCH', patch: { membership: { ...m, approved: true } } })
              dispatch({ type: 'NOTIFY', text: `Föreningen har godkänt ${acceptedBid.bidderName} som medlem.`, link: '/min-forsaljning/dokument' })
            })
          }}
        >
          {deciding ? 'Styrelsen fattar beslut…' : 'Simulera: föreningen godkänner'}
        </Button>
      </div>
    )
  if (m.created)
    return (
      <div className="space-y-4">
        <DoneLine>Medlemsansökan skapad</DoneLine>
        <Button
          onClick={() => {
            patch({ sent: true })
            dispatch({ type: 'NOTIFY', text: 'Medlemsansökan är skickad till föreningen.', link: '/min-forsaljning/dokument' })
          }}
        >
          <Send className="h-4 w-4" /> Skicka till föreningen
        </Button>
        <p className="text-xs text-ink-muted">Simulerat – inget skickas på riktigt.</p>
      </div>
    )
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">Köparen behöver normalt godkännas som medlem i bostadsrättsföreningen. Vi har fyllt i det vi vet – köparen kompletterar.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Köparens namn">
          <Input value={acceptedBid.bidderName} readOnly />
        </Field>
        <Field label="Personnummer">
          <Input value={buyerPnr(acceptedBid.bidderId)} readOnly />
        </Field>
        <Field label="Telefon">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="E-post">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Tillträdesdatum">
          <Input value={formatDateShort(state.contract.accessDate)} readOnly />
        </Field>
        <Field label="Bostad">
          <Input value={`${state.property.street}, lgh ${state.property.apartmentNo}`} readOnly />
        </Field>
      </div>
      <Button onClick={() => patch({ created: true, phone, email })}>Skapa medlemsansökan</Button>
    </div>
  )
}

// ---------------------------------------------------------------- Handpenning
function Deposit() {
  const { state, dispatch, later } = useSale()
  const dep = state.docs.deposit
  const signed = isSignedContract(state)
  if (!signed) return <Locked>Blir tillgängligt när avtalet är signerat.</Locked>
  const days = daysUntil(dep.dueDate)
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-petrol-800 p-5 text-white">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Handpenning</p>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-mint-200">{dep.registered ? 'Registrerad' : 'Väntar'}</span>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-petrol-200">Köpeskilling</dt>
            <dd className="font-semibold">{formatSEK(state.contract.price)}</dd>
          </div>
          <div>
            <dt className="text-petrol-200">Handpenning</dt>
            <dd className="font-semibold">{formatSEK(state.contract.deposit)}</dd>
          </div>
          <div>
            <dt className="text-petrol-200">Förfallodatum</dt>
            <dd className="font-semibold">{formatDateShort(dep.dueDate)}</dd>
          </div>
        </dl>
        {!dep.registered && days >= 0 && <p className="mt-3 text-xs text-amber-200">⚠ Förfaller om {days} {days === 1 ? 'dag' : 'dagar'}</p>}
      </div>
      {dep.registered ? (
        <DoneLine>Handpenningen har registrerats</DoneLine>
      ) : dep.created ? (
        <>
          <DoneLine>Handpenningsunderlag klart</DoneLine>
          <p className="text-sm text-ink-muted">Väntar på att köparen betalar…</p>
        </>
      ) : (
        <Button
          onClick={() => {
            dispatch({ type: 'DOCS_PATCH', patch: { deposit: { ...dep, created: true } } })
            later(2200, () => {
              dispatch({ type: 'DOCS_PATCH', patch: { deposit: { ...dep, created: true, registered: true } } })
              dispatch({ type: 'NOTIFY', text: `Handpenningen på ${formatSEK(state.contract.deposit)} har registrerats.`, link: '/min-forsaljning/dokument' })
            })
          }}
        >
          Skapa handpenningsunderlag
        </Button>
      )}
      <p className="text-xs text-ink-muted">Inga riktiga betalningar görs i prototypen.</p>
    </div>
  )
}

// ---------------------------------------------------------------- Likvidavräkning
function Settlement() {
  const { state, dispatch } = useSale()
  const s = state.docs.settlement
  const [type, setType] = useState<SettlementItem['type']>('Avdrag')
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  if (!isSignedContract(state)) return <Locked>Görs inför tillträdet, när avtalet är signerat.</Locked>
  const { remaining } = settlementTotals(state)
  const setItems = (items: SettlementItem[]) => dispatch({ type: 'DOCS_PATCH', patch: { settlement: { ...s, items } } })

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-sand-200 bg-white">
        <Row label="Köpeskilling" value={formatSEK(state.contract.price)} />
        <Row label="– Handpenning" value={formatSEK(state.contract.deposit)} />
        {s.items.map((it) => (
          <Row
            key={it.id}
            label={`${it.type === 'Avdrag' ? '–' : '+'} ${it.label} (${it.type.toLowerCase()})`}
            value={formatSEK(it.amount)}
            onRemove={s.created ? undefined : () => setItems(s.items.filter((x) => x.id !== it.id))}
          />
        ))}
        <div className="flex justify-between border-t-2 border-ink px-4 py-3 font-bold">
          <span>Kvar att betala</span>
          <span>{formatSEK(remaining)}</span>
        </div>
      </div>
      {!s.created && (
        <>
          <div className="rounded-xl bg-sand-100 p-4">
            <p className="mb-2 text-sm font-semibold">Lägg till post</p>
            <div className="grid gap-2 sm:grid-cols-[120px_1fr_130px_auto]">
              <Select value={type} onChange={(e) => setType(e.target.value as SettlementItem['type'])} className="h-10 text-sm">
                <option>Avdrag</option>
                <option>Tillägg</option>
                <option>Avgift</option>
                <option>Övrigt</option>
              </Select>
              <Input className="h-10 text-sm" placeholder="T.ex. förskottsbetald avgift" value={label} onChange={(e) => setLabel(e.target.value)} />
              <Input className="h-10 text-sm" inputMode="numeric" placeholder="Belopp" value={amount} onChange={(e) => setAmount(parseAmount(e.target.value) ? formatNumber(parseAmount(e.target.value)) : '')} />
              <Button
                size="sm"
                variant="secondary"
                className="h-10"
                disabled={!label.trim() || !parseAmount(amount)}
                onClick={() => {
                  setItems([...s.items, { id: uid('s'), type, label: label.trim(), amount: parseAmount(amount) }])
                  setLabel('')
                  setAmount('')
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button onClick={() => dispatch({ type: 'DOCS_PATCH', patch: { settlement: { ...s, created: true } } })}>Skapa likvidavräkning</Button>
        </>
      )}
      {s.created && <DoneLine>Likvidavräkningen är klar</DoneLine>}
    </div>
  )
}

function Row({ label, value, onRemove }: { label: string; value: string; onRemove?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-sand-100 px-4 py-2.5 text-sm last:border-0">
      <span className="text-ink-soft">{label}</span>
      <span className="flex items-center gap-2 font-medium">
        {value}
        {onRemove && (
          <button onClick={onRemove} className="text-ink-faint hover:text-red-700" aria-label="Ta bort post">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------- Köpebrev (villa)
function Deed() {
  const { state, dispatch } = useSale()
  if (state.docs.deedPrepared) return <DoneLine>Köpebrevet är förberett och sparat</DoneLine>
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-soft">"Bekräftar att köpeskillingen har betalats och att köpet fullföljts."</p>
      {state.closing.finalPayment ? (
        <Button onClick={() => dispatch({ type: 'DOCS_PATCH', patch: { deedPrepared: true } })}>Förbered köpebrev</Button>
      ) : (
        <Locked>Skapas på tillträdesdagen, när slutbetalningen är mottagen.</Locked>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- Lagfart (villa)
function Title() {
  const { state, dispatch } = useSale()
  const items = [
    { label: 'Köpekontrakt klart', done: isSignedContract(state) },
    { label: 'Köpebrev klart', done: state.docs.deedPrepared },
    { label: 'Tillträde genomfört', done: state.closing.completed },
  ]
  const ready = items.every((i) => i.done)
  return (
    <div className="space-y-4">
      <p className="font-semibold">Ansök om lagfart</p>
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li key={i.label} className={cn('flex items-center gap-2 text-sm', i.done ? 'text-ink' : 'text-ink-muted')}>
            {i.done ? <Check className="h-4 w-4 text-petrol-600" strokeWidth={3} /> : <span className="h-4 w-4 rounded-full border-2 border-sand-300" />}
            {i.label}
          </li>
        ))}
      </ul>
      {state.docs.titlePrepared ? (
        <p className="rounded-xl bg-mint-100 p-4 text-sm text-petrol-800">Underlaget är förberett. I en framtida version kan detta flöde integreras med relevant myndighetsprocess.</p>
      ) : (
        <Button disabled={!ready} onClick={() => dispatch({ type: 'DOCS_PATCH', patch: { titlePrepared: true } })}>
          Förbered lagfartsunderlag
        </Button>
      )}
      {!ready && <p className="text-xs text-ink-muted">Blir tillgängligt när punkterna ovan är klara.</p>}
    </div>
  )
}
