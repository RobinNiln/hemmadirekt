// Datamodellen för en försäljning. En riktig backend skulle lagra samma struktur i en databas.

// 'brf' = bostadsrätt, 'villa' = villa eller annan fastighet (äganderätt)
export type PropertyKind = 'brf' | 'villa'

export type ListingType = 'Bostadsrätt' | 'Villa' | 'Radhus' | 'Fritidshus'

export interface PropertyDetails {
  kind: PropertyKind // härleds från listingType: bostadsrätt → 'brf', övriga → 'villa'
  listingType: ListingType
  bedrooms: number
  elevator: boolean
  plotArea: number // tomtarea (villa m.fl.)
  floors: number // antal våningsplan (villa m.fl.)
  street: string
  postalCode: string
  city: string
  area: string
  apartmentNo: string // bostadsrätt
  designation: string // fastighetsbeteckning (villa)
  rooms: number
  size: number
  floor: string
  fee: number // månadsavgift (brf) eller driftkostnad (villa)
  built: number
  association: string // bostadsrättsförening (brf)
  associationOrgNr: string
  askingPrice: number
}

export interface SalePhoto {
  id: string
  url: string
  label: string
  tag?: 'huvud' | 'vardagsrum' | 'kok' | 'sovrum' | 'badrum' | 'balkong' | 'ovrigt' // används av "Ordna bilder med AI"
  rotation?: number // 0, 90, 180, 270
}

// Det säljaren bygger upp i "Lägg upp bostad".
export interface ListingDraft {
  features: string[]
  headline: string
  priceType: 'Utgångspris' | 'Fast pris'
  answers: { favorite: string; areaLove: string; highlight: string }
}

export interface Viewing {
  date: string // 'YYYY-MM-DD'
  start: string // 'HH:MM'
  end: string
  allowPrivate: boolean
  published: boolean
  signups: number
  capacity: number
}

export interface Stats {
  views: number
  saved: number
  viewingSignups: number
  interested: number
  interestRequests: number // intresseanmälningar där köparen delat sin profil
  privateViewings: number
}

export type InterestLevel = 'Mycket intresserad' | 'Intresserad' | 'Vill se igen'

export interface Interessent {
  id: string
  name: string
  verified: boolean
  loanPromise: boolean
  level: InterestLevel
  note: string
  attendedViewing: boolean
}

export interface Bid {
  id: string
  bidderId: string
  bidderName: string
  amount: number
  time: string
  desiredAccess: string // 'YYYY-MM-DD'
}

export interface ContractConditions {
  brf: boolean // medlemskap i föreningen
  inspection: boolean // besiktningsvillkor (villa)
  financing: boolean
  sale: boolean // försäljningsvillkor (köparen måste sälja sin bostad först)
  other: boolean
  otherText: string
}

export interface Contract {
  step: number // 1–8 i det guidade flödet
  sellerShare: number // säljarens ägarandel i procent
  price: number
  deposit: number
  accessDate: string
  conditions: ContractConditions
  included: string[] // vad ingår i köpet
  includedOther: string
  draftCreated: boolean // "Skapa avtalsutkast" klickat
  approved: boolean // "Godkänn för signering" klickat
  signedBySeller: boolean
  signedByBuyer: boolean
}

export interface SettlementItem {
  id: string
  type: 'Avdrag' | 'Tillägg' | 'Avgift' | 'Övrigt'
  label: string
  amount: number
}

// Status för de dokument som inte räknas fram automatiskt ur resten av affären.
export interface DocsState {
  associationVerified: boolean // Föreningsinformation kontrollerad
  questionnaireDone: boolean // Säljarens frågelista (villa)
  inspectionFile: string | null // Besiktningsprotokoll (filnamn)
  financingRegistered: boolean // köparen har registrerat lånelöfte i efterhand
  membership: {
    created: boolean
    sent: boolean
    approved: boolean
    phone: string
    email: string
  }
  deposit: {
    created: boolean
    registered: boolean
    dueDate: string
  }
  settlement: {
    created: boolean
    items: SettlementItem[]
  }
  deedPrepared: boolean // köpebrev (villa)
  titlePrepared: boolean // lagfartsunderlag (villa)
}

export interface Closing {
  prepared: boolean
  finalPayment: boolean
  keysHandedOver: boolean
  buyerMovedIn: boolean
  completed: boolean
}

export interface Notification {
  id: string
  text: string
  time: string
  read: boolean
  link?: string
}

export type SaleMode = 'sell' | 'direct' // sälj själv / genomför bara affären
export type Package = 'direct' | 'standard' | 'plus'

export interface SaleState {
  loggedIn: boolean
  sellerName: string
  started: boolean
  mode: SaleMode
  pkg: Package
  property: PropertyDetails
  photos: SalePhoto[]
  listing: ListingDraft
  description: string
  viewing: Viewing | null
  published: boolean
  stats: Stats
  interested: Interessent[]
  bids: Bid[]
  acceptedBidId: string | null
  contract: Contract
  docs: DocsState
  closing: Closing
  notifications: Notification[]
  marketSimulated: boolean
}
