import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Home, KeyRound, PlayCircle, Smartphone } from 'lucide-react'
import { Button, Card, Container } from '../components/ui'
import { BankIdModal } from '../components/BankIdModal'
import { useSale } from '../state/SaleContext'
import { BRAND } from '../config/brand'

export default function Login() {
  const { state, dispatch } = useSale()
  const navigate = useNavigate()
  const [bankId, setBankId] = useState(false)
  const loggedIn = state.loggedIn

  return (
    <Container className="flex justify-center py-16">
      <div className="w-full max-w-md">
        {!loggedIn ? (
          <Card className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-petrol-50">
              <KeyRound className="h-7 w-7 text-petrol-700" />
            </div>
            <h1 className="mt-5 text-2xl font-bold">Logga in på {BRAND.name}</h1>
            <p className="mt-2 text-ink-muted">Vi använder BankID så att alla i affären vet vem de gör affärer med.</p>
            <Button full size="lg" className="mt-8" onClick={() => setBankId(true)}>
              <Smartphone className="h-5 w-5" /> Logga in med BankID
            </Button>
            <p className="mt-4 text-xs text-ink-faint">Simulerad inloggning – ingen riktig BankID-koppling i prototypen.</p>
          </Card>
        ) : (
          <Card className="p-8 animate-pop">
            <p className="text-sm text-ink-muted">Inloggad som</p>
            <h1 className="text-2xl font-bold">{state.sellerName}</h1>
            <p className="mt-6 font-semibold">Vart vill du gå?</p>
            <div className="mt-3 space-y-2">
              {state.started ? (
                <Button full size="lg" to="/min-forsaljning">
                  <Home className="h-5 w-5" /> Min försäljning <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button full size="lg" to="/salj/start">
                    <Home className="h-5 w-5" /> Starta en försäljning
                  </Button>
                  <Button
                    full
                    size="lg"
                    variant="secondary"
                    onClick={() => {
                      dispatch({ type: 'LOAD_DEMO' })
                      navigate('/min-forsaljning')
                    }}
                  >
                    <PlayCircle className="h-5 w-5" /> Testa en pågående försäljning
                  </Button>
                </>
              )}
              <Button full variant="ghost" to="/kopare">
                Köparens vy (demo)
              </Button>
            </div>
            <button className="mt-6 text-sm text-ink-muted hover:text-ink" onClick={() => dispatch({ type: 'LOGOUT' })}>
              Logga ut
            </button>
          </Card>
        )}
      </div>
      <BankIdModal
        open={bankId}
        onClose={() => setBankId(false)}
        onDone={() => {
          setBankId(false)
          dispatch({ type: 'LOGIN' })
        }}
        action="logga in"
        doneText="Du är inloggad."
      />
    </Container>
  )
}
