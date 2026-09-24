import type { Bid, SaleState } from '../state/types'
import { formatDateLong, formatSEK } from './format'
import { BRAND } from '../config/brand'

// Genererar exempeldokument. OBS: Detta är demo – inte juridiskt material.

export interface ContractData {
  seller: string
  buyer: string
  street: string
  city: string
  apartmentNo: string
  association: string
  size: number
  rooms: number
  price: number
  deposit: number
  accessDate: string
  conditions: SaleState['contract']['conditions']
}

export function contractData(s: SaleState, bid: Bid | null): ContractData {
  return {
    seller: s.sellerName,
    buyer: bid?.bidderName ?? 'Anna Andersson',
    street: s.property.street,
    city: s.property.city,
    apartmentNo: s.property.apartmentNo,
    association: s.property.association || 'Bostadsrättsföreningen',
    size: s.property.size,
    rooms: s.property.rooms,
    price: s.contract.price || bid?.amount || 0,
    deposit: s.contract.deposit,
    accessDate: s.contract.accessDate,
    conditions: s.contract.conditions,
  }
}

export function contractSections(d: ContractData): { title: string; body: string }[] {
  const cond: string[] = []
  if (d.conditions.brf) cond.push(`Köpet gäller under förutsättning att köparen godkänns som medlem i ${d.association}. Om köparen inte godkänts senast 30 dagar före tillträdesdagen har vardera parten rätt att häva köpet, varvid erlagd handpenning ska återbetalas.`)
  if (d.conditions.financing) cond.push('Köpet gäller under förutsättning att köparen erhåller lån för finansiering av köpet. Köparen ska senast 14 dagar efter avtalets undertecknande meddela säljaren om villkoret är uppfyllt.')
  if (d.conditions.other && d.conditions.otherText.trim()) cond.push(d.conditions.otherText.trim())

  return [
    { title: '§ 1 Parter', body: `Säljare: ${d.seller}\nKöpare: ${d.buyer}` },
    { title: '§ 2 Överlåtelse', body: `Säljaren överlåter härmed till köparen bostadsrätten till lägenhet nr ${d.apartmentNo} i ${d.association}, belägen ${d.street}, ${d.city}. Lägenheten omfattar ${d.rooms} rum om cirka ${d.size} m².` },
    { title: '§ 3 Köpeskilling', body: `Köpeskillingen är ${formatSEK(d.price)}. Köpeskillingen erläggs genom handpenning enligt § 4 och resterande belopp på tillträdesdagen.` },
    { title: '§ 4 Handpenning', body: `Köparen erlägger en handpenning om ${formatSEK(d.deposit)} i samband med detta avtals undertecknande. Handpenningen deponeras till dess att köpet fullbordats.` },
    { title: '§ 5 Tillträde', body: `Tillträde sker ${formatDateLong(d.accessDate).toLowerCase()} eller den dag parterna gemensamt bestämmer. På tillträdesdagen erlägger köparen resterande köpeskilling mot att säljaren överlämnar nycklar till lägenheten.` },
    { title: '§ 6 Villkor', body: cond.length ? cond.join('\n\n') : 'Köpet är inte förenat med några särskilda villkor.' },
    { title: '§ 7 Lägenhetens skick', body: 'Köparen har beretts tillfälle att undersöka lägenheten och godtar dess skick. Säljaren ska till tillträdesdagen vårda lägenheten väl och lämna den väl städad.' },
    { title: '§ 8 Avgifter och kostnader', body: 'Säljaren svarar för årsavgift och andra kostnader som avser tiden före tillträdesdagen. Köparen svarar för sådana kostnader från och med tillträdesdagen.' },
    { title: '§ 9 Underskrifter', body: 'Detta avtal har upprättats i två likalydande exemplar varav parterna tagit var sitt. Signering sker digitalt.' },
  ]
}

const DEMO_HEADER = `*** DEMO – EJ JURIDISKT BINDANDE ***\nDetta dokument är genererat av en prototyp (${BRAND.name}). Använd det inte i en verklig bostadsaffär.\n\n`

export type DocId = 'objekt' | 'budhistorik' | 'avtal' | 'medlem' | 'handpenning' | 'tilltrade'

export function documentText(id: DocId, s: SaleState, bid: Bid | null): string {
  const p = s.property
  switch (id) {
    case 'objekt':
      return `${DEMO_HEADER}OBJEKTSINFORMATION\n\n${p.street}, ${p.area}, ${p.city}\nLägenhet ${p.apartmentNo}\n${p.rooms} rum, ${p.size} m², våning ${p.floor}\nByggår: ${p.built}\nFörening: ${p.association}\nAvgift: ${formatSEK(p.fee)}/mån\nUtgångspris: ${formatSEK(p.askingPrice)}\n\n${s.description}`
    case 'budhistorik':
      return `${DEMO_HEADER}BUDHISTORIK – ${p.street}\n\n${s.bids.map((b) => `${b.time}  ${formatSEK(b.amount).padStart(14)}  ${b.bidderName}`).join('\n')}\n\nAlla budgivare verifierade med BankID (simulerat).`
    case 'avtal': {
      const d = contractData(s, bid)
      return `${DEMO_HEADER}ÖVERLÅTELSEAVTAL BOSTADSRÄTT\n\n${contractSections(d).map((x) => `${x.title}\n${x.body}`).join('\n\n')}\n\nSignerat digitalt av säljare: ${s.contract.signedBySeller ? 'Ja' : 'Nej'}\nSignerat digitalt av köpare: ${s.contract.signedByBuyer ? 'Ja' : 'Nej'}`
    }
    case 'medlem':
      return `${DEMO_HEADER}MEDLEMSANSÖKAN – ${p.association}\n\nSökande: ${bid?.bidderName ?? '–'}\nLägenhet: ${p.apartmentNo}, ${p.street}\nStatus: ${s.closing.brfApproved ? 'Godkänd av styrelsen' : 'Inskickad, väntar på beslut'}`
    case 'handpenning':
      return `${DEMO_HEADER}HANDPENNINGSUNDERLAG\n\nBelopp: ${formatSEK(s.contract.deposit)}\nBetalare: ${bid?.bidderName ?? '–'}\nMottagare: Depositionskonto (simulerat)\nStatus: ${s.closing.depositRegistered ? 'Registrerad' : 'Ej betald'}`
    case 'tilltrade':
      return `${DEMO_HEADER}TILLTRÄDESDOKUMENT\n\nTillträdesdag: ${formatDateLong(s.contract.accessDate)}\nSlutbetalning: ${formatSEK(s.contract.price - s.contract.deposit)}\nNycklar överlämnade: ${s.closing.keysHandedOver ? 'Ja' : 'Nej'}\nAffären avslutad: ${s.closing.completed ? 'Ja' : 'Nej'}`
  }
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
