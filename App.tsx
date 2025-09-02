
import React, { useContext } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/pages/HomePage';
import PricingPage from './components/pages/PricingPage';
import AIAssistantPage from './components/AIAssistant/AIAssistantPage';
import IntegrationsPage from './components/Integrations/IntegrationsPage';
import WireframePage from './components/Wireframe/WireframePage';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';
import { UserContext } from './contexts/UserContext';
import SecurityDashboardPage from './components/Security/SecurityDashboardPage';
import PerformanceDashboardPage from './components/Performance/PerformanceDashboardPage';
import NewsletterDashboardPage from './components/Newsletter/NewsletterDashboardPage';
import CRMDashboardPage from './components/CRM/CRMDashboardPage';
import AnalyticsDashboardPage from './components/Analytics/AnalyticsDashboardPage';
import AccountPage from './components/Account/AccountPage';
import SocialDashboardPage from './components/Social/SocialDashboardPage';
import VideoDashboardPage from './components/Video/VideoDashboardPage';
import RedirectToDashboard from './components/RedirectToDashboard';
import DashboardPage from './components/Dashboard/DashboardPage';
import TermsOfServicePage from './components/pages/TermsOfServicePage';
import PrivacyPolicyPage from './components/pages/PrivacyPolicyPage';
import DocumentationPage from './components/pages/DocumentationPage';
import ContactPage from './components/pages/ContactPage';
import PromotionDashboardPage from './components/Promotion/PromotionDashboardPage';
import GrowthDashboardPage from './components/Growth/GrowthDashboardPage';
import ScanDashboardPage from './components/Security/ScanDashboardPage';
import FirewallPage from './components/Security/FirewallPage';
import BlockedIPsPage from './components/Security/BlockedIPsPage';
import ActivityLogPage from './components/Security/ActivityLogPage';
import SecuritySettingsPage from './components/Security/SecuritySettingsPage';
import MobileDashboardPage from './components/Mobile/MobileDashboardPage';
import BackupDashboardPage from './components/Backup/BackupDashboardPage';
import SearchDashboardPage from './components/Search/SearchDashboardPage';
import TeamPage from './components/Team/TeamPage';
import './assets/css/analytics.css';

function App(): React.ReactNode {
  const { isAuthModalOpen, closeAuthModal } = useContext(UserContext);

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen font-sans">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<RedirectToDashboard />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute paidOnly={false}>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route 
              path="/security" 
              element={
                <ProtectedRoute>
                  <SecurityDashboardPage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/security/scan" 
              element={
                <ProtectedRoute>
                  <ScanDashboardPage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/security/firewall" 
              element={
                <ProtectedRoute>
                  <FirewallPage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/security/blocked-ips" 
              element={
                <ProtectedRoute>
                  <BlockedIPsPage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/security/activity-log" 
              element={
                <ProtectedRoute>
                  <ActivityLogPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/security/settings" 
              element={
                <ProtectedRoute>
                  <SecuritySettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/performance" 
              element={
                <ProtectedRoute>
                  <PerformanceDashboardPage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/newsletter" 
              element={
                <ProtectedRoute>
                  <NewsletterDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/crm" 
              element={
                <ProtectedRoute>
                  <CRMDashboardPage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AnalyticsDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/wireframe" 
              element={
                <ProtectedRoute>
                  <WireframePage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/promotion" 
              element={
                <ProtectedRoute>
                  <PromotionDashboardPage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/growth" 
              element={
                <ProtectedRoute>
                  <GrowthDashboardPage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/backup" 
              element={
                <ProtectedRoute>
                  <BackupDashboardPage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/search" 
              element={
                <ProtectedRoute>
                  <SearchDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/account" 
              element={
                <ProtectedRoute paidOnly={false}>
                  <AccountPage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/team" 
              element={
                <ProtectedRoute allowedPlans={['Business', 'Enterprise']}>
                  <TeamPage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/social" 
              element={
                <ProtectedRoute>
                  <SocialDashboardPage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/video" 
              element={
                <ProtectedRoute>
                  <VideoDashboardPage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/mobile" 
              element={
                <ProtectedRoute>
                  <MobileDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
        <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      </div>
    </HashRouter>
  );
}

export default App;
