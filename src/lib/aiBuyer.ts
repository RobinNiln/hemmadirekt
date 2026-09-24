import type { BuyerProfile, PreferenceId, Priority, RequirementId, TextTag } from './matching'

// ---------------------------------------------------------------------------
// MOCKAD AI SOM TOLKAR KÖPARENS FRITEXT
//
// Regler:
//  - Tolka bara det köparen uttryckligen skriver.
//  - Anta aldrig något utifrån vem köparen är (ålder, familj, kön, ursprung osv.).
//  - Hitta aldrig på restider eller avstånd – sådant blir en önskan vi inte kan kontrollera.
//  - Tolkningen visas alltid för köparen innan något sparas.
// ---------------------------------------------------------------------------

export interface Interpretation {
  patch: Partial<Pick<BuyerProfile, 'minRooms' | 'minBedrooms' | 'maxPrice' | 'minLivingArea'>>
  addRequired: RequirementId[]
  textTags: TextTag[]
  notes: string[]
}

const NUM: Record<string, number> = { en: 1, ett: 1, två: 2, tre: 3, fyra: 4, fem: 5, sex: 6 }
const toNum = (s: string) => NUM[s] ?? parseInt(s, 10)

export function interpretFreeText(text: string): Interpretation {
  const t = text.toLowerCase()
  const res: Interpretation = { patch: {}, addRequired: [], textTags: [], notes: [] }
  const tag = (id: string, label: string, priority: Priority, maps?: PreferenceId, note?: string) => {
    if (!res.textTags.some((x) => x.id === id)) res.textTags.push({ id, label, priority, maps, note })
  }
  const strong = (i: number) => /(måste|viktigt|behöver|kräver|gärna minst|minst)/.test(t.slice(Math.max(0, i - 40), i + 5))

  // Antal sovrum / rum
  const bed = t.match(/(?:minst\s+)?(\d|en|ett|två|tre|fyra|fem)\s+sovrum/)
  if (bed) res.patch.minBedrooms = toNum(bed[1])
  const rooms = t.match(/(?:minst\s+)?(\d|två|tre|fyra|fem|sex)\s+rum(?!\s*och kök)/)
  if (rooms) res.patch.minRooms = toNum(rooms[1])
  if (res.patch.minBedrooms && !res.patch.minRooms) res.patch.minRooms = res.patch.minBedrooms + 1

  // Pris
  const mkr = t.match(/(\d+(?:[.,]\d+)?)\s*(?:miljoner|mkr|milj)/)
  if (mkr) res.patch.maxPrice = Math.round(parseFloat(mkr[1].replace(',', '.')) * 1_000_000)

  // Boyta
  const kvm = t.match(/(\d{2,3})\s*(?:kvm|m2|m²|kvadrat)/)
  if (kvm) res.patch.minLivingArea = parseInt(kvm[1], 10)

  // Egenskaper
  if (/balkong eller uteplats|uteplats eller balkong/.test(t)) tag('balkong-uteplats', 'Balkong eller uteplats', 'high', 'balkong-uteplats')
  else if (/balkong/.test(t)) tag('balkong', 'Balkong', strong(t.indexOf('balkong')) ? 'high' : 'nice', 'balkong-uteplats')
  else if (/uteplats|trädgård/.test(t)) tag('uteplats', 'Uteplats eller trädgård', 'high', 'balkong-uteplats')
  if (/parkering|bil\b|garage/.test(t)) tag('parkering', 'Parkering', 'high', 'parkering')
  if (/natur|skog|grönområde|grönt|\bpark(en)?\b/.test(t)) tag('natur', 'Nära natur', 'high', 'natur')
  if (/lugn|tyst/.test(t)) tag('lugnt', 'Lugnt område', 'nice', 'lugnt')
  if (/restaurang|stadsliv|puls|krogar|caféer|kaféer/.test(t)) tag('stadsliv', 'Restauranger och stadsliv', 'nice', 'stadsliv')
  if (/ljus/.test(t)) tag('ljus', 'Mycket ljus', 'nice', 'ljus')
  if (/hiss/.test(t)) res.addRequired.push('hiss')
  if (/nyproduc|nybygg/.test(t)) tag('nyproduktion', 'Nyproduktion', 'nice', 'nyproduktion')
  if (/sekelskifte|äldre hus|originaldetalj|kakelugn/.test(t)) tag('aldre', 'Äldre hus med karaktär', 'nice', 'originaldetaljer')
  if (/renover/.test(t)) tag('renoverat', 'Renoverat', 'nice', 'renoverat')

  // Restid – kan inte kontrolleras, översätts till kollektivtrafik
  const tt = t.match(/(\d{1,2})\s*min(?:uter)?/)
  if (tt && /(city|stan|centrum|jobbet|t-centralen)/.test(t)) {
    tag('restid', `Cirka ${tt[1]} minuter till city`, 'nice', 'kollektivtrafik', 'Vi kan inte räkna restider i demon. Vi prioriterar i stället områden med bra kollektivtrafik.')
  } else if (/tunnelbana|pendeltåg|kollektivtrafik|buss/.test(t)) {
    tag('kollektivtrafik', 'Nära kollektivtrafik', 'high', 'kollektivtrafik')
  }
  if (/utanför stan|utanför stockholm|förort/.test(t)) res.notes.push('Du skrev att du vill bo utanför stan. Lägg gärna till de områden du tänker på i steg 1, så matchar vi rätt.')

  if (/barn|familj|sambo|pension|student/.test(t))
    res.notes.push('Vi har inte lagt till något utifrån vem du är eller vilka du bor med – bara det du uttryckligen vill att bostaden ska ha.')
  return res
}

export const EXAMPLE_FREE_TEXT =
  'Vi är två vuxna och två barn och vill flytta lite utanför stan. Vi vill gärna ha minst tre sovrum, balkong eller uteplats och nära till natur. Vi har bil så parkering är viktigt, men vi vill samtidigt kunna ta oss till city på ungefär 30 minuter.'
