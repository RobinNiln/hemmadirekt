import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { SaleProvider } from './state/SaleContext'
import './index.css'

// HashRouter (#/adress) används för att alla sidor ska fungera på GitHub Pages
// även när man laddar om sidan eller delar en länk.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <SaleProvider>
        <App />
      </SaleProvider>
    </HashRouter>
  </StrictMode>,
)
