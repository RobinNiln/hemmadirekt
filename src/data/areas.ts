// Områdesdata för demon. I en riktig version kommer detta från öppna data
// (kollektivtrafik, grönområden osv.) – aldrig från AI-gissningar.

export type AreaTag = 'kollektivtrafik' | 'natur' | 'lugnt' | 'stadsliv' | 'barnvanligt'

export interface AreaInfo {
  name: string
  city: string
  region: 'Stockholm' | 'Göteborg' | 'Uppsala'
  tags: AreaTag[]
}

export const AREAS: AreaInfo[] = [
  { name: 'Södermalm', city: 'Stockholm', region: 'Stockholm', tags: ['kollektivtrafik', 'stadsliv'] },
  { name: 'Vasastan', city: 'Stockholm', region: 'Stockholm', tags: ['kollektivtrafik', 'stadsliv'] },
  { name: 'Kungsholmen', city: 'Stockholm', region: 'Stockholm', tags: ['kollektivtrafik', 'stadsliv', 'natur'] },
  { name: 'Aspudden', city: 'Stockholm', region: 'Stockholm', tags: ['kollektivtrafik', 'natur', 'lugnt', 'barnvanligt'] },
  { name: 'Midsommarkransen', city: 'Stockholm', region: 'Stockholm', tags: ['kollektivtrafik', 'natur', 'lugnt', 'barnvanligt'] },
  { name: 'Hammarbyhöjden', city: 'Stockholm', region: 'Stockholm', tags: ['kollektivtrafik', 'natur', 'lugnt', 'barnvanligt'] },
  { name: 'Hammarby Sjöstad', city: 'Stockholm', region: 'Stockholm', tags: ['kollektivtrafik', 'stadsliv', 'natur'] },
  { name: 'Bromma', city: 'Stockholm', region: 'Stockholm', tags: ['natur', 'lugnt', 'barnvanligt'] },
  { name: 'Solna', city: 'Solna', region: 'Stockholm', tags: ['kollektivtrafik', 'natur'] },
  { name: 'Enskede', city: 'Stockholm', region: 'Stockholm', tags: ['natur', 'lugnt', 'barnvanligt'] },
  { name: 'Tallkrogen', city: 'Stockholm', region: 'Stockholm', tags: ['kollektivtrafik', 'lugnt', 'barnvanligt'] },
  { name: 'Värmdö', city: 'Värmdö', region: 'Stockholm', tags: ['natur', 'lugnt'] },
  { name: 'Västerhaninge', city: 'Haninge', region: 'Stockholm', tags: ['natur', 'lugnt', 'barnvanligt'] },
  { name: 'Linnéstaden', city: 'Göteborg', region: 'Göteborg', tags: ['kollektivtrafik', 'stadsliv'] },
  { name: 'Luthagen', city: 'Uppsala', region: 'Uppsala', tags: ['kollektivtrafik', 'lugnt'] },
]

export function areaInfo(name: string): AreaInfo | undefined {
  return AREAS.find((a) => a.name.toLowerCase() === name.toLowerCase())
}

export function areaHasTag(name: string, tag: AreaTag) {
  return !!areaInfo(name)?.tags.includes(tag)
}

export const AREA_TAG_LABEL: Record<AreaTag, string> = {
  kollektivtrafik: 'Nära kollektivtrafik',
  natur: 'Nära natur',
  lugnt: 'Lugnt område',
  stadsliv: 'Restauranger och stadsliv',
  barnvanligt: 'Barnvänligt område',
}
