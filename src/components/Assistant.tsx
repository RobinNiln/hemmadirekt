import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { BRAND } from '../config/brand'
import { cn } from './ui'

// "Fråga HemmaDirekt" – en mockad AI-assistent med förskrivna svar.

const QA: { q: string; keywords: string[]; a: string }[] = [
  {
    q: 'Vad händer efter att jag accepterat ett bud?',
    keywords: ['accept', 'efter', 'bud'],
    a: 'När du accepterat ett bud är affären inte klar juridiskt – det är den först när både du och köparen har signerat överlåtelseavtalet. Nästa steg är att vi skapar avtalet tillsammans: köpare, pris, tillträdesdag och eventuella villkor. Sedan granskar ni båda avtalet och signerar.',
  },
  {
    q: 'Vad är en handpenning?',
    keywords: ['handpenning', 'deposition'],
    a: 'Handpenningen är en första del av köpeskillingen, oftast 10 % av priset. Köparen betalar den i samband med att avtalet skrivs, och den fungerar som en säkerhet för att köparen fullföljer köpet. Resten betalas på tillträdesdagen.',
  },
  {
    q: 'Hur fungerar medlemskap i BRF?',
    keywords: ['brf', 'medlem', 'förening', 'bostadsrättsförening'],
    a: 'När man köper en bostadsrätt måste köparen godkännas som medlem i bostadsrättsföreningen. Köparen skickar en medlemsansökan till föreningens styrelse, som brukar svara inom några veckor. Därför brukar avtalet innehålla ett villkor om att köpet gäller under förutsättning att köparen godkänns.',
  },
  {
    q: 'Vad är ett tillträde?',
    keywords: ['tillträde', 'nycklar', 'flytt'],
    a: 'Tillträdesdagen är dagen då köparen betalar resten av köpeskillingen och får nycklarna. Från den dagen är det köparen som äger och ansvarar för bostaden. Vi guidar er genom en checklista så att inget glöms bort.',
  },
  {
    q: 'Behöver jag en mäklare?',
    keywords: ['mäklare', 'arvode', 'själv'],
    a: 'Nej, som privatperson får du sälja din bostad själv. Det som en mäklare normalt håller ihop – annons, visningar, budgivning, avtal och tillträde – guidar vi dig genom steg för steg. Vill du ha extra trygghet kan du välja Sälj själv Plus med juridisk kontroll av dokumenten.',
  },
]

interface Msg {
  from: 'user' | 'bot'
  text: string
}

function answer(question: string): string {
  const q = question.toLowerCase()
  const hit = QA.find((x) => x.keywords.some((k) => q.includes(k)))
  return (
    hit?.a ??
    'Bra fråga! I den här prototypen har jag bara förskrivna svar, men i den riktiga tjänsten svarar jag på det mesta som rör din bostadsaffär. Prova gärna någon av frågorna nedan.'
  )
}

export function Assistant() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: 'bot', text: `Hej! Jag är ${BRAND.name}s assistent. Fråga mig om allt som rör din bostadsaffär.` },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [msgs, typing])

  const ask = (text: string) => {
    if (!text.trim() || typing) return
    setMsgs((m) => [...m, { from: 'user', text }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setMsgs((m) => [...m, { from: 'bot', text: answer(text) }])
      setTyping(false)
    }, 900)
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-petrol-800 py-3 pl-4 pr-5 text-sm font-semibold text-white shadow-lift transition hover:bg-petrol-900 sm:bottom-6 sm:right-6"
        >
          <MessageCircle className="h-5 w-5" />
          Fråga {BRAND.name}
        </button>
      )}
      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex h-[min(34rem,calc(100vh-6rem))] flex-col overflow-hidden rounded-2xl border border-sand-300 bg-white shadow-lift animate-rise sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96">
          <div className="flex items-center justify-between bg-petrol-800 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-300 text-petrol-900">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">Fråga {BRAND.name}</p>
                <p className="text-[11px] text-petrol-200">AI-assistent · mockade svar</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-white/10" aria-label="Stäng assistenten">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-sand-50 px-4 py-4">
            {msgs.map((m, i) => (
              <div key={i} className={cn('flex', m.from === 'user' ? 'justify-end' : 'justify-start')}>
                <p className={cn('max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed', m.from === 'user' ? 'rounded-br-md bg-petrol-700 text-white' : 'rounded-bl-md bg-white text-ink shadow-card')}>{m.text}</p>
              </div>
            ))}
            {typing && (
              <div className="flex gap-1 rounded-2xl bg-white px-4 py-3 shadow-card w-fit">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-ink-faint" style={{ animationDelay: `${i * 120}ms` }} />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div className="border-t border-sand-200 bg-white px-3 pb-3 pt-2">
            <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
              {QA.slice(0, 4).map((x) => (
                <button key={x.q} onClick={() => ask(x.q)} className="shrink-0 rounded-full border border-sand-300 px-3 py-1.5 text-xs text-ink-soft hover:border-petrol-300 hover:text-petrol-700">
                  {x.q}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                ask(input)
              }}
              className="flex gap-2"
            >
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Skriv din fråga…" className="h-11 flex-1 rounded-xl border border-sand-300 px-3 text-sm focus:border-petrol-500 focus:outline-none focus:ring-4 focus:ring-petrol-100" />
              <button type="submit" className="flex h-11 w-11 items-center justify-center rounded-xl bg-petrol-700 text-white hover:bg-petrol-800" aria-label="Skicka">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
