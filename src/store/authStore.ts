import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User } from '../types/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
  updateUserWallet: (walletAddress: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              }
            }
          });

          if (error) throw error;

          // OAuth redirects to Google, so we don't need to do anything else here
        } catch (error) {
          console.error('Google sign in error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Google認証に失敗しました',
            isLoading: false 
          });
        }
      },

      signOut: async () => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          set({ user: null, isLoading: false });
        } catch (error) {
          console.error('Sign out error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'ログアウトに失敗しました',
            isLoading: false 
          });
        }
      },

      checkUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          
          if (authUser) {
            // Check if user exists in our users table
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('google_id', authUser.id)
              .single();

            if (userError && userError.code !== 'PGRST116') {
              throw userError;
            }

            if (!userData) {
              // Create new user
              const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                  google_id: authUser.id,
                  email: authUser.email!,
                  display_name: authUser.user_metadata.full_name || authUser.email!.split('@')[0],
                  avatar_url: authUser.user_metadata.avatar_url
                })
                .select()
                .single();

              if (createError) throw createError;
              set({ user: newUser, isLoading: false });
            } else {
              set({ user: userData, isLoading: false });
            }
          } else {
            set({ user: null, isLoading: false });
          }
        } catch (error) {
          console.error('Check user error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'ユーザー確認に失敗しました',
            isLoading: false 
          });
        }
      },

      updateUserWallet: async (walletAddress: string) => {
        const currentUser = get().user;
        if (!currentUser) {
          set({ error: 'ログインが必要です' });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('users')
            .update({ wallet_address: walletAddress })
            .eq('id', currentUser.id)
            .select()
            .single();

          if (error) throw error;
          set({ user: data, isLoading: false });
        } catch (error) {
          console.error('Update wallet error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'ウォレットアドレスの更新に失敗しました',
            isLoading: false 
          });
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);