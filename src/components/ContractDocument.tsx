import { contractSections, type ContractData } from '../lib/documents'
import { BRAND } from '../config/brand'

// Förhandsvisning av överlåtelseavtalet, tydligt märkt som demo.
export function ContractDocument({ data, signed }: { data: ContractData; signed?: { seller: boolean; buyer: boolean } }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-sand-300 bg-white shadow-card">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
        <span className="-rotate-[24deg] select-none whitespace-nowrap text-6xl font-black tracking-widest text-amber-500/10 sm:text-8xl">DEMO</span>
      </div>
      <div className="border-b border-amber-200 bg-amber-50 px-6 py-2.5 text-center text-xs font-semibold text-amber-900">
        DEMO – detta är inte ett juridiskt avtal och får inte användas i en verklig affär
      </div>
      <div className="relative px-6 py-8 sm:px-10">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">{BRAND.name}</p>
        <h2 className="mt-1 text-2xl font-bold">Överlåtelseavtal bostadsrätt</h2>
        <div className="mt-6 space-y-5 font-serif text-[15px] leading-relaxed text-ink-soft">
          {contractSections(data).map((s) => (
            <section key={s.title}>
              <h3 className="font-sans text-sm font-bold text-ink">{s.title}</h3>
              {s.body.split('\n').filter(Boolean).map((line, i) => (
                <p key={i} className="mt-1">
                  {line}
                </p>
              ))}
            </section>
          ))}
        </div>
        <div className="mt-8 grid gap-6 border-t border-sand-200 pt-6 sm:grid-cols-2">
          {[
            ['Säljare', data.seller, signed?.seller],
            ['Köpare', data.buyer, signed?.buyer],
          ].map(([role, name, ok]) => (
            <div key={role as string}>
              <p className="text-xs text-ink-muted">{role as string}</p>
              <div className="mt-2 flex h-10 items-end border-b border-dashed border-ink-faint pb-1">
                {ok ? <span className="text-sm font-semibold text-petrol-700">✓ Signerat med BankID (simulerat)</span> : <span className="text-sm text-ink-faint">Ej signerat</span>}
              </div>
              <p className="mt-1 text-sm font-medium">{name as string}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
