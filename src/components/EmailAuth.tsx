import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, LogIn, LogOut, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { toast } from 'react-hot-toast';

interface EmailAuthProps {
  onSuccess?: () => void;
}

export function EmailAuth({ onSuccess }: EmailAuthProps = {}) {
  const { user, isLoading, signOut, signInWithEmail, signUpWithEmail, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset'>('signin');

  // デバッグ用ログ
  console.log('EmailAuth render:', { email, password, isLoading, error, authMode });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('メールアドレスを入力してください');
      return;
    }

    if (authMode === 'reset') {
      // パスワードリセット
      toast.info('パスワードリセット機能は準備中です');
      return;
    }

    if (!password) {
      toast.error('パスワードを入力してください');
      return;
    }

    try {
      if (authMode === 'signin') {
        await signInWithEmail(email, password);
        toast.success('ログインしました');
        if (onSuccess) onSuccess();
      } else if (authMode === 'signup') {
        await signUpWithEmail(email, password);
        toast.success('アカウントを作成しました');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      // Error handling is done in the store
    }
  };

  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-4 bg-white rounded-lg p-3 shadow-sm border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-4 w-4 text-blue-600" />
          </div>
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
      className="w-full max-w-md"
    >
      <Card className="p-6 relative z-10">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {authMode === 'signin' && 'ログイン'}
            {authMode === 'signup' && '新規登録'}
            {authMode === 'reset' && 'パスワードリセット'}
          </h3>
          <p className="text-sm text-gray-600">
            {authMode === 'signin' && '投票に参加するためにログインしてください'}
            {authMode === 'signup' && 'アカウントを作成して投票に参加'}
            {authMode === 'reset' && 'パスワードリセット用のメールを送信します'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                console.log('Email input change:', e.target.value);
                setEmail(e.target.value);
              }}
              onFocus={() => console.log('Email input focused')}
              onBlur={() => console.log('Email input blurred')}
              onClick={() => console.log('Email input clicked')}
              placeholder="example@email.com"
              required
              disabled={isLoading}
              autoFocus
              tabIndex={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {authMode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    console.log('Password input change:', e.target.value);
                    setPassword(e.target.value);
                  }}
                  onFocus={() => console.log('Password input focused')}
                  onBlur={() => console.log('Password input blurred')}
                  onClick={() => console.log('Password input clicked')}
                  placeholder="パスワードを入力"
                  required
                  disabled={isLoading}
                  tabIndex={2}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Mail className="h-4 w-4 mr-2" />
            {isLoading ? (
              '処理中...'
            ) : (
              <>
                {authMode === 'signin' && 'ログイン'}
                {authMode === 'signup' && 'アカウント作成'}
                {authMode === 'reset' && 'リセットメール送信'}
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {authMode === 'signin' && (
            <>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                アカウントをお持ちでない方はこちら
              </button>
              <br />
              <button
                type="button"
                onClick={() => setAuthMode('reset')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                パスワードを忘れた方はこちら
              </button>
            </>
          )}
          
          {authMode === 'signup' && (
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              既にアカウントをお持ちの方はこちら
            </button>
          )}
          
          {authMode === 'reset' && (
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ログインに戻る
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}