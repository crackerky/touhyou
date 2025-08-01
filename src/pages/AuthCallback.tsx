import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function AuthCallback() {
  const checkUser = useAuthStore((state) => state.checkUser);

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      await checkUser();
      // Redirect to home page after successful authentication
      window.location.href = '/';
    };

    handleCallback();
  }, [checkUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 via-yellow-50 to-red-50">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">認証を処理しています...</p>
      </div>
    </div>
  );
}