import type { Listing } from '../data/listings'
import { BUYER_BANK, type BankBuyer } from '../data/buyers'
import { matchListing, prefLabel, reqLabel, type MatchResult } from './matching'
import { formatSEK } from './format'

// Matchar en säljares bostad mot hela köparbanken – samma motor som köparna använder.
export interface BankMatch {
  buyer: BankBuyer
  match: MatchResult
}

export function matchBuyers(listing: Listing) {
  const all: BankMatch[] = BUYER_BANK.map((buyer) => ({ buyer, match: matchListing(listing, buyer) })).filter((x) => x.match.level !== 'Ingen match')
  all.sort((a, b) => b.match.score - a.match.score)
  const veryGood = all.filter((x) => x.match.level === 'Mycket bra match').length
  const notified = all.filter((x) => x.match.score >= 75).length // mycket bra + bra får notis direkt
  return { list: all, total: all.length, veryGood, possible: all.length - veryGood, notified }
}

// Anonymiserad sammanfattning – inga personuppgifter.
export function describeBuyer(b: BankBuyer) {
  const seeking = `Minst ${b.minRooms} rum · minst ${b.minLivingArea} m²`
  const important = [
    ...b.requiredFeatures.map(reqLabel),
    ...b.preferredFeatures.filter((p) => p.priority === 'high').map((p) => prefLabel(p.id)),
    ...(b.wholeStockholm ? ['Hela Stockholm'] : b.preferredAreas),
  ].slice(0, 3)
  return { seeking, maxPrice: formatSEK(b.maxPrice), important }
}

export const shortLevel = (l: string) => l.replace(' match', '')
