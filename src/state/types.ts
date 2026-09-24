// Datamodellen för en försäljning. En riktig backend skulle lagra samma struktur i en databas.

export interface PropertyDetails {
  street: string
  city: string
  area: string
  apartmentNo: string
  rooms: number
  size: number
  floor: string
  fee: number
  built: number
  association: string
  askingPrice: number
}

export interface SalePhoto {
  id: string
  url: string
  label: string
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
  brf: boolean
  financing: boolean
  other: boolean
  otherText: string
}

export interface Contract {
  step: number // 1–6
  price: number
  deposit: number
  accessDate: string
  conditions: ContractConditions
  approved: boolean
  signedBySeller: boolean
  signedByBuyer: boolean
}

export interface Closing {
  depositRegistered: boolean
  brfApproved: boolean
  prepared: boolean
  finalPayment: boolean
  keysHandedOver: boolean
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
  description: string
  viewing: Viewing | null
  published: boolean
  stats: Stats
  interested: Interessent[]
  bids: Bid[]
  acceptedBidId: string | null
  contract: Contract
  closing: Closing
  notifications: Notification[]
  marketSimulated: boolean
}
