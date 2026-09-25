import type { ChecklistItem } from '../components/ui'
import type { SaleState } from './types'

// Räknar ut försäljningens framsteg – används i dashboarden.
export function saleProgress(s: SaleState): ChecklistItem[] {
  const accepted = s.acceptedBidId !== null
  const signed = s.contract.signedBySeller && s.contract.signedByBuyer
  const items: ChecklistItem[] =
    s.mode === 'direct'
      ? [
          { label: 'Bostad registrerad', done: true },
          { label: 'Köpare tillagd', done: true },
          { label: 'Skapa avtal', done: s.contract.approved },
          { label: 'Signera avtal', done: signed },
          { label: 'Tillträde', done: s.closing.completed },
        ]
      : [
          { label: 'Bostad skapad', done: true },
          { label: 'Annons publicerad', done: s.published },
          { label: 'Visning bokad', done: !!s.viewing?.published },
          { label: 'Ta emot köpförfrågningar', done: accepted },
          { label: 'Välj köpare', done: accepted },
          { label: 'Signera avtal', done: signed },
          { label: 'Tillträde', done: s.closing.completed },
        ]
  const firstOpen = items.findIndex((i) => !i.done)
  return items.map((it, i) => ({ ...it, current: i === firstOpen }))
}

export function isSigned(s: SaleState) {
  return s.contract.signedBySeller && s.contract.signedByBuyer
}

export type StatusTone = 'green' | 'amber' | 'blue' | 'violet' | 'black' | 'grey'
export type StatusInfo = { label: string; tone: StatusTone }

// Bostadens status: 🟢 Till salu · 🟠 Affär pågår · 🔵 Kontrakt förbereds · 🟣 Kontrakt klart · ⚫ Såld
export function saleStatus(s: SaleState): StatusInfo {
  if (s.closing.completed) return { label: 'Såld', tone: 'black' }
  if (isSigned(s)) return { label: 'Kontrakt klart', tone: 'violet' }
  if (s.acceptedBidId && (s.contract.draftCreated || s.contract.step > 1)) return { label: 'Kontrakt förbereds', tone: 'blue' }
  if (s.acceptedBidId) return { label: 'Affär pågår', tone: 'amber' }
  if (s.published || s.mode === 'direct') return { label: 'Till salu', tone: 'green' }
  return { label: 'Utkast – ej publicerad', tone: 'grey' }
}
