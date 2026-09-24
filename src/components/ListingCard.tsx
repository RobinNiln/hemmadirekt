import { Link } from 'react-router-dom'
import { Calendar, Heart } from 'lucide-react'
import { useState } from 'react'
import type { Listing } from '../data/listings'
import { formatDateLong, formatSEK } from '../lib/format'
import { Photo } from './Photo'
import { Badge, cn } from './ui'

export function ListingCard({ listing, own }: { listing: Listing; own?: boolean }) {
  const [saved, setSaved] = useState(false)
  const feeLabel = listing.tenure === 'Bostadsrätt' ? 'Avgift' : 'Drift'
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-sand-300/70 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <Link to={`/bostad/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Photo src={listing.images[0]} alt={`${listing.street}, ${listing.area}`} className="h-full w-full transition duration-500 group-hover:scale-[1.03]" />
          <div className="absolute left-3 top-3 flex gap-1.5">
            {own && <Badge tone="petrol">Din annons</Badge>}
            {listing.isNew && !own && <Badge tone="green">Ny</Badge>}
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm font-medium text-ink-muted">
            {listing.type} · {listing.area}, {listing.city}
          </p>
          <h3 className="mt-1 text-lg font-bold text-ink">{listing.street}</h3>
          <p className="mt-2 text-xl font-bold tracking-tight text-ink">{formatSEK(listing.price)}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
            <span>{listing.rooms} rum</span>
            <span>{listing.size} m²</span>
            <span>
              {feeLabel} {formatSEK(listing.fee)}/mån
            </span>
          </div>
          <p className="mt-4 flex items-center gap-1.5 border-t border-sand-200 pt-3 text-xs text-ink-muted">
            <Calendar className="h-3.5 w-3.5" />
            Visning {formatDateLong(listing.viewing.date).toLowerCase()} {listing.viewing.start}
          </p>
        </div>
      </Link>
      <button
        onClick={() => setSaved(!saved)}
        className={cn('absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-card backdrop-blur transition hover:bg-white', saved ? 'text-rose-600' : 'text-ink-soft')}
        aria-label={saved ? 'Ta bort från sparade' : 'Spara bostaden'}
      >
        <Heart className={cn('h-4 w-4', saved && 'fill-current')} />
      </button>
    </article>
  )
}
