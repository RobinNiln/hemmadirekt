import type { Listing, PropertyType } from '../data/listings'
import { AREA_TAG_LABEL, areaHasTag, areaInfo, type AreaTag } from '../data/areas'
import { formatNumber, formatSEK } from './format'

// ---------------------------------------------------------------------------
// MATCHNINGSMOTORN
//
// Hybrid av två delar:
//  1. Hårda krav (vanlig filtrering): pris, område, typ, rum, boyta, sovrum, "måste finnas".
//     Bryter bostaden mot ett krav visas den inte.
//  2. Mjuka preferenser (här "AI" – i demon en enkel poängmodell):
//     önskemål, område, prisläge, storlek och taggar från köparens fritext.
//
// Allt är förklarande: varje poäng hänger ihop med en rad användaren kan läsa.
// En riktig AI-/backend-matchning kan ersätta funktionen matchListing() rakt av.
// ---------------------------------------------------------------------------

// ---------- Köparprofil ----------
export type RequirementId = 'balkong' | 'uteplats' | 'hiss' | 'tva-sovrum' | 'parkering' | 'garage' | 'badkar' | 'tvattmaskin' | 'tillganglig' | 'laddplats'
export type PreferenceId =
  | 'kollektivtrafik' | 'natur' | 'lugnt' | 'stadsliv' | 'barnvanligt'
  | 'aldre-hus' | 'nyproduktion' | 'ljus' | 'oppen-planlosning' | 'stor-balkong'
  | 'renoverat' | 'originaldetaljer' | 'lag-avgift' | 'parkering' | 'balkong-uteplats'
export type Priority = 'high' | 'nice'

export interface TextTag {
  id: string
  label: string
  maps?: PreferenceId // vilken preferens taggen motsvarar i matchningen
  priority: Priority
  note?: string // förklaring om något inte kan kontrolleras
}

export interface BuyerProfile {
  id: string
  preferredAreas: string[]
  wholeStockholm: boolean
  propertyTypes: PropertyType[] // tom lista = alla typer
  minPrice: number
  maxPrice: number
  maxMonthlyFee: number // 0 = ingen gräns
  minRooms: number
  minBedrooms: number // 0 = inget krav
  minLivingArea: number
  requiredFeatures: RequirementId[]
  otherRequirement: string
  preferredFeatures: { id: PreferenceId; priority: Priority }[]
  freeText: string
  textTags: TextTag[]
  status: 'active' | 'paused'
}

// ---------- Kataloger ----------
const has = (l: Listing, ...ids: string[]) => ids.some((i) => l.features.includes(i))
const floorNo = (l: Listing) => parseInt(l.floor ?? '', 10)

export const REQUIREMENTS: { id: RequirementId; label: string; test: (l: Listing) => boolean }[] = [
  { id: 'balkong', label: 'Balkong', test: (l) => has(l, 'balkong', 'terrass') },
  { id: 'uteplats', label: 'Uteplats', test: (l) => has(l, 'uteplats', 'tradgard', 'terrass') },
  { id: 'hiss', label: 'Hiss', test: (l) => l.elevator || has(l, 'hiss') },
  { id: 'tva-sovrum', label: 'Minst två sovrum', test: (l) => l.bedrooms >= 2 },
  { id: 'parkering', label: 'Parkering', test: (l) => has(l, 'parkeringsplats', 'garage', 'boendeparkering') },
  { id: 'garage', label: 'Garage', test: (l) => has(l, 'garage') },
  { id: 'badkar', label: 'Badkar', test: (l) => has(l, 'badkar') },
  { id: 'tvattmaskin', label: 'Tvättmaskin', test: (l) => has(l, 'tvattmaskin') },
  { id: 'tillganglig', label: 'Tillgänglig utan trappor', test: (l) => l.elevator || has(l, 'hiss', 'egen-entre') || floorNo(l) <= 1 },
  { id: 'laddplats', label: 'Laddplats', test: (l) => has(l, 'laddplats') },
]

const areaTag = (tag: AreaTag) => (l: Listing) => areaHasTag(l.area, tag)

export const PREFERENCES: { id: PreferenceId; label: string; test: (l: Listing) => boolean; missing: string }[] = [
  { id: 'kollektivtrafik', label: 'Nära kollektivtrafik', test: areaTag('kollektivtrafik'), missing: 'Området har inte markerats som nära kollektivtrafik' },
  { id: 'natur', label: 'Nära natur', test: areaTag('natur'), missing: 'Området har inte markerats som nära natur' },
  { id: 'lugnt', label: 'Lugnt område', test: areaTag('lugnt'), missing: 'Området är mer centralt än lugnt' },
  { id: 'stadsliv', label: 'Restauranger och stadsliv', test: areaTag('stadsliv'), missing: 'Mindre stadsliv i området' },
  { id: 'barnvanligt', label: 'Barnvänligt område', test: areaTag('barnvanligt'), missing: 'Området har inte markerats som barnvänligt' },
  { id: 'aldre-hus', label: 'Äldre hus', test: (l) => l.built < 1960, missing: 'Huset är inte äldre' },
  { id: 'nyproduktion', label: 'Nyproduktion', test: (l) => l.built >= 2015 || has(l, 'nyproduktion'), missing: 'Inte nyproduktion' },
  { id: 'ljus', label: 'Mycket ljus', test: (l) => has(l, 'ljusinslapp'), missing: 'Säljaren har inte angett mycket ljusinsläpp' },
  { id: 'oppen-planlosning', label: 'Öppen planlösning', test: (l) => has(l, 'oppen-planlosning'), missing: 'Ingen öppen planlösning angiven' },
  { id: 'stor-balkong', label: 'Stor balkong', test: (l) => has(l, 'terrass'), missing: 'Balkongens storlek är inte angiven' },
  { id: 'renoverat', label: 'Renoverat', test: (l) => has(l, 'renoverat-kok', 'renoverat-badrum'), missing: 'Ingen renovering angiven' },
  { id: 'originaldetaljer', label: 'Originaldetaljer', test: (l) => has(l, 'originaldetaljer', 'kakelugn', 'sekelskifte'), missing: 'Inga originaldetaljer angivna' },
  { id: 'lag-avgift', label: 'Låg månadsavgift', test: (l) => l.fee / l.size <= 60, missing: 'Avgiften är högre än genomsnittet per kvadratmeter' },
  { id: 'parkering', label: 'Parkering', test: (l) => has(l, 'parkeringsplats', 'garage', 'boendeparkering'), missing: 'Ingen parkeringsplats ingår' },
  { id: 'balkong-uteplats', label: 'Balkong eller uteplats', test: (l) => has(l, 'balkong', 'terrass', 'uteplats', 'tradgard'), missing: 'Ingen balkong eller uteplats' },
]

export const prefLabel = (id: PreferenceId) => PREFERENCES.find((p) => p.id === id)?.label ?? id
export const reqLabel = (id: RequirementId) => REQUIREMENTS.find((r) => r.id === id)?.label ?? id

// ---------- Resultat ----------
export type MatchLevel = 'Mycket bra match' | 'Bra match' | 'Möjlig match' | 'Ingen match'

export interface CheckLine {
  label: string
  ok: boolean
  detail?: string
}

export interface MatchResult {
  listingId: string
  passes: boolean // klarar alla hårda krav
  score: number // intern poäng 0–100, visas inte som huvudsignal
  level: MatchLevel
  requirements: CheckLine[]
  preferences: (CheckLine & { priority: Priority })[]
  highlights: string[] // tre viktigaste matchningarna
  reasons: string[] // "Därför passar bostaden dig"
  weaknesses: string[] // "Det här matchar inte helt"
}

export function levelFor(score: number, passes: boolean): MatchLevel {
  if (!passes || score < 60) return 'Ingen match'
  if (score >= 90) return 'Mycket bra match'
  if (score >= 75) return 'Bra match'
  return 'Möjlig match'
}

export function inArea(l: Listing, p: BuyerProfile) {
  if (p.wholeStockholm && (areaInfo(l.area)?.region ?? (l.city === 'Stockholm' ? 'Stockholm' : '')) === 'Stockholm') return true
  return p.preferredAreas.some((a) => a.toLowerCase() === l.area.toLowerCase())
}

export function matchListing(l: Listing, p: BuyerProfile): MatchResult {
  // ---- 1. Hårda krav ----
  const req: CheckLine[] = []
  req.push({ label: 'Inom din budget', ok: l.price <= p.maxPrice && l.price >= p.minPrice, detail: `${formatSEK(l.price)} – din max är ${formatSEK(p.maxPrice)}` })
  const areaText = p.wholeStockholm ? 'Stockholm' : p.preferredAreas.join(', ')
  req.push({ label: 'Rätt område', ok: inArea(l, p), detail: `${l.area} – du söker i ${areaText || 'inget område'}` })
  if (p.propertyTypes.length) req.push({ label: 'Rätt bostadstyp', ok: p.propertyTypes.includes(l.type), detail: l.type })
  req.push({ label: `Minst ${p.minRooms} rum`, ok: l.rooms >= p.minRooms, detail: `${l.rooms} rum` })
  req.push({ label: `Minst ${p.minLivingArea} m²`, ok: l.size >= p.minLivingArea, detail: `${l.size} m² – du söker minst ${p.minLivingArea} m²` })
  if (p.minBedrooms > 0) req.push({ label: `Minst ${p.minBedrooms} sovrum`, ok: l.bedrooms >= p.minBedrooms, detail: `${l.bedrooms} sovrum` })
  if (p.maxMonthlyFee > 0 && l.tenure === 'Bostadsrätt') req.push({ label: `Avgift högst ${formatNumber(p.maxMonthlyFee)} kr/mån`, ok: l.fee <= p.maxMonthlyFee, detail: `${formatSEK(l.fee)}/mån` })
  for (const id of p.requiredFeatures) {
    const r = REQUIREMENTS.find((x) => x.id === id)
    if (r) req.push({ label: r.label, ok: r.test(l) })
  }
  const passes = req.every((r) => r.ok)

  // ---- 2. Mjuka preferenser ----
  const prefList = [...p.preferredFeatures]
  for (const t of p.textTags) if (t.maps && !prefList.some((x) => x.id === t.maps)) prefList.push({ id: t.maps, priority: t.priority })
  const prefs = prefList.map(({ id, priority }) => {
    const def = PREFERENCES.find((x) => x.id === id)!
    return { label: def.label, ok: def.test(l), priority, detail: def.missing }
  })

  // ---- 3. Poäng (intern) ----
  let score = 60
  const weight = (x: { priority: Priority }) => (x.priority === 'high' ? 2 : 1)
  const total = prefs.reduce((s, x) => s + weight(x), 0)
  const got = prefs.filter((x) => x.ok).reduce((s, x) => s + weight(x), 0)
  score += total ? Math.round((got / total) * 26) : 18 // önskemål väger tyngst
  if (p.preferredAreas.some((a) => a.toLowerCase() === l.area.toLowerCase())) score += 5 // uttryckligen valt område
  if (l.price <= p.maxPrice * 0.9) score += 4 // god marginal i budgeten
  if (l.size >= p.minLivingArea + 8) score += 3 // lite större än minimum
  if (p.textTags.length) score += 2
  score = Math.min(100, score)

  // ---- 4. Förklaringar ----
  const reasons: string[] = []
  if (l.price <= p.maxPrice) reasons.push(l.price <= p.maxPrice * 0.9 ? 'Pris med god marginal under din maxbudget' : 'Pris under din maxbudget')
  reasons.push(`${l.size} m² – du söker minst ${p.minLivingArea} m²`)
  for (const id of p.requiredFeatures) if (REQUIREMENTS.find((x) => x.id === id)?.test(l)) reasons.push(reqLabel(id))
  if (l.bedrooms >= 2) reasons.push(l.bedrooms === 2 ? 'Två sovrum' : `${l.bedrooms} sovrum`)
  for (const x of prefs) if (x.ok) reasons.push(x.label)

  const weaknesses: string[] = []
  for (const x of prefs) if (!x.ok) weaknesses.push(x.detail!)
  if (!has(l, 'parkeringsplats', 'garage', 'boendeparkering') && !weaknesses.includes('Ingen parkeringsplats ingår')) weaknesses.push('Ingen parkeringsplats ingår')
  if (has(l, 'dusch') && !has(l, 'badkar')) weaknesses.push('Badrummet har dusch, inte badkar')
  if (!l.elevator && floorNo(l) >= 3) weaknesses.push('Ingen hiss')
  for (const r of req) if (!r.ok) weaknesses.unshift(`Uppfyller inte kravet: ${r.label.toLowerCase()}`)

  const highlights = [
    ...p.requiredFeatures.filter((id) => REQUIREMENTS.find((x) => x.id === id)?.test(l)).map(reqLabel),
    ...(l.price <= p.maxPrice ? ['Inom din budget'] : []),
    ...prefs.filter((x) => x.ok && x.priority === 'high').map((x) => x.label),
  ].slice(0, 3)

  return {
    listingId: l.id,
    passes,
    score,
    level: levelFor(score, passes),
    requirements: req,
    preferences: prefs,
    highlights,
    reasons: Array.from(new Set(reasons)),
    weaknesses: Array.from(new Set(weaknesses)),
  }
}

// Alla bostäder som ska visas i standardflödet (klarar kraven och har minst 60 poäng).
export function matchAll(listings: Listing[], p: BuyerProfile) {
  return listings
    .map((l) => ({ listing: l, match: matchListing(l, p) }))
    .filter((x) => x.match.level !== 'Ingen match')
    .sort((a, b) => b.match.score - a.match.score)
}

export function reqSummary(m: MatchResult) {
  return `${m.requirements.filter((r) => r.ok).length} av ${m.requirements.length} krav uppfyllda`
}
export function prefSummary(m: MatchResult) {
  return m.preferences.length ? `${m.preferences.filter((r) => r.ok).length} av ${m.preferences.length} önskemål uppfyllda` : 'Inga önskemål angivna'
}

export const AREA_TAGS_LABELS = AREA_TAG_LABEL
