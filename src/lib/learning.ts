import type { Listing } from '../data/listings'
import type { BuyerState } from '../state/BuyerContext'
import type { BuyerProfile } from './matching'
import { formatSEK } from './format'

// "Vi har märkt något" – en enkel simulering av en lärande funktion.
// Den föreslår bara ändringar; köparen bestämmer alltid själv.

export interface LearningPrompt {
  key: string
  text: string
  patch: (p: BuyerProfile) => Partial<BuyerProfile>
}

export function learningPrompt(buyer: BuyerState, listings: Listing[]): LearningPrompt | null {
  const p = buyer.profile
  if (!p) return null
  const dismissed = buyer.dismissed.map((d) => ({ d, l: listings.find((x) => x.id === d.id) })).filter((x) => x.l) as { d: BuyerState['dismissed'][number]; l: Listing }[]
  const ask = (key: string) => !buyer.learned[key]

  const newBuilds = dismissed.filter((x) => x.l.built >= 2015 || x.l.features.includes('nyproduktion'))
  if (newBuilds.length >= 2 && ask('aldre-hus') && !p.preferredFeatures.some((f) => f.id === 'aldre-hus'))
    return {
      key: 'aldre-hus',
      text: 'Du har tackat nej till flera nyproducerade bostäder. Vill du att vi prioriterar äldre bostäder?',
      patch: (pr) => ({ preferredFeatures: [...pr.preferredFeatures.filter((f) => f.id !== 'nyproduktion'), { id: 'aldre-hus', priority: 'high' }] }),
    }

  const highFee = dismissed.filter((x) => x.d.reasons.includes('För hög avgift'))
  if (highFee.length >= 2 && ask('avgift')) {
    const limit = Math.floor((Math.min(...highFee.map((x) => x.l.fee)) - 1) / 250) * 250
    return {
      key: 'avgift',
      text: `Du har tackat nej till flera bostäder på grund av avgiften. Vill du att vi bara visar bostäder med en avgift under ${formatSEK(limit)}/mån?`,
      patch: () => ({ maxMonthlyFee: limit }),
    }
  }

  const tooExpensive = dismissed.filter((x) => x.d.reasons.includes('För dyr'))
  if (tooExpensive.length >= 2 && ask('pris')) {
    const limit = Math.floor((Math.min(...tooExpensive.map((x) => x.l.price)) - 1) / 100_000) * 100_000
    return {
      key: 'pris',
      text: `Flera bostäder har varit för dyra för dig. Vill du sänka ditt maxpris till ${formatSEK(limit)}?`,
      patch: () => ({ maxPrice: limit }),
    }
  }
  return null
}
