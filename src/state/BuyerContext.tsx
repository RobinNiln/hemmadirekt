import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { BuyerProfile } from '../lib/matching'
import type { Financing, RequestKind, RequestStatus } from './types'

// ---------------------------------------------------------------------------
// Köparens sida: sökprofil, sparade/avfärdade bostäder, delat intresse och notiser.
// Sparas i webbläsaren, precis som säljarens försäljning.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'hemmadirekt-buyer-v1'

export type DismissReason = 'För dyr' | 'För liten' | 'Fel område' | 'För hög avgift' | 'Saknar balkong/uteplats' | 'Saknar parkering' | 'Stilen' | 'Planlösningen' | 'Annat'
export const DISMISS_REASONS: DismissReason[] = ['För dyr', 'För liten', 'Fel område', 'För hög avgift', 'Saknar balkong/uteplats', 'Saknar parkering', 'Stilen', 'Planlösningen', 'Annat']

export interface Dismissal {
  id: string
  reasons: DismissReason[]
  other: string
}

// En köpförfrågan eller ett erbjudande som köparen skickat.
export interface BuyerRequest {
  id: string // samma id som hos säljaren, så att statusen kan följas
  listingId: string
  street: string
  kind: RequestKind
  amount: number
  askingPrice: number
  desiredAccess: string
  flexible: boolean
  financing: Financing
  conditions: string[]
  otherCondition: string
  time: string
  status: RequestStatus
}

export interface BuyerState {
  name: string
  profile: BuyerProfile | null
  saved: string[]
  dismissed: Dismissal[]
  seen: string[]
  shared: string[] // bostäder där köparen delat sin profil med säljaren
  learned: Record<string, 'yes' | 'no'> // svar på "Vi har märkt något"
  requests: BuyerRequest[]
  waitlist: string[] // bostäder där köparen anmält fortsatt intresse
}

export const DEMO_PROFILE: BuyerProfile = {
  id: 'me',
  preferredAreas: ['Södermalm', 'Aspudden', 'Midsommarkransen'],
  wholeStockholm: false,
  propertyTypes: [],
  minPrice: 0,
  maxPrice: 6_000_000,
  maxMonthlyFee: 0,
  minRooms: 3,
  minBedrooms: 0,
  minLivingArea: 65,
  requiredFeatures: ['balkong', 'hiss'],
  otherRequirement: '',
  preferredFeatures: [
    { id: 'kollektivtrafik', priority: 'high' },
    { id: 'ljus', priority: 'high' },
    { id: 'renoverat', priority: 'nice' },
    { id: 'oppen-planlosning', priority: 'nice' },
    { id: 'parkering', priority: 'nice' },
  ],
  freeText: '',
  textTags: [],
  status: 'active',
}

const EMPTY: BuyerState = { name: 'Anna', profile: null, saved: [], dismissed: [], seen: [], shared: [], learned: {}, requests: [], waitlist: [] }

function load(): BuyerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as BuyerState) } : EMPTY
  } catch {
    return EMPTY
  }
}

interface Ctx {
  buyer: BuyerState
  setProfile: (p: BuyerProfile) => void
  patchProfile: (p: Partial<BuyerProfile>) => void
  toggleSave: (id: string) => void
  dismiss: (d: Dismissal) => void
  undismiss: (id: string) => void
  markSeen: (id: string) => void
  share: (id: string) => void
  answerLearning: (key: string, answer: 'yes' | 'no') => void
  addRequest: (r: BuyerRequest) => void
  withdrawRequest: (id: string) => void
  joinWaitlist: (listingId: string) => void
  reset: () => void
}

const BuyerContext = createContext<Ctx | null>(null)

export function BuyerProvider({ children }: { children: ReactNode }) {
  const [buyer, setBuyer] = useState<BuyerState>(load)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(buyer))
    } catch {
      /* ingen lagring – fungerar ändå under sessionen */
    }
  }, [buyer])

  const upd = useCallback((fn: (b: BuyerState) => BuyerState) => setBuyer((b) => fn(b)), [])

  const value: Ctx = {
    buyer,
    setProfile: (profile) => upd((b) => ({ ...b, profile })),
    patchProfile: (p) => upd((b) => (b.profile ? { ...b, profile: { ...b.profile, ...p } } : b)),
    toggleSave: (id) => upd((b) => ({ ...b, saved: b.saved.includes(id) ? b.saved.filter((x) => x !== id) : [...b.saved, id], dismissed: b.dismissed.filter((d) => d.id !== id) })),
    dismiss: (d) => upd((b) => ({ ...b, dismissed: [...b.dismissed.filter((x) => x.id !== d.id), d], saved: b.saved.filter((x) => x !== d.id) })),
    undismiss: (id) => upd((b) => ({ ...b, dismissed: b.dismissed.filter((x) => x.id !== id) })),
    markSeen: (id) => upd((b) => (b.seen.includes(id) ? b : { ...b, seen: [...b.seen, id] })),
    share: (id) => upd((b) => (b.shared.includes(id) ? b : { ...b, shared: [...b.shared, id] })),
    answerLearning: (key, answer) => upd((b) => ({ ...b, learned: { ...b.learned, [key]: answer } })),
    addRequest: (r) => upd((b) => ({ ...b, requests: [r, ...b.requests.filter((x) => x.listingId !== r.listingId || x.status === 'Tillbakadragen')] })),
    withdrawRequest: (id) => upd((b) => ({ ...b, requests: b.requests.map((r) => (r.id === id ? { ...r, status: 'Tillbakadragen' } : r)) })),
    joinWaitlist: (listingId) => upd((b) => (b.waitlist.includes(listingId) ? b : { ...b, waitlist: [...b.waitlist, listingId] })),
    reset: () => setBuyer(EMPTY),
  }
  return <BuyerContext.Provider value={value}>{children}</BuyerContext.Provider>
}

export function useBuyer() {
  const c = useContext(BuyerContext)
  if (!c) throw new Error('useBuyer måste användas inuti <BuyerProvider>')
  return c
}
