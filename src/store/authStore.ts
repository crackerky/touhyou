import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User } from '../types/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
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

      signInWithEmail: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          // User will be handled by the auth state change listener
          await get().checkUser();
        } catch (error) {
          console.error('Email sign in error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'ログインに失敗しました',
            isLoading: false 
          });
        }
      },

      signUpWithEmail: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) throw error;

          if (data.user && !data.user.email_confirmed_at) {
            set({ 
              isLoading: false,
              error: null
            });
            // Show message about email confirmation
            return;
          }

          // User will be handled by the auth state change listener
          await get().checkUser();
        } catch (error) {
          console.error('Email sign up error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'アカウント作成に失敗しました',
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
              .eq('email', authUser.email!)
              .single();

            if (userError && userError.code !== 'PGRST116') {
              throw userError;
            }

            if (!userData) {
              // Create new user
              const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                  id: authUser.id,
                  google_id: authUser.app_metadata?.provider === 'google' ? authUser.id : null,
                  email: authUser.email!,
                  display_name: authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
                  avatar_url: authUser.user_metadata?.avatar_url || null
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