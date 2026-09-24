import { useMemo } from 'react'
import { LISTINGS, RINGVAGEN_ID, type Listing } from '../data/listings'
import { useSale } from './SaleContext'
import type { SaleState } from './types'

// Gör om säljarens utkast till en annons – samma form som alla andra bostäder.
// Används både i förhandsgranskningen och när annonsen är publicerad.
export function listingFromSale(state: SaleState, base: Listing = LISTINGS[0]): Listing {
  const p = state.property
  return {
    ...base,
    id: RINGVAGEN_ID,
    street: p.street,
    postalCode: p.postalCode,
    area: p.area,
    city: p.city,
    type: p.listingType,
    tenure: p.listingType === 'Bostadsrätt' ? 'Bostadsrätt' : 'Äganderätt',
    price: p.askingPrice,
    priceType: state.listing.priceType,
    fee: p.fee,
    rooms: p.rooms,
    bedrooms: p.bedrooms,
    size: p.size,
    plotArea: p.plotArea || undefined,
    floor: p.floor || undefined,
    elevator: p.elevator,
    built: p.built,
    association: p.association || undefined,
    features: state.listing.features,
    headline: state.listing.headline || undefined,
    description: state.description,
    images: state.photos.length ? state.photos.map((ph) => ph.url) : base.images,
    imageRotations: state.photos.length ? state.photos.map((ph) => ph.rotation ?? 0) : undefined,
    sellerId: 'demo-seller',
    daysOnMarket: 0,
    viewing: state.viewing
      ? {
          date: state.viewing.date,
          start: state.viewing.start,
          end: state.viewing.end,
          spotsLeft: Math.max(0, state.viewing.capacity - state.viewing.signups),
        }
      : base.viewing,
    isNew: true,
  }
}

// Slår ihop mockade annonser med säljarens egen annons.
// När du publicerar din bostad syns den direkt under "Köpa bostad" och i matchningarna.
export function useListings() {
  const { state } = useSale()

  return useMemo(() => {
    const ownPublished = state.started && state.mode === 'sell' && state.published
    const list: Listing[] = LISTINGS.map((l) => (l.id === RINGVAGEN_ID && ownPublished ? { ...listingFromSale(state, l), daysOnMarket: l.daysOnMarket } : l))
    return { listings: list, ownId: ownPublished ? RINGVAGEN_ID : null }
  }, [state])
}
