import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { WebsiteAnalysis } from './pages/WebsiteAnalysis';
import { ScanHistory } from './pages/ScanHistory';
import { ThreatIntelligence } from './pages/ThreatIntelligence';
import { Reports } from './pages/Reports';
import { Statistics } from './pages/Statistics';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { UserReports } from './pages/UserReports';
import { EmailAnalyzer } from './pages/EmailAnalyzer';

function AppContent() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analysis" element={<WebsiteAnalysis />} />
        <Route path="/history" element={<ScanHistory />} />
        <Route path="/intelligence" element={<ThreatIntelligence />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/user-reports" element={<UserReports />} />
        <Route path="/email-analyzer" element={<EmailAnalyzer />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </AuthProvider>
    </AppProvider>
  );
}
