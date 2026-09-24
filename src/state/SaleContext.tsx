import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { formatSEK, nowTime, uid } from '../lib/format'
import { DEFAULT_PROPERTY, DEMO_BIDS, DEMO_INTERESTED, DEMO_VILLA, EMPTY_CONTRACT, EMPTY_STATE, demoState } from './presets'
import type { Bid, Closing, Contract, ContractConditions, DocsState, Package, PropertyDetails, PropertyKind, SalePhoto, SaleState, Viewing } from './types'

// ---------------------------------------------------------------------------
// Här ligger all "affärslogik" för prototypen. Allt sparas i webbläsaren
// (localStorage) så att du kan ladda om sidan utan att tappa din försäljning.
// En riktig backend skulle ersätta just den här filen.
// ---------------------------------------------------------------------------

// Versionsnumret höjs när datamodellen ändras, så att gammal sparad data inte krockar.
const STORAGE_KEY = 'hemmadirekt-sale-v2'

type Action =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'START_SALE'; pkg: Package }
  | { type: 'UPDATE_PROPERTY'; patch: Partial<PropertyDetails> }
  | { type: 'SET_KIND'; kind: PropertyKind }
  | { type: 'SET_PHOTOS'; photos: SalePhoto[] }
  | { type: 'SET_DESCRIPTION'; text: string }
  | { type: 'SET_VIEWING'; viewing: Viewing | null }
  | { type: 'PUBLISH' }
  | { type: 'SIMULATE_MARKET' }
  | { type: 'ADD_BID'; bid: Bid }
  | { type: 'ACCEPT_BID'; bidId: string }
  | { type: 'CONTRACT_PATCH'; patch: Partial<Contract> }
  | { type: 'SET_CONDITIONS'; conditions: ContractConditions }
  | { type: 'DOCS_PATCH'; patch: Partial<DocsState> }
  | { type: 'CLOSING_PATCH'; patch: Partial<Closing> }
  | { type: 'NOTIFY'; text: string; link?: string }
  | { type: 'READ_NOTIFICATIONS' }
  | { type: 'START_DIRECT_DEAL'; buyerName: string; price: number; accessDate: string; property: Partial<PropertyDetails> }
  | { type: 'LOAD_DEMO' }
  | { type: 'RESET' }

function notif(text: string, link?: string) {
  return { id: uid('n'), text, time: nowTime(), read: false, link }
}

// Ett nytt avtal får rätt standardvillkor beroende på bostadstyp.
function freshContract(kind: PropertyKind, bid: Bid): Contract {
  return {
    ...EMPTY_CONTRACT,
    price: bid.amount,
    deposit: Math.round(bid.amount * 0.1),
    accessDate: bid.desiredAccess,
    conditions: { ...EMPTY_CONTRACT.conditions, brf: kind === 'brf', inspection: kind === 'villa' },
  }
}

function reducer(state: SaleState, action: Action): SaleState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, loggedIn: true }
    case 'LOGOUT':
      return { ...state, loggedIn: false }
    case 'START_SALE':
      return { ...EMPTY_STATE, loggedIn: true, started: true, mode: 'sell', pkg: action.pkg }
    case 'UPDATE_PROPERTY':
      return { ...state, property: { ...state.property, ...action.patch } }
    case 'SET_KIND': {
      if (state.property.kind === action.kind) return state
      // I demon byter vi till en exempelbostad av rätt typ men behåller priset så att buden stämmer.
      const base = action.kind === 'villa' ? DEMO_VILLA : DEFAULT_PROPERTY
      const signed = state.contract.signedBySeller || state.contract.signedByBuyer
      return {
        ...state,
        property: { ...base, askingPrice: state.property.askingPrice },
        contract: signed
          ? state.contract
          : { ...state.contract, conditions: { ...state.contract.conditions, brf: action.kind === 'brf', inspection: action.kind === 'villa' } },
      }
    }
    case 'SET_PHOTOS':
      return { ...state, photos: action.photos }
    case 'SET_DESCRIPTION':
      return { ...state, description: action.text }
    case 'SET_VIEWING':
      return { ...state, viewing: action.viewing }
    case 'PUBLISH':
      return {
        ...state,
        published: true,
        viewing: state.viewing ? { ...state.viewing, published: true } : null,
        notifications: [notif('Din annons är publicerad. Nu kan köpare hitta bostaden.', '/min-forsaljning'), ...state.notifications],
      }
    case 'SIMULATE_MARKET':
      return {
        ...state,
        marketSimulated: true,
        stats: { views: 324, saved: 27, viewingSignups: 18, interested: 4 },
        viewing: state.viewing ? { ...state.viewing, signups: 18 } : state.viewing,
        interested: DEMO_INTERESTED,
        notifications: [
          notif('Tre nya personer har bokat visning.', '/min-forsaljning'),
          notif('Marcus Berg har registrerat lånelöfte.', '/min-forsaljning/intressenter'),
          ...state.notifications,
        ],
      }
    case 'ADD_BID':
      return {
        ...state,
        bids: [...state.bids, action.bid],
        notifications: [
          notif(`${action.bid.bidderName} har lagt ett nytt bud: ${formatSEK(action.bid.amount)}.`, '/min-forsaljning/budgivning'),
          ...state.notifications,
        ],
      }
    case 'ACCEPT_BID': {
      const bid = state.bids.find((b) => b.id === action.bidId)
      if (!bid) return state
      return {
        ...state,
        acceptedBidId: bid.id,
        contract: freshContract(state.property.kind, bid),
        notifications: [notif(`Du har accepterat budet från ${bid.bidderName}. Nästa steg: avtalet.`, '/min-forsaljning/avtal'), ...state.notifications],
      }
    }
    case 'CONTRACT_PATCH':
      return { ...state, contract: { ...state.contract, ...action.patch } }
    case 'SET_CONDITIONS':
      return { ...state, contract: { ...state.contract, conditions: action.conditions } }
    case 'DOCS_PATCH':
      return { ...state, docs: { ...state.docs, ...action.patch } }
    case 'CLOSING_PATCH': {
      const closing = { ...state.closing, ...action.patch }
      closing.completed = closing.finalPayment && closing.keysHandedOver && closing.buyerMovedIn
      return { ...state, closing }
    }
    case 'NOTIFY':
      return { ...state, notifications: [notif(action.text, action.link), ...state.notifications] }
    case 'READ_NOTIFICATIONS':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }
    case 'START_DIRECT_DEAL': {
      const bid: Bid = {
        id: uid('b'),
        bidderId: 'direct-buyer',
        bidderName: action.buyerName,
        amount: action.price,
        time: nowTime(),
        desiredAccess: action.accessDate,
      }
      const property = { ...EMPTY_STATE.property, ...action.property, askingPrice: action.price }
      return {
        ...EMPTY_STATE,
        loggedIn: true,
        started: true,
        mode: 'direct',
        pkg: 'direct',
        property,
        bids: [bid],
        acceptedBidId: bid.id,
        contract: freshContract(property.kind, bid),
        docs: { ...EMPTY_STATE.docs, associationVerified: true, financingRegistered: true },
        notifications: [notif(`Affären med ${action.buyerName} är skapad. Nu skapar vi avtalet.`, '/min-forsaljning/avtal')],
      }
    }
    case 'LOAD_DEMO':
      return demoState()
    case 'RESET':
      return EMPTY_STATE
    default:
      return state
  }
}

function loadState(): SaleState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw) as SaleState
    return { ...EMPTY_STATE, ...parsed }
  } catch {
    return EMPTY_STATE
  }
}

function saveState(state: SaleState) {
  try {
    // Egna uppladdade bilder (blob:) går inte att spara mellan sidladdningar.
    const toSave = { ...state, photos: state.photos.filter((p) => !p.url.startsWith('blob:')) }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch {
    /* Lagring är inte tillgänglig – appen fungerar ändå under sessionen. */
  }
}

interface SaleContextValue {
  state: SaleState
  dispatch: React.Dispatch<Action>
  // Härledda värden
  highestBid: Bid | null
  acceptedBid: Bid | null
  sortedBids: Bid[]
  unreadCount: number
  // Simuleringar
  simulateBidding: () => void
  biddingRunning: boolean
  later: (ms: number, fn: () => void) => void
}

const SaleContext = createContext<SaleContextValue | null>(null)

export function SaleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const timers = useRef<number[]>([])
  const [biddingRunning, setBiddingRunning] = useReducerFlag()

  useEffect(() => saveState(state), [state])
  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), [])

  const sortedBids = useMemo(() => [...state.bids].sort((a, b) => a.amount - b.amount), [state.bids])
  const highestBid = sortedBids.length ? sortedBids[sortedBids.length - 1] : null
  const acceptedBid = state.bids.find((b) => b.id === state.acceptedBidId) ?? null
  const unreadCount = state.notifications.filter((n) => !n.read).length

  // Kör något efter en fördröjning – används för simulerade händelser.
  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])

  // Lägger in demobuden ett i taget, så att det känns som en riktig budgivning.
  const simulateBidding = useCallback(() => {
    setBiddingRunning(true)
    DEMO_BIDS.forEach((bid, i) => {
      later(900 + i * 1400, () => {
        dispatch({ type: 'ADD_BID', bid: { ...bid, id: uid('b') } })
        if (i === DEMO_BIDS.length - 1) setBiddingRunning(false)
      })
    })
  }, [setBiddingRunning, later])

  const value: SaleContextValue = {
    state,
    dispatch,
    highestBid,
    acceptedBid,
    sortedBids,
    unreadCount,
    simulateBidding,
    biddingRunning,
    later,
  }
  return <SaleContext.Provider value={value}>{children}</SaleContext.Provider>
}

function useReducerFlag(): [boolean, (v: boolean) => void] {
  const [v, set] = useReducer((_: boolean, next: boolean) => next, false)
  return [v, set]
}

export function useSale() {
  const ctx = useContext(SaleContext)
  if (!ctx) throw new Error('useSale måste användas inuti <SaleProvider>')
  return ctx
}
