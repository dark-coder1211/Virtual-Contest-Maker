import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ContestCreator from './components/ContestCreator';
import ContestArena from './components/ContestArena';
import ProblemBank from './components/ProblemBank';
import ContestHistory from './components/ContestHistory';
import AuthModal from './components/AuthModal';
import HandleModal from './components/HandleModal';
import { authApi, contestApi } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('arena');
  const [currentParticipation, setCurrentParticipation] = useState(null);
  const [isCreatingContest, setIsCreatingContest] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [handleModalOpen, setHandleModalOpen] = useState(false);

  // Initialize user
  useEffect(() => {
    const token = localStorage.getItem('vcm_token');
    if (token) {
      authApi.getMe()
        .then((userData) => setUser(userData))
        .catch(() => {
          authApi.logout();
          setUser(null);
        });
    }
  }, []);

  const handleStartContest = async (contestParams) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setIsCreatingContest(true);
    try {
      const res = await contestApi.createContest(contestParams);
      if (res.participation_id) {
        const partData = await contestApi.getParticipation(res.participation_id);
        setCurrentParticipation(partData);
      }
    } catch (err) {
      console.error('Failed to create contest:', err);
      alert('Failed to generate contest. Please try again.');
    } finally {
      setIsCreatingContest(false);
    }
  };

  const handleSyncSubmissions = async () => {
    if (!currentParticipation) return;
    setIsSyncing(true);
    try {
      const res = await contestApi.syncSubmissions(currentParticipation.id);
      if (res?.participation) {
        setCurrentParticipation(res.participation);
      }
      return res;
    } catch (err) {
      console.error('Sync failed:', err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFinishContest = async () => {
    if (!currentParticipation) return;
    try {
      const updated = await contestApi.finishContest(currentParticipation.id);
      setCurrentParticipation(updated);
    } catch (err) {
      console.error('Failed to finish contest:', err);
    }
  };

  const handleManualMark = async (contestProblemId) => {
    if (!currentParticipation) return;
    try {
      const updated = await contestApi.manualMarkSolved(currentParticipation.id, contestProblemId);
      setCurrentParticipation(updated);
    } catch (err) {
      console.error('Failed to toggle solve status:', err);
    }
  };

  const handleResumeContest = (participation) => {
    setCurrentParticipation(participation);
    setActiveTab('arena');
  };

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    setCurrentParticipation(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenHandles={() => setHandleModalOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'arena') {
            // keep currentParticipation in background if needed
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'arena' && (
          currentParticipation ? (
            <ContestArena
              participation={currentParticipation}
              onSync={handleSyncSubmissions}
              onFinish={handleFinishContest}
              onManualMark={handleManualMark}
              onExit={() => setCurrentParticipation(null)}
              isSyncing={isSyncing}
            />
          ) : (
            <ContestCreator
              onStartContest={handleStartContest}
              isCreating={isCreatingContest}
            />
          )
        )}

        {activeTab === 'problems' && (
          <ProblemBank />
        )}

        {activeTab === 'history' && (
          <ContestHistory
            onResumeContest={handleResumeContest}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600">
        <p>
          Virtual Contest Maker • Combines Codeforces, CodeChef & AtCoder into unified Codeforces-equivalent contests.
        </p>
      </footer>

      {/* Modals */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={(userData) => setUser(userData)}
        />
      )}

      {handleModalOpen && (
        <HandleModal
          user={user}
          onClose={() => setHandleModalOpen(false)}
          onUpdated={(userData) => setUser(userData)}
        />
      )}

    </div>
  );
}
