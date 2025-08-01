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
      const { data, error } = await supabase
        .from('session_votes')
        .insert({
          session_id: sessionId,
          user_id: userId,
          option,
          nft_verified: nftVerified,
          nft_count: nftCount
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local votes cache
      const sessionVotes = get().sessionVotes;
      const votes = sessionVotes[sessionId] || [];
      set({ 
        sessionVotes: {
          ...sessionVotes,
          [sessionId]: [...votes, data]
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
      const { data, error } = await supabase
        .from('session_votes')
        .select('*')
        .eq('session_id', sessionId);

      if (error) throw error;
      
      const sessionVotes = get().sessionVotes;
      set({ 
        sessionVotes: {
          ...sessionVotes,
          [sessionId]: data || []
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