import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { VotingSession, SessionVote, VotingOption } from '../types/supabase';

interface VotingSessionState {
  sessions: VotingSession[];
  currentSession: VotingSession | null;
  sessionVotes: Record<string, SessionVote[]>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSessions: () => Promise<void>;
  fetchSessionById: (id: string) => Promise<void>;
  createSession: (session: Omit<VotingSession, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSession: (id: string, updates: Partial<VotingSession>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  voteInSession: (sessionId: string, userId: string, option: string, nftVerified: boolean, nftCount: number) => Promise<void>;
  fetchSessionVotes: (sessionId: string) => Promise<void>;
  setCurrentSession: (session: VotingSession | null) => void;
  clearError: () => void;
}

export const useVotingSessionStore = create<VotingSessionState>((set, get) => ({
  sessions: [],
  currentSession: null,
  sessionVotes: {},
  isLoading: false,
  error: null,

  fetchSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('voting_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ sessions: data || [], isLoading: false });
    } catch (error) {
      console.error('Fetch sessions error:', error);
      set({ 
        error: error instanceof Error ? error.message : '投票セッションの取得に失敗しました',
        isLoading: false 
      });
    }
  },

  fetchSessionById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('voting_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ currentSession: data, isLoading: false });
    } catch (error) {
      console.error('Fetch session error:', error);
      set({ 
        error: error instanceof Error ? error.message : '投票セッションの取得に失敗しました',
        isLoading: false 
      });
    }
  },

  createSession: async (session) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('voting_sessions')
        .insert(session)
        .select()
        .single();

      if (error) throw error;
      
      const sessions = get().sessions;
      set({ 
        sessions: [data, ...sessions],
        currentSession: data,
        isLoading: false 
      });
    } catch (error) {
      console.error('Create session error:', error);
      set({ 
        error: error instanceof Error ? error.message : '投票セッションの作成に失敗しました',
        isLoading: false 
      });
    }
  },

  updateSession: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('voting_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const sessions = get().sessions.map(s => s.id === id ? data : s);
      set({ 
        sessions,
        currentSession: get().currentSession?.id === id ? data : get().currentSession,
        isLoading: false 
      });
    } catch (error) {
      console.error('Update session error:', error);
      set({ 
        error: error instanceof Error ? error.message : '投票セッションの更新に失敗しました',
        isLoading: false 
      });
    }
  },

  deleteSession: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('voting_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      const sessions = get().sessions.filter(s => s.id !== id);
      set({ 
        sessions,
        currentSession: get().currentSession?.id === id ? null : get().currentSession,
        isLoading: false 
      });
    } catch (error) {
      console.error('Delete session error:', error);
      set({ 
        error: error instanceof Error ? error.message : '投票セッションの削除に失敗しました',
        isLoading: false 
      });
    }
  },

  voteInSession: async (sessionId, userId, option, nftVerified, nftCount) => {
    set({ isLoading: true, error: null });
    try {
      // Get user's wallet address from auth store instead of users table
      const authStore = (await import('../store/authStore')).useAuthStore;
      const currentUser = authStore.getState().user;
      
      if (!currentUser?.wallet_address) {
        throw new Error('ウォレットアドレスが登録されていません');
      }

      // Insert into existing votes table
      const { data, error } = await supabase
        .from('votes')
        .insert({
          wallet_address: currentUser.wallet_address,
          option,
          nft_verified: nftVerified,
          policy_id: nftVerified ? 'fruit_vote_policy' : null,
          verification_method: nftVerified ? 'mesh_verification' : 'email_only'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local votes cache with converted format
      const sessionVotes = get().sessionVotes;
      const votes = sessionVotes[sessionId] || [];
      const convertedVote = {
        id: data.id.toString(),
        session_id: sessionId,
        user_id: userId,
        option: data.option,
        nft_verified: data.nft_verified || false,
        nft_count: nftCount,
        created_at: data.created_at
      };
      
      set({ 
        sessionVotes: {
          ...sessionVotes,
          [sessionId]: [...votes, convertedVote]
        },
        isLoading: false 
      });
    } catch (error) {
      console.error('Vote error:', error);
      set({ 
        error: error instanceof Error ? error.message : '投票に失敗しました',
        isLoading: false 
      });
    }
  },

  fetchSessionVotes: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch from existing votes table
      const { data, error } = await supabase
        .from('votes')
        .select('*');

      if (error) throw error;
      
      // Convert votes data to session format
      const convertedVotes = (data || []).map(vote => ({
        id: vote.id.toString(),
        session_id: sessionId, // All votes belong to fruit voting for now
        user_id: 'unknown', // We don't have user mapping in votes table
        option: vote.option,
        nft_verified: vote.nft_verified || false,
        nft_count: 1,
        created_at: vote.created_at
      }));
      
      const sessionVotes = get().sessionVotes;
      set({ 
        sessionVotes: {
          ...sessionVotes,
          [sessionId]: convertedVotes
        },
        isLoading: false 
      });
    } catch (error) {
      console.error('Fetch votes error:', error);
      set({ 
        error: error instanceof Error ? error.message : '投票結果の取得に失敗しました',
        isLoading: false 
      });
    }
  },

  setCurrentSession: (session) => {
    set({ currentSession: session });
  },

  clearError: () => set({ error: null })
}));