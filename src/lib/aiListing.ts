import { featureLabel } from '../data/features'
import type { SalePhoto } from '../state/types'

// ---------------------------------------------------------------------------
// MOCKAD AI FÖR ANNONSER
//
// Regler (samma som en riktig AI ska följa):
//  - Använd bara verifierade bostadsuppgifter och säljarens egna svar.
//  - Hitta aldrig på renoveringar, avstånd, utsikt, föreningsfakta eller ekonomi.
//  - Allt är förslag som säljaren själv godkänner.
// ---------------------------------------------------------------------------

export interface ListingFacts {
  type: string // Bostadsrätt, Villa, …
  rooms: number
  bedrooms: number
  size: number
  floor: string
  elevator: boolean
  built: number
  area: string
  plotArea?: number
  features: string[]
}

export interface SellerAnswers {
  favorite: string
  areaLove: string
  highlight: string
}

export type RewriteStyle = 'kortare' | 'personlig' | 'saklig' | 'exklusiv' | 'familj'

export const REWRITE_OPTIONS: { id: RewriteStyle; label: string }[] = [
  { id: 'kortare', label: 'Kortare' },
  { id: 'personlig', label: 'Mer personlig' },
  { id: 'saklig', label: 'Mer saklig' },
  { id: 'exklusiv', label: 'Mer exklusiv' },
  { id: 'familj', label: 'Mer familjevänlig' },
]

const ROOM_WORD: Record<number, string> = { 1: 'etta', 2: 'tvåa', 3: 'trea', 4: 'fyra', 5: 'femma', 6: 'sexa' }
const has = (f: ListingFacts, id: string) => f.features.includes(id)

function noun(f: ListingFacts) {
  if (f.type === 'Bostadsrätt') return ROOM_WORD[f.rooms] ?? `lägenhet om ${f.rooms} rum`
  if (f.type === 'Villa') return 'villa'
  if (f.type === 'Radhus') return 'radhus'
  return 'fritidshus'
}

function outdoor(f: ListingFacts) {
  if (has(f, 'terrass')) return 'terrass'
  if (has(f, 'balkong')) return 'balkong'
  if (has(f, 'tradgard')) return 'trädgård'
  if (has(f, 'uteplats')) return 'uteplats'
  return ''
}

// Egenskaper som får nämnas, i läsbar form.
function featureList(f: ListingFacts, skip: string[] = []) {
  return f.features.filter((x) => !skip.includes(x) && x !== 'ingen-uteplats').map((x) => featureLabel(x).toLowerCase())
}

function joinSv(items: string[]) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} och ${items[items.length - 1]}`
}

const clean = (s: string) => s.trim().replace(/\s+/g, ' ').replace(/[.!]+$/, '')

export function generateListingText(f: ListingFacts, a: SellerAnswers): string {
  const n = noun(f)
  const light = has(f, 'ljusinslapp')
  const out = outdoor(f)
  const p1 = `${light ? 'Ljus och välplanerad' : 'Välplanerad'} ${n} om ${f.size} m²${f.type === 'Bostadsrätt' && f.floor ? ` på våning ${f.floor.split(' ')[0]}` : ''}${out ? ` med ${out}` : ''}. ${has(f, 'oppen-planlosning') ? 'Den öppna planlösningen ger generösa sällskapsytor' : 'Planlösningen ger en naturlig indelning mellan umgänge och vila'}, och bostaden har ${f.rooms} rum varav ${f.bedrooms} ${f.bedrooms === 1 ? 'sovrum' : 'sovrum'}.`

  const qualities = featureList(f, ['balkong', 'terrass', 'tradgard', 'uteplats', 'ljusinslapp', 'oppen-planlosning', 'hiss'])
  const p2 = qualities.length ? `Här finns ${joinSv(qualities.slice(0, 6))}.${f.elevator ? ' Huset har hiss.' : ''}` : f.elevator ? 'Huset har hiss.' : ''

  const personal: string[] = []
  if (a.favorite.trim()) personal.push(`Det säljaren uppskattar mest med bostaden: ${clean(a.favorite).toLowerCase()}.`)
  if (a.areaLove.trim()) personal.push(`Om ${f.area}: ${clean(a.areaLove).toLowerCase()}.`)
  if (a.highlight.trim()) personal.push(`${clean(a.highlight).charAt(0).toUpperCase()}${clean(a.highlight).slice(1)}.`)

  const p4 = `Byggår ${f.built}.${f.plotArea ? ` Tomten är ${f.plotArea} m².` : ''}`
  return [p1, p2, personal.join(' '), p4].filter(Boolean).join('\n\n')
}

export function rewriteText(text: string, style: RewriteStyle, f: ListingFacts, a: SellerAnswers): string {
  const paras = text.split('\n\n').filter(Boolean)
  switch (style) {
    case 'kortare':
      return paras.slice(0, 2).map((p) => p.split('. ').slice(0, 2).join('. ').replace(/\.?$/, '.')).join('\n\n')
    case 'personlig': {
      const intro = a.favorite.trim() ? `Det vi kommer sakna mest är ${clean(a.favorite).toLowerCase()}.` : 'Här har vi trivts väldigt bra.'
      // Säljarens favorit står redan i inledningen – ta bort den från resten så att den inte upprepas.
      const rest = paras.map((p) => p.replace(/Det säljaren uppskattar mest med bostaden: [^.]*\.\s?/, '').replace(/^Om (.+?): /, 'Det vi uppskattar med $1: ')).filter((p) => p.trim())
      return [intro, ...rest].join('\n\n')
    }
    case 'saklig': {
      const rows = [
        `${f.type}, ${f.rooms} rum varav ${f.bedrooms} sovrum, ${f.size} m².`,
        f.floor ? `Våning ${f.floor}${f.elevator ? ', hiss finns' : ''}.` : '',
        `Byggår ${f.built}.${f.plotArea ? ` Tomt ${f.plotArea} m².` : ''}`,
        featureList(f).length ? `Egenskaper: ${featureList(f).join(', ')}.` : '',
      ]
      return rows.filter(Boolean).join('\n')
    }
    case 'exklusiv':
      return paras
        .join('\n\n')
        .replace(/^Ljus och välplanerad/, 'Elegant och ljusfylld')
        .replace(/^Välplanerad/, 'Genomtänkt och stilfull')
        .replace('ger generösa sällskapsytor', 'skapar ett generöst och sofistikerat sällskapsflöde')
        .replace('Här finns', 'Bostaden erbjuder')
    case 'familj': {
      const extra = f.bedrooms >= 2 ? `Med ${f.bedrooms} sovrum finns plats för hela familjen.` : 'Planlösningen är lätt att anpassa efter vardagen.'
      return [paras[0], extra, ...paras.slice(1)].join('\n\n')
    }
  }
}

export function suggestHeadlines(f: ListingFacts): string[] {
  const n = noun(f)
  const out = outdoor(f)
  const light = has(f, 'ljusinslapp')
  const floorNum = parseInt(f.floor, 10)
  return [
    `${light ? 'Ljus ' : ''}${n}${out ? ` med ${out}` : ''}${has(f, 'oppen-planlosning') ? ' och social planlösning' : ''}`.replace(/^./, (c) => c.toUpperCase()),
    !isNaN(floorNum) && floorNum >= 3 ? 'Välplanerat boende högt upp i huset' : `Välplanerat boende om ${f.size} m²`,
    `${f.rooms} rum${out ? ` med ${out}` : ''} i ${f.area}`,
  ]
}

// ---------- Bilder ----------
const ORDER = ['huvud', 'vardagsrum', 'kok', 'sovrum', 'badrum', 'balkong', 'ovrigt']

export function sortPhotosWithAI(photos: SalePhoto[]): SalePhoto[] {
  const rank = (p: SalePhoto) => {
    const i = ORDER.indexOf(p.tag ?? 'ovrigt')
    return i === -1 ? ORDER.length : i
  }
  return [...photos].sort((a, b) => rank(a) - rank(b))
}

// Egenskaper "hittade" i bilderna – bara förslag, säljaren måste bekräfta.
export function detectFeaturesInPhotos(photos: SalePhoto[]): { id: string; label: string; source: string }[] {
  const tags = new Set(photos.map((p) => p.tag))
  const found: { id: string; label: string; source: string }[] = []
  if (tags.has('balkong') || tags.has('huvud')) found.push({ id: 'balkong', label: 'Balkong', source: 'Syns på en bild' })
  found.push({ id: 'parkett', label: 'Parkettgolv', source: 'Syns i vardagsrum och sovrum' })
  if (tags.has('kok')) found.push({ id: 'renoverat-kok', label: 'Renoverat kök', source: 'Köket ser nyrenoverat ut – bekräfta bara om det stämmer' })
  if (tags.has('badrum')) found.push({ id: 'dusch', label: 'Dusch', source: 'Syns på badrumsbilden' })
  found.push({ id: 'ljusinslapp', label: 'Mycket ljusinsläpp', source: 'Flera bilder har stora fönster' })
  return found
}
