import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header, PrototypeBar } from './Header'
import { Footer } from './Footer'
import { Assistant } from './Assistant'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <PrototypeBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Assistant />
    </div>
  )
}
