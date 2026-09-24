import { FastForward, RotateCcw, Wand2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSale } from '../state/SaleContext'
import { Button, Spinner } from './ui'

// Demoläge: låter dig "spola fram" händelser som annars tar dagar i verkligheten.
export function DemoPanel() {
  const { state, dispatch, simulateBidding, biddingRunning } = useSale()
  const navigate = useNavigate()
  if (state.mode === 'direct') return null

  const canMarket = state.published && !state.marketSimulated
  const canBid = state.published && state.bids.length === 0 && !biddingRunning && !state.acceptedBidId

  return (
    <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-5">
      <div className="flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-amber-700" />
        <p className="text-sm font-bold text-amber-900">Demoläge</p>
      </div>
      <p className="mt-1 text-sm text-amber-900/80">Spola fram händelser som annars tar dagar – så att du kan klicka dig igenom hela affären.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {!state.published && (
          <Button size="sm" variant="secondary" to="/salj/start">
            Slutför och publicera annonsen först
          </Button>
        )}
        {state.published && (
          <Button size="sm" variant="secondary" disabled={!canMarket} onClick={() => dispatch({ type: 'SIMULATE_MARKET' })}>
            <FastForward className="h-4 w-4" /> {state.marketSimulated ? 'Visning genomförd ✓' : 'Simulera en vecka: visning & intressenter'}
          </Button>
        )}
        {state.published && (
          <Button
            size="sm"
            variant="secondary"
            disabled={!canBid}
            onClick={() => {
              if (!state.marketSimulated) dispatch({ type: 'SIMULATE_MARKET' })
              simulateBidding()
              navigate('/min-forsaljning/budgivning')
            }}
          >
            {biddingRunning ? <Spinner className="h-4 w-4" /> : <FastForward className="h-4 w-4" />}
            {biddingRunning ? 'Bud kommer in…' : state.bids.length ? 'Bud inkomna ✓' : 'Simulera budgivning'}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            dispatch({ type: 'LOAD_DEMO' })
            navigate('/min-forsaljning')
          }}
        >
          <RotateCcw className="h-4 w-4" /> Återställ demon
        </Button>
      </div>
    </div>
  )
}
