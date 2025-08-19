import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, LogIn, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useVotingSessionStore } from '../store/votingSessionStore';
import { Button } from './ui/Button';
import { EmailAuth } from './EmailAuth';

export function HeaderAuth() {
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuthStore();
  const { sessions, fetchSessions } = useVotingSessionStore();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // セッション情報を取得
    fetchSessions();
  }, [fetchSessions]);

  const handleLoginSuccess = async () => {
    setShowLoginModal(false);
    
    // セッション情報を最新にして遷移先を決定
    await fetchSessions();
    
    // 短時間待ってからセッション情報をチェック
    setTimeout(() => {
      const activeSessions = sessions.filter(s => s.is_active);
      if (activeSessions.length > 0) {
        navigate(`/vote/${activeSessions[0].id}`);
      } else {
        // アクティブなセッションがない場合はダッシュボードに遷移
        navigate('/dashboard');
      }
    }, 500);
  };

  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3"
      >
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {user.display_name || user.email?.split('@')[0]}
            </span>
            {user.wallet_address && (
              <span className="text-xs text-gray-500">
                {user.wallet_address.slice(0, 8)}...{user.wallet_address.slice(-6)}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          disabled={isLoading}
        >
          <LogOut className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">ログアウト</span>
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowLoginModal(true)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <LogIn className="h-4 w-4 mr-2" />
        ログイン
      </Button>

      {/* Login Modal */}
      {showLoginModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
          onClick={(e) => {
            // モーダル背景をクリックしたときのみ閉じる
            if (e.target === e.currentTarget) {
              setShowLoginModal(false);
            }
          }}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-md w-full my-8"
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center z-10 hover:bg-gray-100"
              >
                ✕
              </button>
              <div onClick={(e) => e.stopPropagation()}>
                <EmailAuth onSuccess={handleLoginSuccess} />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}