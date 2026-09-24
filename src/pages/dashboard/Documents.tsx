import { useState } from 'react'
import { Check, Circle, Download, Eye, FileText, Lock } from 'lucide-react'
import { Badge, Button, Card, Modal, PageHeader, cn } from '../../components/ui'
import { ContractDocument } from '../../components/ContractDocument'
import { DemoNotice } from '../../components/Trust'
import { useSale } from '../../state/SaleContext'
import { isSigned } from '../../state/progress'
import { contractData, documentText, downloadText, type DocId } from '../../lib/documents'

export default function Documents() {
  const { state, acceptedBid } = useSale()
  const [open, setOpen] = useState<DocId | null>(null)
  const signed = isSigned(state)

  const docs: { id: DocId; name: string; ready: boolean; pending: string; note?: string }[] = [
    { id: 'objekt', name: 'Objektsinformation', ready: state.mode === 'direct' || state.published, pending: 'Skapas när annonsen publiceras' },
    { id: 'budhistorik', name: 'Budhistorik', ready: state.bids.length > 0, pending: 'Skapas när första budet kommer in' },
    { id: 'avtal', name: 'Överlåtelseavtal', ready: signed, pending: state.acceptedBidId ? 'Väntar på signering' : 'Skapas när du accepterat ett bud', note: signed ? 'Signerat av båda parter' : undefined },
    { id: 'medlem', name: 'Medlemsansökan BRF', ready: state.closing.brfApproved, pending: signed ? 'Väntar på föreningens beslut' : 'Skickas efter signering' },
    { id: 'handpenning', name: 'Handpenningsunderlag', ready: state.closing.depositRegistered, pending: signed ? 'Väntar på betalning' : 'Skapas efter signering' },
    { id: 'tilltrade', name: 'Tillträdesdokument', ready: state.closing.completed, pending: 'Skapas på tillträdesdagen' },
  ]
  const readyCount = docs.filter((d) => d.ready).length
  const current = docs.find((d) => d.id === open)
  const filename = (d: { name: string }) => `${d.name.replace(/\s+/g, '-').toLowerCase()}-DEMO.txt`

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokument"
        subtitle="Alla dokument i affären samlas och sparas här. Du och köparen ser samma version."
        actions={<Badge tone="green">{readyCount} av {docs.length} klara</Badge>}
      />
      <Card className="divide-y divide-sand-200">
        {docs.map((d) => (
          <div key={d.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', d.ready ? 'bg-mint-100 text-petrol-700' : 'bg-sand-200 text-ink-faint')}>
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <p className="flex items-center gap-2 font-semibold">
                  {d.ready ? <Check className="h-4 w-4 text-petrol-600" strokeWidth={3} /> : <Circle className="h-4 w-4 text-sand-300" />}
                  {d.name}
                </p>
                <p className="text-sm text-ink-muted">{d.ready ? d.note ?? 'Klart och sparat' : d.pending}</p>
              </div>
            </div>
            <div className="flex gap-2 sm:shrink-0">
              <Button variant="secondary" size="sm" disabled={!d.ready} onClick={() => setOpen(d.id)}>
                {d.ready ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />} Visa
              </Button>
              <Button variant="ghost" size="sm" disabled={!d.ready} onClick={() => downloadText(filename(d), documentText(d.id, state, acceptedBid))}>
                <Download className="h-4 w-4" /> Ladda ner
              </Button>
            </div>
          </div>
        ))}
      </Card>
      <DemoNotice>Dokumenten är exempel som genereras av prototypen och laddas ner som textfiler märkta DEMO. De är inte juridiskt material.</DemoNotice>

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={current?.name}
        size="lg"
        footer={
          current && (
            <Button variant="secondary" onClick={() => downloadText(filename(current), documentText(current.id, state, acceptedBid))}>
              <Download className="h-4 w-4" /> Ladda ner
            </Button>
          )
        }
      >
        {open === 'avtal' ? (
          <ContractDocument data={contractData(state, acceptedBid)} signed={{ seller: state.contract.signedBySeller, buyer: state.contract.signedByBuyer }} />
        ) : open ? (
          <pre className="whitespace-pre-wrap rounded-xl bg-sand-50 p-5 font-mono text-[13px] leading-relaxed text-ink-soft">{documentText(open, state, acceptedBid)}</pre>
        ) : null}
      </Modal>
    </div>
  )
}
