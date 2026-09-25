import type { BuyerProfile, PreferenceId, Priority, RequirementId } from '../lib/matching'
import type { PropertyType } from './listings'

// ---------------------------------------------------------------------------
// KÖPARBANKEN – anonyma, registrerade köparprofiler (mockdata).
// Säljare ser aldrig namn eller kontaktuppgifter här. Bara det köparen söker.
// ---------------------------------------------------------------------------

export interface BankBuyer extends BuyerProfile {
  publicId: number // visas som "Köpare #1843"
}

function b(
  publicId: number,
  areas: string[] | 'all',
  maxPrice: number,
  minRooms: number,
  minLivingArea: number,
  required: RequirementId[],
  prefs: [PreferenceId, Priority][],
  types: PropertyType[] = [],
): BankBuyer {
  return {
    id: `buyer-${publicId}`,
    publicId,
    preferredAreas: areas === 'all' ? [] : areas,
    wholeStockholm: areas === 'all',
    propertyTypes: types,
    minPrice: 0,
    maxPrice,
    maxMonthlyFee: 0,
    minRooms,
    minBedrooms: 0,
    minLivingArea,
    requiredFeatures: required,
    otherRequirement: '',
    preferredFeatures: prefs.map(([id, priority]) => ({ id, priority })),
    freeText: '',
    textTags: [],
    status: 'active',
  }
}

const M = 1_000_000

export const BUYER_BANK: BankBuyer[] = [
  b(1843, ['Södermalm'], 5.4 * M, 3, 65, ['balkong', 'hiss'], [['kollektivtrafik', 'high'], ['stadsliv', 'high']]),
  b(1901, ['Södermalm', 'Vasastan'], 5.9 * M, 3, 70, ['balkong'], [['ljus', 'high'], ['oppen-planlosning', 'nice']]),
  b(1777, ['Södermalm'], 5.2 * M, 2, 60, ['hiss'], [['kollektivtrafik', 'high'], ['renoverat', 'nice']]),
  b(2004, ['Södermalm', 'Kungsholmen'], 6.4 * M, 3, 70, [], [['stadsliv', 'high'], ['ljus', 'high'], ['parkering', 'nice']]),
  b(1650, ['Södermalm'], 5.6 * M, 3, 72, ['balkong'], [['kollektivtrafik', 'high'], ['oppen-planlosning', 'high']]),
  b(2110, ['Södermalm', 'Hammarby Sjöstad'], 6.2 * M, 3, 65, ['tvattmaskin'], [['renoverat', 'high'], ['ljus', 'nice']]),
  b(1932, ['Södermalm'], 5.3 * M, 3, 75, ['balkong', 'hiss'], [['kollektivtrafik', 'high'], ['stadsliv', 'nice'], ['lag-avgift', 'nice']]),
  b(1588, ['Södermalm', 'Vasastan', 'Kungsholmen'], 5.9 * M, 2, 55, [], [['stadsliv', 'high'], ['ljus', 'nice']]),
  b(1522, ['Södermalm'], 5.2 * M, 3, 70, ['balkong'], [['kollektivtrafik', 'high'], ['natur', 'high']]),
  b(2201, 'all', 5.9 * M, 3, 65, ['hiss'], [['kollektivtrafik', 'high'], ['natur', 'nice']]),
  b(1455, 'all', 5.0 * M, 3, 70, [], [['ljus', 'high'], ['oppen-planlosning', 'nice'], ['lugnt', 'nice']]),
  b(2330, ['Aspudden', 'Södermalm'], 5.5 * M, 3, 65, ['balkong'], [['natur', 'high'], ['lugnt', 'high'], ['kollektivtrafik', 'nice']]),
  b(1301, 'all', 5.4 * M, 3, 65, ['balkong'], [['natur', 'high'], ['lugnt', 'high'], ['barnvanligt', 'nice']]),
  b(1420, 'all', 5.0 * M, 2, 60, [], [['natur', 'high'], ['parkering', 'nice']]),
  b(1508, 'all', 6.9 * M, 3, 70, [], [['lugnt', 'high'], ['barnvanligt', 'high'], ['parkering', 'high']]),
  b(1614, 'all', 5.9 * M, 3, 65, ['hiss'], [['nyproduktion', 'high'], ['natur', 'nice']]),
  b(1709, 'all', 5.1 * M, 2, 55, [], [['lugnt', 'high'], ['natur', 'high']]),
  b(1822, 'all', 5.6 * M, 3, 72, [], [['barnvanligt', 'high'], ['parkering', 'nice']]),
  b(1967, 'all', 6.4 * M, 3, 70, ['balkong'], [['natur', 'high'], ['stor-balkong', 'high']]),
  b(2045, 'all', 5.3 * M, 3, 65, [], [['nyproduktion', 'high'], ['parkering', 'high']]),
  b(2089, 'all', 5.8 * M, 2, 60, [], [['lugnt', 'high'], ['barnvanligt', 'nice'], ['natur', 'nice']]),
  b(2150, 'all', 5.0 * M, 3, 68, ['hiss'], [['natur', 'high']]),
  b(2266, 'all', 6.6 * M, 3, 75, [], [['parkering', 'high'], ['lugnt', 'nice']]),
  b(2301, 'all', 5.4 * M, 2, 60, ['balkong'], [['barnvanligt', 'high'], ['natur', 'high']]),
  b(2377, 'all', 6.1 * M, 3, 70, [], [['nyproduktion', 'high'], ['lugnt', 'nice']]),
  b(2412, 'all', 5.2 * M, 3, 65, [], [['natur', 'high'], ['parkering', 'high'], ['lugnt', 'nice']]),
  b(2455, 'all', 5.7 * M, 2, 58, ['hiss'], [['lugnt', 'high'], ['stor-balkong', 'nice']]),
  // Tre köpare som inte matchar Ringvägen – för att visa att filtreringen fungerar.
  b(1111, ['Bromma'], 14 * M, 5, 140, ['garage'], [['natur', 'high']], ['Villa']),
  b(1250, ['Aspudden'], 4.9 * M, 3, 65, ['balkong'], [['natur', 'high']]),
  b(1399, 'all', 4.2 * M, 2, 55, [], [['lugnt', 'high']]),
]

// Köpare som aktivt valt att dela sin profil med säljaren (efter samtycke).
export interface SharedInterest {
  id: string
  firstName: string
  verified: boolean
  desiredAccess: string
  financing: 'Lånelöfte registrerat' | 'Ej angivet'
  sharedAgo: string
}

export const DEMO_SHARED_INTERESTS: SharedInterest[] = [
  { id: 'i1', firstName: 'Johan', verified: true, desiredAccess: 'Januari 2027', financing: 'Ej angivet', sharedAgo: 'för 2 timmar sedan' },
  { id: 'i2', firstName: 'Marcus', verified: true, desiredAccess: 'December 2026', financing: 'Lånelöfte registrerat', sharedAgo: 'för 5 timmar sedan' },
  { id: 'i3', firstName: 'Sara', verified: true, desiredAccess: 'Flexibel', financing: 'Ej angivet', sharedAgo: 'igår' },
  { id: 'i4', firstName: 'Elin', verified: true, desiredAccess: 'Februari 2027', financing: 'Lånelöfte registrerat', sharedAgo: 'igår' },
  { id: 'i5', firstName: 'Oskar', verified: true, desiredAccess: 'Flexibel', financing: 'Lånelöfte registrerat', sharedAgo: 'för 2 dagar sedan' },
  { id: 'i6', firstName: 'Maja', verified: true, desiredAccess: 'Mars 2027', financing: 'Ej angivet', sharedAgo: 'för 2 dagar sedan' },
  { id: 'i7', firstName: 'Ali', verified: true, desiredAccess: 'December 2026', financing: 'Lånelöfte registrerat', sharedAgo: 'för 3 dagar sedan' },
  { id: 'i8', firstName: 'Lina', verified: true, desiredAccess: 'Januari 2027', financing: 'Ej angivet', sharedAgo: 'för 3 dagar sedan' },
]
