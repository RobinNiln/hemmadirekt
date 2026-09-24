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
          { label: 'Samla bud', done: accepted },
          { label: 'Acceptera bud', done: accepted },
          { label: 'Signera avtal', done: signed },
          { label: 'Tillträde', done: s.closing.completed },
        ]
  const firstOpen = items.findIndex((i) => !i.done)
  return items.map((it, i) => ({ ...it, current: i === firstOpen }))
}

export function isSigned(s: SaleState) {
  return s.contract.signedBySeller && s.contract.signedByBuyer
}

export type StatusInfo = { label: string; tone: 'green' | 'amber' | 'grey' }

export function saleStatus(s: SaleState): StatusInfo {
  if (s.closing.completed) return { label: 'Såld – affären är klar', tone: 'green' }
  if (isSigned(s)) return { label: 'Avtal signerat', tone: 'green' }
  if (s.acceptedBidId) return { label: 'Bud accepterat – avtal förbereds', tone: 'amber' }
  if (s.published) return { label: 'Publicerad', tone: 'green' }
  return { label: 'Utkast – ej publicerad', tone: 'grey' }
}
