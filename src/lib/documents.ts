import type { Bid, SaleState } from '../state/types'
import { buyerPnr, SELLER_PNR } from '../state/presets'
import { formatDateLong, formatDateShort, formatSEK } from './format'
import { BRAND } from '../config/brand'
import { buildDocs, contractName, type DocId } from './docRegistry'

// Genererar exempeldokument. OBS: Detta är demo – inte juridiskt material.
// De juridiska delarna består medvetet av tydlig demotext.

export interface ContractData {
  kind: 'brf' | 'villa'
  title: string
  seller: string
  sellerPnr: string
  sellerShare: number
  buyer: string
  buyerPnr: string
  street: string
  postalCode: string
  city: string
  apartmentNo: string
  designation: string
  association: string
  size: number
  rooms: number
  price: number
  deposit: number
  accessDate: string
  conditions: string[]
  included: string[]
}

export function conditionTexts(s: SaleState): string[] {
  const c = s.contract.conditions
  const out: string[] = []
  if (s.property.kind === 'brf' && c.brf) out.push('Köparen ska godkännas som medlem i bostadsrättsföreningen.')
  if (s.property.kind === 'villa' && c.inspection) out.push('Besiktningsvillkor: köparen får besiktiga fastigheten efter kontraktet.')
  if (c.financing) out.push('Finansieringsvillkor: köpet gäller om köparen får lån beviljat.')
  if (c.sale) out.push('Försäljningsvillkor: köpet gäller om köparen säljer sin nuvarande bostad.')
  if (c.other && c.otherText.trim()) out.push(c.otherText.trim())
  return out
}

export function includedTexts(s: SaleState): string[] {
  const list = [...s.contract.included]
  if (s.contract.includedOther.trim()) list.push(s.contract.includedOther.trim())
  return list
}

export function contractData(s: SaleState, bid: Bid | null): ContractData {
  return {
    kind: s.property.kind,
    title: s.property.kind === 'brf' ? 'Överlåtelseavtal bostadsrätt' : 'Köpekontrakt fastighet',
    seller: s.sellerName,
    sellerPnr: SELLER_PNR,
    sellerShare: s.contract.sellerShare,
    buyer: bid?.bidderName ?? 'Anna Andersson',
    buyerPnr: buyerPnr(bid?.bidderId),
    street: s.property.street,
    postalCode: s.property.postalCode,
    city: s.property.city,
    apartmentNo: s.property.apartmentNo,
    designation: s.property.designation,
    association: s.property.association,
    size: s.property.size,
    rooms: s.property.rooms,
    price: s.contract.price || bid?.amount || 0,
    deposit: s.contract.deposit,
    accessDate: s.contract.accessDate,
    conditions: conditionTexts(s),
    included: includedTexts(s),
  }
}

const DEMO_CLAUSE = '[Demotext] I ett riktigt avtal står här de juridiska bestämmelserna för denna punkt. Prototypen genererar inte juridisk text.'

export function contractSections(d: ContractData): { title: string; body: string; demo?: boolean }[] {
  const object =
    d.kind === 'brf'
      ? `Bostadsrätten till lägenhet nr ${d.apartmentNo} i ${d.association}, ${d.street}, ${d.postalCode} ${d.city}. ${d.rooms} rum, cirka ${d.size} m².`
      : `Fastigheten ${d.designation}, ${d.street}, ${d.postalCode} ${d.city}. ${d.rooms} rum, cirka ${d.size} m² boyta.`
  return [
    { title: '§ 1 Parter', body: `Säljare: ${d.seller} (${d.sellerPnr}), ägarandel ${d.sellerShare} %\nKöpare: ${d.buyer} (${d.buyerPnr})` },
    { title: d.kind === 'brf' ? '§ 2 Överlåtelse' : '§ 2 Fastighet', body: `${object}\n${DEMO_CLAUSE}`, demo: true },
    { title: '§ 3 Köpeskilling', body: `${formatSEK(d.price)}\n${DEMO_CLAUSE}`, demo: true },
    { title: '§ 4 Handpenning', body: `${formatSEK(d.deposit)}\n${DEMO_CLAUSE}`, demo: true },
    { title: '§ 5 Tillträde', body: `${formatDateLong(d.accessDate)}\n${DEMO_CLAUSE}`, demo: true },
    { title: '§ 6 Villkor', body: `${d.conditions.length ? d.conditions.join('\n') : 'Inga särskilda villkor.'}\n${DEMO_CLAUSE}`, demo: true },
    { title: '§ 7 Vad ingår i köpet', body: d.included.length ? d.included.join(', ') + '.' : 'Inget särskilt angivet.' },
    { title: '§ 8 Skick, avgifter och övrigt', body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. ${DEMO_CLAUSE}`, demo: true },
    { title: '§ 9 Underskrifter', body: 'Signering sker digitalt (simulerat i prototypen).' },
  ]
}

const DEMO_HEADER = `*** DEMO – EJ JURIDISKT BINDANDE ***\nDetta dokument är genererat av en prototyp (${BRAND.name}). Använd det inte i en verklig bostadsaffär.\n\n`

export function settlementTotals(s: SaleState) {
  const sign = (t: string) => (t === 'Avdrag' ? -1 : 1)
  const adjustments = s.docs.settlement.items.reduce((sum, it) => sum + sign(it.type) * it.amount, 0)
  const remaining = s.contract.price - s.contract.deposit + adjustments
  return { adjustments, remaining }
}

export function documentText(id: DocId, s: SaleState, bid: Bid | null): string {
  const p = s.property
  const name = buildDocs(s, bid).find((x) => x.id === id)?.name ?? id
  const head = `${DEMO_HEADER}${name.toUpperCase()}\n${p.street}, ${p.postalCode} ${p.city}\n\n`
  switch (id) {
    case 'avtal': {
      const d = contractData(s, bid)
      return `${DEMO_HEADER}${d.title.toUpperCase()}\n\n${contractSections(d).map((x) => `${x.title}\n${x.body}`).join('\n\n')}\n\nSignerat av säljare: ${s.contract.signedBySeller ? 'Ja' : 'Nej'}\nSignerat av köpare: ${s.contract.signedByBuyer ? 'Ja' : 'Nej'}`
    }
    case 'budhistorik':
      return `${head}${s.bids.map((b) => `${b.time}  ${formatSEK(b.amount).padStart(14)}  ${b.bidderName}`).join('\n')}\n\nAlla budgivare verifierade med BankID (simulerat).`
    case 'likvid': {
      const t = settlementTotals(s)
      return `${head}Köpeskilling: ${formatSEK(s.contract.price)}\n– Handpenning: ${formatSEK(s.contract.deposit)}\n${s.docs.settlement.items.map((i) => `${i.type === 'Avdrag' ? '–' : '+'} ${i.label}: ${formatSEK(i.amount)}`).join('\n')}\n\nKvar att betala: ${formatSEK(t.remaining)}`
    }
    case 'handpenning':
      return `${head}Köpeskilling: ${formatSEK(s.contract.price)}\nHandpenning: ${formatSEK(s.contract.deposit)}\nFörfallodatum: ${formatDateShort(s.docs.deposit.dueDate)}\nStatus: ${s.docs.deposit.registered ? 'Registrerad' : 'Väntar på betalning'}`
    case 'medlem':
      return `${head}Förening: ${p.association}\nSökande: ${bid?.bidderName ?? '–'} (${buyerPnr(bid?.bidderId)})\nLägenhet: ${p.apartmentNo}\nTillträde: ${formatDateShort(s.contract.accessDate)}\nStatus: ${s.docs.membership.approved ? 'Godkänd' : s.docs.membership.sent ? 'Skickad, väntar på beslut' : 'Skapad'}`
    case 'bilagor':
      return `${head}Bilaga 1: Vad ingår i köpet\n${includedTexts(s).map((i) => '– ' + i).join('\n')}\n\nBilaga 2: Objektsinformation (se separat dokument)`
    default:
      return `${head}${name} – exempeldokument.\n\nUppgifterna i prototypen är påhittade och hämtas inte från något register.`
  }
}

export function contractTitle(s: SaleState) {
  return contractName(s)
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
