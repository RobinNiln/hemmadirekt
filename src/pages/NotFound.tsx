import { Button, Container } from '../components/ui'

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-semibold text-petrol-600">404</p>
      <h1 className="mt-2 text-3xl font-bold">Sidan finns inte</h1>
      <p className="mt-2 text-ink-muted">Länken kan vara fel, eller så har bostaden tagits bort.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button to="/">Till startsidan</Button>
        <Button to="/kopa" variant="secondary">
          Se bostäder
        </Button>
      </div>
    </Container>
  )
}
