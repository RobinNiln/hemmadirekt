import { useMemo } from 'react'
import { LISTINGS, RINGVAGEN_ID, type Listing } from '../data/listings'
import { useSale } from './SaleContext'

// Slår ihop mockade annonser med säljarens egen annons.
// När du publicerar din bostad syns den direkt under "Köpa bostad".
export function useListings() {
  const { state } = useSale()

  return useMemo(() => {
    const ownPublished = state.started && state.mode === 'sell' && state.published
    const list: Listing[] = LISTINGS.map((l) => {
      if (l.id !== RINGVAGEN_ID || !ownPublished) return l
      const p = state.property
      return {
        ...l,
        street: p.street,
        type: p.kind === 'villa' ? 'Villa' : 'Lägenhet',
        tenure: p.kind === 'villa' ? 'Äganderätt' : 'Bostadsrätt',
        area: p.area,
        city: p.city,
        rooms: p.rooms,
        size: p.size,
        floor: p.floor || undefined,
        price: p.askingPrice,
        fee: p.fee,
        built: p.built,
        association: p.association || undefined,
        images: state.photos.length ? state.photos.map((ph) => ph.url) : l.images,
        description: state.description || l.description,
        viewing: state.viewing
          ? {
              date: state.viewing.date,
              start: state.viewing.start,
              end: state.viewing.end,
              spotsLeft: Math.max(0, state.viewing.capacity - state.viewing.signups),
            }
          : l.viewing,
        isNew: true,
      }
    })
    return { listings: list, ownId: ownPublished ? RINGVAGEN_ID : null }
  }, [state])
}
