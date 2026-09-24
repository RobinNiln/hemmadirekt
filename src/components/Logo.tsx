import { Link } from 'react-router-dom'
import { BRAND } from '../config/brand'
import { cn } from './ui'

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link to="/" className={cn('group inline-flex items-center gap-2.5', className)} aria-label={`${BRAND.name} – startsida`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="8" fill={light ? '#CDEAD4' : '#0F4744'} />
        <path d="M8 15.5 16 9l8 6.5V24a1 1 0 0 1-1 1h-4.5v-5.5h-5V25H9a1 1 0 0 1-1-1z" fill={light ? '#0F4744' : '#CDEAD4'} />
      </svg>
      <span className={cn('text-[19px] font-bold tracking-tight', light ? 'text-white' : 'text-ink')}>{BRAND.name}</span>
    </Link>
  )
}
