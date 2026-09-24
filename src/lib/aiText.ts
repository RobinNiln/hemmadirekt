import type { PropertyDetails } from '../state/types'

// Mockad "AI" som skriver en bostadsbeskrivning utifrån uppgifterna.
// I en riktig version skulle detta vara ett anrop till en språkmodell.

const ROOM_WORD: Record<number, string> = { 1: 'etta', 2: 'tvåa', 3: 'trea', 4: 'fyra', 5: 'femma', 6: 'sexa' }

export function generateDescription(p: PropertyDetails): string {
  const word = ROOM_WORD[p.rooms] ?? `${p.rooms}:a`
  const floorNum = parseInt(p.floor, 10)
  const high = !isNaN(floorNum) && floorNum >= 3
  const bedrooms = Math.max(1, p.rooms - 1)
  const era = p.built < 1940 ? `med bevarade detaljer från ${Math.floor(p.built / 10) * 10}-talet` : p.built < 1980 ? 'i ett välbyggt hus från efterkrigstiden' : 'i modern och energieffektiv byggnad'

  return [
    `Ljus och välplanerad ${word} ${high ? 'högt upp i huset' : 'i trivsamt läge'} med generöst ljusinsläpp. Bostaden om ${p.size} m² har en genomtänkt planlösning där det rymliga vardagsrummet ${era} blir en naturlig samlingspunkt.`,
    `Köket har gott om arbetsyta och förvaring samt plats för matbord. ${bedrooms === 1 ? 'Sovrummet ligger avskilt och rymmer gott en dubbelsäng.' : `${bedrooms === 2 ? 'Två' : bedrooms === 3 ? 'Tre' : bedrooms} sovrum ligger avskilt från sällskapsytorna.`} Badrummet är helkaklat med dusch och plats för tvättmaskin.`,
    `${p.association ? `${p.association} är en välskött förening` : 'Föreningen är välskött'} och månadsavgiften är ${new Intl.NumberFormat('sv-SE').format(p.fee)} kr. Här bor du ${p.area ? `mitt i ${p.area}` : 'centralt'} med närhet till service, grönområden och goda kommunikationer.`,
  ].join('\n\n')
}
