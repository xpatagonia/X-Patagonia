import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import HowItWorks from './components/HowItWorks';
import EcosystemGrid from './components/EcosystemGrid';
import Projects from './components/Projects';
import TripleImpact from './components/TripleImpact';
import Alliances from './components/Alliances';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import CookieBanner from './components/CookieBanner';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Pricing from './pages/Pricing';
import NewsMagazine from './components/NewsMagazine';
import CompanyProfile from './pages/CompanyProfile';
import Marketplace from './pages/Marketplace';
import AppStore from './pages/AppStore';
import LogisticsModule from './pages/LogisticsModule';

import WarehousingModule from './pages/WarehousingModule';
import EcommerceModule from './pages/EcommerceModule';
import AdminDashboard from './pages/AdminDashboard';
import Inbox from './pages/Inbox';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Insights from './pages/Insights';

function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <HowItWorks />
      <NewsMagazine />
      <EcosystemGrid />
      <Projects />
      <Alliances />
      <TripleImpact />
      <Contact />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen text-slate-800 dark:text-slate-100 bg-white dark:bg-[#110E17] font-sans selection:bg-purple-500 selection:text-white flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/servicios" element={<Services />} />
            <Route path="/planes" element={<Pricing />} />
            <Route path="/perfil-empresa" element={<CompanyProfile />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/apps" element={<AppStore />} />
            <Route path="/logistica" element={<LogisticsModule />} />
            <Route path="/warehousing" element={<WarehousingModule />} />
            <Route path="/ecommerce" element={<EcommerceModule />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Routes>
        </main>
        <Footer />
        <BackToTop />
        <CookieBanner />
      </div>
    </Router>
  );
}


