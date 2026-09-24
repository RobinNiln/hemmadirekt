import { AlertTriangle, Check, Circle, CircleDot, Hourglass, Minus } from 'lucide-react'
import type { StatusKind } from '../lib/docRegistry'
import { cn } from './ui'

// De fem dokumentstatusarna (+ "ej aktuellt") med ikon och färg.
const STYLE: Record<StatusKind, { icon: typeof Check; cls: string; dot: string }> = {
  done: { icon: Check, cls: 'bg-mint-100 text-petrol-800 ring-mint-300/70', dot: 'bg-petrol-700 text-white' },
  progress: { icon: CircleDot, cls: 'bg-sky-50 text-sky-800 ring-sky-200', dot: 'bg-sky-100 text-sky-700' },
  todo: { icon: Circle, cls: 'bg-sand-100 text-ink-muted ring-sand-300', dot: 'bg-sand-200 text-ink-faint' },
  action: { icon: AlertTriangle, cls: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-100 text-amber-700' },
  waiting: { icon: Hourglass, cls: 'bg-violet-50 text-violet-800 ring-violet-200', dot: 'bg-violet-100 text-violet-700' },
  na: { icon: Minus, cls: 'bg-sand-100 text-ink-faint ring-sand-200', dot: 'bg-sand-100 text-ink-faint' },
}

export function DocStatusBadge({ kind, label, className }: { kind: StatusKind; label: string; className?: string }) {
  const s = STYLE[kind]
  const Icon = s.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', s.cls, className)}>
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={kind === 'done' ? 3 : 2} />
      {label}
    </span>
  )
}

export function DocStatusIcon({ kind, className }: { kind: StatusKind; className?: string }) {
  const s = STYLE[kind]
  const Icon = s.icon
  return (
    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', s.dot, className)}>
      <Icon className="h-4 w-4" strokeWidth={kind === 'done' ? 3 : 2} />
    </span>
  )
}

export const STATUS_LEGEND: { kind: StatusKind; label: string }[] = [
  { kind: 'done', label: 'Klar' },
  { kind: 'progress', label: 'Pågår' },
  { kind: 'todo', label: 'Inte påbörjad' },
  { kind: 'action', label: 'Kräver åtgärd' },
  { kind: 'waiting', label: 'Väntar på annan part' },
]
