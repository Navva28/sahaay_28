import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { RequesterDashboard } from './pages/RequesterDashboard';
import { VolunteerDashboard } from './pages/VolunteerDashboard';
import { CreateRequestPage } from './pages/CreateRequestPage';
import { RequestDetailPage } from './pages/RequestDetailPage';
import { LoginPage } from './pages/LoginPage';
import { NexconnStatusPage } from './pages/NexconnStatusPage';
import { AssistanceRequest } from './types';
import { useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [activeRequest, setActiveRequest] = useState<AssistanceRequest | null>(null);

  const handleOpenChat = (request: AssistanceRequest) => {
    setActiveRequest(request);
    setCurrentTab('request-detail');
  };

  const handleRequestCreated = (requestId: string) => {
    // Navigate to dashboard
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage setCurrentTab={setCurrentTab} />
        )}

        {currentTab === 'dashboard' && (
          <>
            {currentUser?.role === 'requester' ? (
              <RequesterDashboard
                setCurrentTab={setCurrentTab}
                onOpenChat={handleOpenChat}
              />
            ) : (
              <VolunteerDashboard
                setCurrentTab={setCurrentTab}
                onOpenChat={handleOpenChat}
              />
            )}
          </>
        )}

        {currentTab === 'create-request' && (
          <CreateRequestPage
            setCurrentTab={setCurrentTab}
            onRequestCreated={handleRequestCreated}
          />
        )}

        {currentTab === 'request-detail' && activeRequest && (
          <RequestDetailPage
            request={activeRequest}
            setCurrentTab={setCurrentTab}
            onRequestUpdated={(updated) => setActiveRequest(updated)}
          />
        )}

        {currentTab === 'login' && (
          <LoginPage setCurrentTab={setCurrentTab} />
        )}

        {currentTab === 'nexconn-status' && (
          <NexconnStatusPage />
        )}
      </main>

      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <AppContent />
      </AccessibilityProvider>
    </AuthProvider>
  );
}

export default App;
