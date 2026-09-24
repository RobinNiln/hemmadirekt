// Små hjälpfunktioner för att visa pengar, datum och tal på svenska.

const sekFormatter = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 })

export function formatNumber(n: number): string {
  return sekFormatter.format(Math.round(n))
}

export function formatSEK(n: number): string {
  return `${formatNumber(n)} kr`
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// '2026-10-04' -> 'Söndag 4 oktober'
export function formatDateLong(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  if (isNaN(d.getTime())) return iso
  const s = d.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })
  return capitalize(s)
}

// '2026-12-15' -> '15 december'
export function formatDateShort(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })
}

// Tar bort allt som inte är siffror, t.ex. '4 495 000 kr' -> 4495000
export function parseAmount(s: string): number {
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10)
  return isNaN(n) ? 0 : n
}

export function nowTime(): string {
  const d = new Date()
  return d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}
