import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { Check, Circle, Loader2, X } from 'lucide-react'

// Små återanvändbara byggklossar i samma anda som shadcn/ui.

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

// ---------- Knappar ----------
type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-petrol-700 text-white hover:bg-petrol-800 shadow-sm',
  secondary: 'bg-white text-ink border border-sand-300 hover:border-ink-faint hover:bg-sand-50',
  ghost: 'text-ink-soft hover:bg-sand-200 hover:text-ink',
  accent: 'bg-mint-300 text-petrol-900 hover:bg-mint-400',
  danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50',
}
const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-[15px] gap-2',
  lg: 'h-14 px-5 sm:px-7 text-base gap-2.5',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  to?: string
  full?: boolean
}

export function Button({ variant = 'primary', size = 'md', to, full, className, children, ...rest }: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-petrol-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
    variantClasses[variant],
    sizeClasses[size],
    full && 'w-full',
    className,
  )
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}

// ---------- Layout ----------
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>
}

export function Card({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article' }) {
  const Tag = as
  return <Tag className={cn('rounded-2xl border border-sand-300/70 bg-white shadow-card', className)}>{children}</Tag>
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-xs font-semibold uppercase tracking-[0.14em] text-petrol-600', className)}>{children}</p>
}

// ---------- Badges ----------
type Tone = 'green' | 'petrol' | 'neutral' | 'amber' | 'blue'
const toneClasses: Record<Tone, string> = {
  green: 'bg-mint-100 text-petrol-800 ring-mint-300/60',
  petrol: 'bg-petrol-700 text-white ring-petrol-700',
  neutral: 'bg-sand-200 text-ink-soft ring-sand-300',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  blue: 'bg-sky-50 text-sky-800 ring-sky-200',
}
export function Badge({ children, tone = 'neutral', className, icon }: { children: ReactNode; tone?: Tone; className?: string; icon?: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', toneClasses[tone], className)}>
      {icon}
      {children}
    </span>
  )
}

export function StatusDot({ tone = 'green' }: { tone?: 'green' | 'amber' | 'grey' }) {
  const c = tone === 'green' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-ink-faint'
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      {tone === 'green' && <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-40', c)} />}
      <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', c)} />
    </span>
  )
}

// ---------- Stegindikator (1 Bostaden → 2 Annons → …) ----------
export function StepIndicator({ steps, current, className }: { steps: string[]; current: number; className?: string }) {
  // current är 1-baserat. Steg < current = klart.
  return (
    <ol className={cn('flex items-center gap-1 overflow-x-auto pb-1 sm:gap-2', className)} aria-label="Framsteg">
      {steps.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <li key={label} className="flex shrink-0 items-center gap-1 sm:gap-2">
            <span
              className={cn(
                'flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-xs font-semibold sm:text-sm',
                active && 'bg-petrol-700 text-white',
                done && 'bg-mint-100 text-petrol-800',
                !active && !done && 'bg-sand-200 text-ink-muted',
              )}
              aria-current={active ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-[11px]',
                  active && 'bg-white/15',
                  done && 'bg-petrol-700 text-white',
                  !active && !done && 'bg-white text-ink-muted',
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : n}
              </span>
              {label}
            </span>
            {n < steps.length && <span className="h-px w-3 shrink-0 bg-sand-300 sm:w-5" aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}

// ---------- Progress bar ----------
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-sand-200', className)}>
      <div className="h-full rounded-full bg-petrol-600 transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

// ---------- Checklista ----------
export interface ChecklistItem {
  label: string
  done: boolean
  current?: boolean
  hint?: string
}
export function Checklist({ items, className }: { items: ChecklistItem[]; className?: string }) {
  return (
    <ul className={cn('space-y-1', className)}>
      {items.map((it) => (
        <li
          key={it.label}
          className={cn('flex items-start gap-3 rounded-xl px-3 py-2.5', it.current && 'bg-mint-100/70 ring-1 ring-inset ring-mint-300/70')}
        >
          <span className="mt-0.5">
            {it.done ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-petrol-700 text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            ) : it.current ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-petrol-600">
                <span className="h-2 w-2 rounded-full bg-petrol-600" />
              </span>
            ) : (
              <Circle className="h-5 w-5 text-sand-300" />
            )}
          </span>
          <span className="min-w-0">
            <span className={cn('block text-[15px]', it.done ? 'text-ink' : it.current ? 'font-semibold text-ink' : 'text-ink-muted')}>{it.label}</span>
            {it.hint && <span className="mt-0.5 block text-sm text-ink-muted">{it.hint}</span>}
          </span>
          {it.current && <span className="ml-auto shrink-0 text-xs font-semibold text-petrol-700">Nu</span>}
        </li>
      ))}
    </ul>
  )
}

// ---------- Formulär ----------
export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-ink-muted">{hint}</span>}
    </label>
  )
}

const inputBase =
  'w-full rounded-xl border border-sand-300 bg-white px-3.5 text-[15px] text-ink placeholder:text-ink-faint transition focus:border-petrol-500 focus:outline-none focus:ring-4 focus:ring-petrol-100'

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputBase, 'h-12', className)} {...rest} />
}
export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputBase, 'h-12 appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9', className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7177' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...rest}>
      {children}
    </select>
  )
}
export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputBase, 'py-3 leading-relaxed', className)} {...rest} />
}

export function CheckboxRow({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; hint?: string }) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition', checked ? 'border-petrol-500 bg-petrol-50/60' : 'border-sand-300 bg-white hover:border-ink-faint')}>
      <span
        className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition', checked ? 'border-petrol-700 bg-petrol-700 text-white' : 'border-sand-300 bg-white')}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block text-[15px] font-medium text-ink">{label}</span>
        {hint && <span className="mt-1 block text-sm text-ink-muted">{hint}</span>}
      </span>
    </label>
  )
}

// ---------- Modal ----------
export function Modal({ open, onClose, title, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode; size?: 'md' | 'lg' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade" onClick={onClose} />
      <div className={cn('relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-lift animate-rise sm:rounded-2xl', size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-lg')}>
        <div className="flex items-start justify-between gap-4 border-b border-sand-200 px-6 py-5">
          <div className="text-lg font-bold text-ink">{title}</div>
          <button onClick={onClose} className="-m-1 rounded-lg p-1 text-ink-muted hover:bg-sand-200 hover:text-ink" aria-label="Stäng">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-2 border-t border-sand-200 px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin', className)} />
}

// ---------- Statistikruta ----------
export function Stat({ value, label, icon }: { value: ReactNode; label: string; icon?: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between text-ink-muted">
        <span className="text-sm">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-ink">{value}</div>
    </Card>
  )
}

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-[15px] text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
