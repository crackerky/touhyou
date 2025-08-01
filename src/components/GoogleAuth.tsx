import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/Button';

export function GoogleAuth() {
  const { user, isLoading, signInWithGoogle, signOut } = useAuthStore();

  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-4 bg-white rounded-lg p-3 shadow-sm border border-gray-200"
      >
        <div className="flex items-center gap-3">
          {user.avatar_url && (
            <img 
              src={user.avatar_url} 
              alt={user.display_name || 'User'} 
              className="w-10 h-10 rounded-full"
            />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {user.display_name || user.email}
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
          <LogOut className="h-4 w-4 mr-2" />
          ログアウト
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-6 shadow-lg border border-gray-200"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        ログインが必要です
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        投票に参加するにはGoogleアカウントでログインしてください
      </p>
      <Button
        onClick={signInWithGoogle}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        <svg 
          className="w-5 h-5 mr-2" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Googleでログイン
      </Button>
    </motion.div>
  );
}