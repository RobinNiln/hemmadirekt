import { useState } from 'react'
import { Check, Landmark, MessageSquare, Users } from 'lucide-react'
import { Badge, Button, Card, PageHeader, cn } from '../../components/ui'
import { VerifiedTag } from '../../components/Trust'
import { DemoPanel } from '../../components/DemoPanel'
import { useSale } from '../../state/SaleContext'
import { EmptyPanel } from './DashboardLayout'

type Filter = 'alla' | 'lan' | 'mycket'

export default function Interested() {
  const { state, sortedBids } = useSale()
  const [filter, setFilter] = useState<Filter>('alla')
  const [contacted, setContacted] = useState<string[]>([])

  const list = state.interested.filter((i) => (filter === 'lan' ? i.loanPromise : filter === 'mycket' ? i.level === 'Mycket intresserad' : true))

  if (!state.interested.length) {
    return (
      <div className="space-y-6">
        <PageHeader title="Intressenter" />
        <EmptyPanel icon={<Users className="h-7 w-7" />} title="Inga intressenter än" text="När någon bokar visning, sparar bostaden eller kontaktar dig hamnar de här – med verifiering och lånelöfte synligt." />
        <DemoPanel />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Intressenter" subtitle="Alla som visat intresse för bostaden. Verifierade köpare har legitimerat sig med BankID." />
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['alla', `Alla (${state.interested.length})`],
            ['mycket', 'Mycket intresserade'],
            ['lan', 'Har lånelöfte'],
          ] as [Filter, string][]
        ).map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} className={cn('rounded-full px-4 py-2 text-sm font-semibold transition', filter === k ? 'bg-petrol-700 text-white' : 'bg-white text-ink-soft ring-1 ring-sand-300 hover:ring-ink-faint')}>
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((i) => {
          const bids = sortedBids.filter((b) => b.bidderId === i.id)
          const top = bids[bids.length - 1]
          const initials = i.name.split(' ').map((s) => s[0]).join('')
          return (
            <Card key={i.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-petrol-100 font-bold text-petrol-800">{initials}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold">{i.name}</p>
                  <VerifiedTag />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone={i.level === 'Mycket intresserad' ? 'green' : i.level === 'Vill se igen' ? 'blue' : 'neutral'}>{i.level}</Badge>
                    {i.loanPromise && (
                      <Badge tone="green" icon={<Landmark className="h-3 w-3" />}>
                        Har lånelöfte
                      </Badge>
                    )}
                    {i.attendedViewing && <Badge>Var på visning</Badge>}
                    {top && <Badge tone="petrol">Bud: {new Intl.NumberFormat('sv-SE').format(top.amount)} kr</Badge>}
                  </div>
                  <p className="mt-3 text-sm text-ink-muted">{i.note}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end border-t border-sand-200 pt-4">
                {contacted.includes(i.id) ? (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-petrol-700">
                    <Check className="h-4 w-4" /> Meddelande skickat
                  </span>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => setContacted([...contacted, i.id])}>
                    <MessageSquare className="h-4 w-4" /> Skicka meddelande
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
