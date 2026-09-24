import { BadgeCheck, FileLock2, Gavel, Lock, ShieldCheck, History } from 'lucide-react'
import { cn } from './ui'
import { PROTOTYPE_DISCLAIMER } from '../config/brand'

// Trygghetsmarkeringar. Observera: de beskriver hur tjänsten är tänkt att fungera –
// prototypen är inte certifierad eller kopplad till BankID på riktigt.

const TRUST = [
  { icon: BadgeCheck, label: 'BankID-verifierade köpare' },
  { icon: Gavel, label: 'Säker budgivning' },
  { icon: History, label: 'Tydlig budhistorik' },
  { icon: FileLock2, label: 'Dokument sparade' },
  { icon: Lock, label: 'Krypterad anslutning' },
]

export function TrustRow({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-6 gap-y-2', className)}>
      {TRUST.slice(0, compact ? 3 : TRUST.length).map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2 text-sm text-ink-soft">
          <Icon className="h-4 w-4 text-petrol-600" />
          {label}
        </li>
      ))}
    </ul>
  )
}

export function VerifiedTag({ label = 'Verifierad med BankID' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-petrol-700">
      <ShieldCheck className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

export function DemoNotice({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900', className)}>
      <span className="mt-0.5 rounded bg-amber-200/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">Demo</span>
      <span>{children ?? PROTOTYPE_DISCLAIMER}</span>
    </div>
  )
}
