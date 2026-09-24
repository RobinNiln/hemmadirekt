import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import ListingPage from './pages/ListingPage'
import Sell from './pages/Sell'
import HowItWorks from './pages/HowItWorks'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import SellFlow from './pages/SellFlow'
import DirectDeal from './pages/DirectDeal'
import BuyerView from './pages/BuyerView'
import NotFound from './pages/NotFound'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import Overview from './pages/dashboard/Overview'
import Interested from './pages/dashboard/Interested'
import Bidding from './pages/dashboard/Bidding'
import ContractFlow from './pages/dashboard/ContractFlow'
import Documents from './pages/dashboard/Documents'
import Closing from './pages/dashboard/Closing'
import MatchingBuyers from './pages/dashboard/MatchingBuyers'
import BuyerOnboarding from './pages/buyer/BuyerOnboarding'
import BuyerDashboard from './pages/buyer/BuyerDashboard'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="kopa" element={<Search />} />
        <Route path="bostad/:id" element={<ListingPage />} />
        <Route path="salja" element={<Sell />} />
        <Route path="sa-fungerar-det" element={<HowItWorks />} />
        <Route path="pris" element={<Pricing />} />
        <Route path="logga-in" element={<Login />} />
        <Route path="salj/start" element={<SellFlow />} />
        <Route path="genomfor-affaren" element={<DirectDeal />} />
        <Route path="kopare" element={<BuyerView />} />
        <Route path="hitta-bostad" element={<BuyerOnboarding />} />
        <Route path="mina-matchningar" element={<BuyerDashboard />} />
        <Route path="min-forsaljning" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="kopare" element={<MatchingBuyers />} />
          <Route path="intressenter" element={<Interested />} />
          <Route path="budgivning" element={<Bidding />} />
          <Route path="avtal" element={<ContractFlow />} />
          <Route path="dokument" element={<Documents />} />
          <Route path="tilltrade" element={<Closing />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
