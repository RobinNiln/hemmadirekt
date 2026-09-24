import { useEffect, useState } from 'react'
import { CheckCircle2, Smartphone } from 'lucide-react'
import { Button, Modal, Spinner } from './ui'

// Simulerad BankID-legitimering. Inga riktiga anrop görs.
export function BankIdModal({
  open,
  onClose,
  onDone,
  title = 'Legitimera dig med BankID',
  action = 'legitimera dig',
  doneText = 'Klart! Du är legitimerad.',
}: {
  open: boolean
  onClose: () => void
  onDone: () => void
  title?: string
  action?: string
  doneText?: string
}) {
  const [phase, setPhase] = useState<'waiting' | 'done'>('waiting')

  useEffect(() => {
    if (!open) return
    setPhase('waiting')
    const t1 = setTimeout(() => setPhase('done'), 2200)
    return () => clearTimeout(t1)
  }, [open])

  useEffect(() => {
    if (phase !== 'done' || !open) return
    const t = setTimeout(() => onDone(), 900)
    return () => clearTimeout(t)
  }, [phase, open, onDone])

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col items-center py-4 text-center">
        {phase === 'waiting' ? (
          <>
            <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-petrol-50">
              <Smartphone className="h-9 w-9 text-petrol-700" />
              <Spinner className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-white p-1 text-petrol-600 shadow-card" />
            </div>
            <p className="text-lg font-semibold">Öppna BankID-appen</p>
            <p className="mt-1 max-w-xs text-sm text-ink-muted">Starta BankID på din telefon och {action}.</p>
            <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">Simulerat – ingen riktig BankID-koppling i prototypen.</p>
          </>
        ) : (
          <div className="animate-pop">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-petrol-600" />
            <p className="text-lg font-semibold">{doneText}</p>
          </div>
        )}
      </div>
      {phase === 'waiting' && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Avbryt
          </Button>
        </div>
      )}
    </Modal>
  )
}
