import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Home, LayoutDashboard, LogIn } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { EmailAuth } from './components/EmailAuth';
import { HeaderAuth } from './components/HeaderAuth';
import { Dashboard } from './components/Dashboard';
import { ModernVotePage } from './components/ModernVotePage';
import { HomePage } from './pages/HomePage';
import { AuthCallback } from './pages/AuthCallback';
import { supabase } from './lib/supabase';
import { TestInput } from './TestInput';

function App() {
  const { checkUser, user } = useAuthStore();
  const [showTest, setShowTest] = useState(false);
  
  // テスト用: Tキーを押すとテスト画面を表示
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'T' && e.shiftKey) {
        setShowTest(!showTest);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showTest]);

  useEffect(() => {
    checkUser();
    
    // Supabase認証状態のリスナーを設定
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkUser();
      } else if (event === 'SIGNED_OUT') {
        await checkUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkUser]);

  return (
    <Router>
        <div className="min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-red-50">
          {showTest && <TestInput />}
          <Toaster position="top-center" />
          
          {/* Navigation Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-8">
                  <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                    <span className="text-2xl">🎯</span>
                    NFT投票システム
                  </Link>
                  
                  <nav className="hidden md:flex items-center gap-6">
                    <Link 
                      to="/" 
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Home className="h-4 w-4" />
                      ホーム
                    </Link>
                    
                    {user && (
                      <Link 
                        to="/dashboard" 
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        ダッシュボード
                      </Link>
                    )}
                  </nav>
                </div>
                
                <div className="flex items-center gap-4">
                  <HeaderAuth />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/vote/:sessionId" element={<ModernVotePage />} />
              <Route 
                path="/dashboard" 
                element={
                  user ? <Dashboard /> : <Navigate to="/" replace />
                } 
              />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="py-6 px-4 text-center text-slate-500 text-sm bg-white border-t">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span>🎯</span>
              <p>NFT保有者限定投票システム &copy; {new Date().getFullYear()}</p>
              <span>🛡️</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs">
              <span>Powered by Cardano</span>
              <span>•</span>
              <span>Supabase</span>
              <span>•</span>
              <span>メール認証対応</span>
            </div>
          </footer>
        </div>
      </Router>
  );
}

export default App;