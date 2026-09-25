import { EXAMPLE_UPLOADS_SORTED } from '../lib/images'
import { RINGVAGEN_DESCRIPTION } from '../data/listings'
import type { Bid, Contract, DocsState, Financing, Interessent, ListingDraft, PropertyDetails, SaleState } from './types'

// Startvärden och demodata. Allt här är påhittat exempeldata.

export const DEMO_BRF_NAME = 'Bostadsrättsföreningen Solgläntan'

export const DEFAULT_PROPERTY: PropertyDetails = {
  kind: 'brf',
  listingType: 'Bostadsrätt',
  bedrooms: 2,
  elevator: true,
  plotArea: 0,
  floors: 0,
  street: 'Ringvägen 128',
  postalCode: '118 61',
  city: 'Stockholm',
  area: 'Södermalm',
  apartmentNo: '1402',
  designation: '',
  rooms: 3,
  size: 76,
  floor: '4 av 5',
  fee: 4250,
  built: 1929,
  association: DEMO_BRF_NAME,
  associationOrgNr: '769999-0000',
  askingPrice: 4895000,
}

// Används när man i demon byter bostadstyp till villa/fastighet.
export const DEMO_VILLA: PropertyDetails = {
  kind: 'villa',
  listingType: 'Villa',
  bedrooms: 4,
  elevator: false,
  plotArea: 845,
  floors: 2,
  street: 'Björkvägen 14',
  postalCode: '137 38',
  city: 'Västerhaninge',
  area: 'Västerhaninge',
  apartmentNo: '',
  designation: 'Haninge Exempelby 3:45',
  rooms: 5,
  size: 118,
  floor: '',
  fee: 3900,
  built: 1976,
  association: '',
  associationOrgNr: '',
  askingPrice: 4895000,
}

// Maskerade personnummer – prototypen hanterar aldrig riktiga personnummer.
export const SELLER_PNR = '1978XXXX-XXXX'
const BUYER_PNR: Record<string, string> = {
  anna: '1985XXXX-XXXX',
  johan: '1981XXXX-XXXX',
  marcus: '1990XXXX-XXXX',
  sofia: '1988XXXX-XXXX',
  sara: '1993XXXX-XXXX',
}
export function buyerPnr(bidderId: string | undefined) {
  return (bidderId && BUYER_PNR[bidderId]) || '19XXXXXX-XXXX'
}

export const DEMO_INTERESTED: Interessent[] = [
  { id: 'anna', name: 'Anna Andersson', verified: true, loanPromise: true, level: 'Mycket intresserad', note: 'Var på visningen söndag. Frågade om föreningens ekonomi.', attendedViewing: true },
  { id: 'johan', name: 'Johan Nilsson', verified: true, loanPromise: false, level: 'Intresserad', note: 'Har bokat visning. Söker trea på Södermalm.', attendedViewing: true },
  { id: 'sofia', name: 'Sofia Berg', verified: true, loanPromise: true, level: 'Mycket intresserad', note: 'Vill gärna se bostaden en gång till. Är flexibel med tillträdet.', attendedViewing: true },
  { id: 'sara', name: 'Sara Lindqvist', verified: true, loanPromise: false, level: 'Vill se igen', note: 'Önskar privat visning en vardagskväll.', attendedViewing: false },
]

// Tre köpare i demon: två accepterar det fasta priset, en lämnar ett annat erbjudande.
export const DEMO_BIDS: Bid[] = [
  {
    id: 'r1', bidderId: 'anna', bidderName: 'Anna Andersson', amount: 4895000, time: '10:04', desiredAccess: '2026-12-15',
    kind: 'accept', flexible: false, financing: { type: 'lanelofte', bank: 'Exempelbanken', amount: 4000000, validTo: '2027-02-28' }, conditions: [], otherCondition: '', status: 'Skickad',
  },
  {
    id: 'r2', bidderId: 'johan', bidderName: 'Johan Nilsson', amount: 4895000, time: '10:07', desiredAccess: '2027-01-01',
    kind: 'accept', flexible: false, financing: { type: 'klar' }, conditions: [], otherCondition: '', status: 'Skickad',
  },
  {
    id: 'r3', bidderId: 'sofia', bidderName: 'Sofia Berg', amount: 4750000, time: '10:13', desiredAccess: '',
    kind: 'offer', flexible: true, financing: { type: 'lanelofte', bank: 'Exempelbanken', amount: 3800000, validTo: '2027-01-31' }, conditions: [], otherCondition: '', status: 'Skickad',
  },
]

export const FINANCING_LABEL: Record<Financing['type'], string> = {
  lanelofte: 'Lånelöfte angivet',
  klar: 'Finansiering klar',
  kontant: 'Köper utan bolån',
  behover: 'Behöver ordna finansiering',
}

export const INCLUDED_OPTIONS: Record<'brf' | 'villa', string[]> = {
  brf: ['Kyl och frys', 'Diskmaskin', 'Garderober', 'Fast belysning', 'Tvättmaskin', 'Mikrovågsugn'],
  villa: ['Kyl och frys', 'Diskmaskin', 'Garderober', 'Fast belysning', 'Tvättmaskin och torktumlare', 'Markiser', 'Förråd med inventarier'],
}

export const EMPTY_CONTRACT: Contract = {
  step: 1,
  sellerShare: 100,
  price: 0,
  deposit: 0,
  accessDate: '',
  conditions: { brf: true, inspection: false, financing: false, sale: false, other: false, otherText: '' },
  included: ['Kyl och frys', 'Diskmaskin', 'Garderober', 'Fast belysning'],
  includedOther: '',
  draftCreated: false,
  approved: false,
  signedBySeller: false,
  signedByBuyer: false,
}

export const EMPTY_DOCS: DocsState = {
  associationVerified: false,
  questionnaireDone: false,
  inspectionFile: null,
  financingRegistered: false,
  membership: { created: false, sent: false, approved: false, phone: '070-000 00 00', email: 'kopare@exempel.se' },
  deposit: { created: false, registered: false, dueDate: '' },
  settlement: { created: false, items: [] },
  deedPrepared: false,
  titlePrepared: false,
}

export const EMPTY_LISTING: ListingDraft = {
  features: [],
  headline: '',
  priceType: 'Fast pris',
  answers: { favorite: '', areaLove: '', highlight: '' },
}

export const DEMO_LISTING: ListingDraft = {
  features: ['balkong', 'hiss', 'oppen-planlosning', 'diskmaskin', 'tvattmaskin', 'dusch', 'renoverat-kok', 'ljusinslapp', 'forrad', 'parkett'],
  headline: 'Ljus trea med balkong och social planlösning',
  priceType: 'Fast pris',
  answers: { favorite: 'ljuset och kvällssolen på balkongen', areaLove: 'närheten till Tantolunden och alla caféer', highlight: '' },
}

export const EMPTY_STATE: SaleState = {
  loggedIn: false,
  sellerName: 'Erik Svensson',
  started: false,
  mode: 'sell',
  pkg: 'standard',
  property: DEFAULT_PROPERTY,
  photos: [],
  listing: EMPTY_LISTING,
  description: '',
  viewing: null,
  published: false,
  stats: { views: 0, saved: 0, viewingSignups: 0, interested: 0, interestRequests: 0, privateViewings: 0 },
  interested: [],
  bids: [],
  acceptedBidId: null,
  contract: EMPTY_CONTRACT,
  docs: EMPTY_DOCS,
  closing: {
    prepared: false,
    finalPayment: false,
    keysHandedOver: false,
    buyerMovedIn: false,
    completed: false,
  },
  notifications: [],
  marketSimulated: false,
}

// "Testa en pågående försäljning" – Ringvägen 128 med tre köpförfrågningar att jämföra.
export function demoState(): SaleState {
  return {
    ...EMPTY_STATE,
    loggedIn: true,
    started: true,
    mode: 'sell',
    pkg: 'standard',
    property: DEFAULT_PROPERTY,
    photos: EXAMPLE_UPLOADS_SORTED,
    listing: DEMO_LISTING,
    description: RINGVAGEN_DESCRIPTION,
    viewing: {
      date: '2026-10-04',
      start: '13:00',
      end: '14:00',
      allowPrivate: true,
      published: true,
      signups: 18,
      capacity: 30,
    },
    published: true,
    stats: { views: 423, saved: 31, viewingSignups: 18, interested: 4, interestRequests: 8, privateViewings: 3 },
    interested: DEMO_INTERESTED,
    bids: DEMO_BIDS,
    marketSimulated: true,
    docs: { ...EMPTY_DOCS, associationVerified: true },
    notifications: [
      { id: 'n1', text: 'Nytt erbjudande: Sofia Berg erbjuder 4 750 000 kr.', time: '10:13', read: false, link: '/min-forsaljning/forfragningar' },
      { id: 'n2', text: 'Ny köpare accepterar ditt pris: Johan Nilsson vill köpa för 4 895 000 kr.', time: '10:07', read: false, link: '/min-forsaljning/forfragningar' },
      { id: 'n0', text: 'Ny köpare accepterar ditt pris: Anna Andersson vill köpa för 4 895 000 kr.', time: '10:04', read: false, link: '/min-forsaljning/forfragningar' },
      { id: 'n3', text: 'Tre nya personer har bokat visning.', time: '09:15', read: true, link: '/min-forsaljning' },
    ],
  }
}
