import { EXAMPLE_UPLOADS } from '../lib/images'
import { RINGVAGEN_DESCRIPTION } from '../data/listings'
import type { Bid, Contract, DocsState, Interessent, PropertyDetails, SaleState } from './types'

// Startvärden och demodata. Allt här är påhittat exempeldata.

export const DEMO_BRF_NAME = 'Bostadsrättsföreningen Solgläntan'

export const DEFAULT_PROPERTY: PropertyDetails = {
  kind: 'brf',
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
  askingPrice: 4495000,
}

// Används när man i demon byter bostadstyp till villa/fastighet.
export const DEMO_VILLA: PropertyDetails = {
  kind: 'villa',
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
  askingPrice: 4495000,
}

// Maskerade personnummer – prototypen hanterar aldrig riktiga personnummer.
export const SELLER_PNR = '1978XXXX-XXXX'
const BUYER_PNR: Record<string, string> = {
  anna: '1985XXXX-XXXX',
  johan: '1981XXXX-XXXX',
  marcus: '1990XXXX-XXXX',
  sara: '1993XXXX-XXXX',
}
export function buyerPnr(bidderId: string | undefined) {
  return (bidderId && BUYER_PNR[bidderId]) || '19XXXXXX-XXXX'
}

export const DEMO_INTERESTED: Interessent[] = [
  { id: 'anna', name: 'Anna Andersson', verified: true, loanPromise: true, level: 'Mycket intresserad', note: 'Var på visningen söndag. Frågade om föreningens ekonomi.', attendedViewing: true },
  { id: 'johan', name: 'Johan Nilsson', verified: true, loanPromise: false, level: 'Intresserad', note: 'Har bokat visning. Söker trea på Södermalm.', attendedViewing: true },
  { id: 'marcus', name: 'Marcus Berg', verified: true, loanPromise: true, level: 'Mycket intresserad', note: 'Vill gärna se bostaden en gång till innan bud.', attendedViewing: true },
  { id: 'sara', name: 'Sara Lindqvist', verified: true, loanPromise: false, level: 'Vill se igen', note: 'Önskar privat visning en vardagskväll.', attendedViewing: false },
]

export const DEMO_BIDS: Bid[] = [
  { id: 'b1', bidderId: 'johan', bidderName: 'Johan Nilsson', amount: 4500000, time: '12:02', desiredAccess: '2027-01-15' },
  { id: 'b2', bidderId: 'anna', bidderName: 'Anna Andersson', amount: 4550000, time: '12:14', desiredAccess: '2026-12-15' },
  { id: 'b3', bidderId: 'johan', bidderName: 'Johan Nilsson', amount: 4600000, time: '12:31', desiredAccess: '2027-01-15' },
  { id: 'b4', bidderId: 'anna', bidderName: 'Anna Andersson', amount: 4620000, time: '12:48', desiredAccess: '2026-12-15' },
]

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

export const EMPTY_STATE: SaleState = {
  loggedIn: false,
  sellerName: 'Erik Svensson',
  started: false,
  mode: 'sell',
  pkg: 'standard',
  property: DEFAULT_PROPERTY,
  photos: [],
  description: '',
  viewing: null,
  published: false,
  stats: { views: 0, saved: 0, viewingSignups: 0, interested: 0 },
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

// "Testa en pågående försäljning" – Ringvägen 128 mitt i budgivningen.
export function demoState(): SaleState {
  return {
    ...EMPTY_STATE,
    loggedIn: true,
    started: true,
    mode: 'sell',
    pkg: 'standard',
    property: DEFAULT_PROPERTY,
    photos: EXAMPLE_UPLOADS,
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
    stats: { views: 324, saved: 27, viewingSignups: 18, interested: 4 },
    interested: DEMO_INTERESTED,
    bids: DEMO_BIDS,
    marketSimulated: true,
    docs: { ...EMPTY_DOCS, associationVerified: true },
    notifications: [
      { id: 'n1', text: 'Anna Andersson har lagt ett nytt bud: 4 620 000 kr.', time: '12:48', read: false, link: '/min-forsaljning/budgivning' },
      { id: 'n2', text: 'Johan Nilsson har lagt ett nytt bud: 4 600 000 kr.', time: '12:31', read: false, link: '/min-forsaljning/budgivning' },
      { id: 'n3', text: 'Tre nya personer har bokat visning.', time: '09:15', read: true, link: '/min-forsaljning' },
    ],
  }
}
