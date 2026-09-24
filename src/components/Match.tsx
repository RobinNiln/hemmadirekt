import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Heart, Minus, X } from 'lucide-react'
import type { Listing } from '../data/listings'
import { prefSummary, reqSummary, type MatchLevel, type MatchResult } from '../lib/matching'
import { formatSEK } from '../lib/format'
import { DISMISS_REASONS, useBuyer, type DismissReason } from '../state/BuyerContext'
import { Photo } from './Photo'
import { Button, Modal, Textarea, cn } from './ui'

// Matchningsnivå – den främsta signalen. Procent visas aldrig som huvudsak.
const LEVEL_STYLE: Record<MatchLevel, string> = {
  'Mycket bra match': 'bg-petrol-700 text-white',
  'Bra match': 'bg-mint-200 text-petrol-900',
  'Möjlig match': 'bg-sand-200 text-ink-soft',
  'Ingen match': 'bg-red-50 text-red-800',
}

export function MatchBadge({ level, className }: { level: MatchLevel; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-bold', LEVEL_STYLE[level], className)}>{level}</span>
}

export function MatchCard({ listing, match, isNew, compact }: { listing: Listing; match: MatchResult; isNew?: boolean; compact?: boolean }) {
  const { buyer, toggleSave } = useBuyer()
  const [dismissOpen, setDismissOpen] = useState(false)
  const saved = buyer.saved.includes(listing.id)
  const dismissed = buyer.dismissed.some((d) => d.id === listing.id)
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-sand-300/70 bg-white shadow-card transition hover:shadow-lift">
      <Link to={`/bostad/${listing.id}`} className="relative block">
        <Photo src={listing.images[0]} alt={listing.street} rotation={listing.imageRotations?.[0]} className={cn('w-full transition duration-500 group-hover:scale-[1.02]', compact ? 'aspect-[16/10]' : 'aspect-[4/3]')} />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <MatchBadge level={match.level} />
          {isNew && <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-petrol-800">Ny</span>}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link to={`/bostad/${listing.id}`}>
          <h3 className="text-lg font-bold">{listing.street}</h3>
          <p className="text-sm text-ink-muted">{listing.area}</p>
          <p className="mt-2 text-xl font-bold tracking-tight">{formatSEK(listing.price)}</p>
          <p className="text-sm text-ink-soft">
            {listing.rooms} rum · {listing.size} m²
          </p>
        </Link>
        <div className="mt-3 space-y-0.5 text-sm">
          <p className="font-semibold text-petrol-800">{reqSummary(match)}</p>
          <p className="text-ink-muted">{prefSummary(match)}</p>
        </div>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {match.highlights.map((h) => (
            <li key={h} className="flex items-center gap-1 rounded-full bg-mint-100 px-2.5 py-1 text-xs font-medium text-petrol-800">
              <Check className="h-3 w-3" strokeWidth={3} /> {h}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-sand-100 pt-4">
          <Link to={`/bostad/${listing.id}#matchning`} className="flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-petrol-700 hover:underline">
            Se varför den matchar <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex gap-1">
            <button onClick={() => toggleSave(listing.id)} className={cn('flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-sand-300 hover:bg-sand-100', saved ? 'text-rose-600' : 'text-ink-soft')} aria-label={saved ? 'Ta bort från sparade' : 'Spara'} title={saved ? 'Sparad' : 'Spara'}>
              <Heart className={cn('h-4 w-4', saved && 'fill-current')} />
            </button>
            {!dismissed && (
              <button onClick={() => setDismissOpen(true)} className="flex h-9 items-center gap-1 whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold text-ink-muted ring-1 ring-sand-300 hover:bg-sand-100" title="Inte för mig">
                <X className="h-3.5 w-3.5" /> Inte för mig
              </button>
            )}
          </div>
        </div>
      </div>
      <DismissModal listingId={listing.id} open={dismissOpen} onClose={() => setDismissOpen(false)} />
    </article>
  )
}

export function DismissModal({ listingId, open, onClose }: { listingId: string; open: boolean; onClose: () => void }) {
  const { dismiss } = useBuyer()
  const [reasons, setReasons] = useState<DismissReason[]>([])
  const [other, setOther] = useState('')
  useEffect(() => {
    if (open) {
      setReasons([])
      setOther('')
    }
  }, [open])
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Vad var det som inte passade?"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Avbryt
          </Button>
          <Button
            onClick={() => {
              dismiss({ id: listingId, reasons, other })
              onClose()
            }}
          >
            Inte för mig
          </Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-ink-muted">Välj gärna en eller flera anledningar. Det hjälper oss att visa bättre bostäder.</p>
      <div className="flex flex-wrap gap-2">
        {DISMISS_REASONS.map((r) => {
          const on = reasons.includes(r)
          return (
            <button key={r} onClick={() => setReasons(on ? reasons.filter((x) => x !== r) : [...reasons, r])} className={cn('rounded-full px-3.5 py-2 text-sm font-medium ring-1 transition', on ? 'bg-petrol-700 text-white ring-petrol-700' : 'bg-white text-ink-soft ring-sand-300 hover:ring-ink-faint')}>
              {r}
            </button>
          )
        })}
      </div>
      {reasons.includes('Annat') && <Textarea rows={2} className="mt-3" placeholder="Berätta gärna mer" value={other} onChange={(e) => setOther(e.target.value)} />}
    </Modal>
  )
}

// Förklaringen på objektsidan: vad som matchar och vad som inte gör det.
export function MatchExplanation({ match }: { match: MatchResult }) {
  return (
    <section id="matchning" className="scroll-mt-28 overflow-hidden rounded-2xl border border-petrol-200 bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-petrol-50 px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <MatchBadge level={match.level} />
          <span className="text-sm font-semibold text-petrol-900">{reqSummary(match)}</span>
          <span className="text-sm text-petrol-800">{prefSummary(match)}</span>
        </div>
        <span className="text-xs text-petrol-700">Utifrån din bostadsprofil</span>
      </div>
      <div className="grid gap-6 p-6 md:grid-cols-2">
        <div>
          <h3 className="font-bold">{match.passes ? 'Därför passar bostaden dig' : 'Det här stämmer'}</h3>
          <ul className="mt-3 space-y-2">
            {match.reasons.map((r) => (
              <li key={r} className="flex items-start gap-2 text-[15px]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-petrol-600" strokeWidth={3} /> {r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold">Det här matchar inte helt</h3>
          {match.weaknesses.length ? (
            <ul className="mt-3 space-y-2">
              {match.weaknesses.map((w) => (
                <li key={w} className="flex items-start gap-2 text-[15px] text-ink-soft">
                  <Minus className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" strokeWidth={3} /> {w}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">Vi hittade inget som skaver mot din profil.</p>
          )}
        </div>
      </div>
      <p className="border-t border-sand-200 px-6 py-3 text-xs text-ink-muted">
        Matchningen bygger på uppgifter säljaren angett och på områdesdata. Vi gissar inte avstånd eller restider.
      </p>
    </section>
  )
}
