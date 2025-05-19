import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { isValidEthereumAddress, isValidCardanoAddress } from '../lib/utils';

interface VoteState {
  wallet: string | null;
  isVerified: boolean;
  hasVoted: boolean;
  isLoading: boolean;
  error: string | null;
  votes: Record<string, number>;
  
  verifyWallet: (address: string) => Promise<boolean>;
  castVote: (option: string) => Promise<boolean>;
  getVoteCounts: () => Promise<void>;
  reset: () => void;
}

export const useVoteStore = create<VoteState>((set, get) => ({
  wallet: null,
  isVerified: false,
  hasVoted: false,
  isLoading: false,
  error: null,
  votes: { 'option1': 0, 'option2': 0, 'option3': 0 },

  verifyWallet: async (address: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // EthereumまたはCardanoアドレスを検証
      if (!isValidEthereumAddress(address) && !isValidCardanoAddress(address)) {
        set({ error: '無効なウォレットアドレス形式です', isLoading: false });
        return false;
      }

      // ウォレットが存在するか確認
      const { data: existingWallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('address', address)
        .single();

      if (existingWallet) {
        set({ 
          wallet: existingWallet.address,
          isVerified: true,
          hasVoted: existingWallet.has_voted,
          isLoading: false
        });
        return true;
      }

      // 新しいウォレットレコードを作成
      const { error: insertError } = await supabase
        .from('wallets')
        .insert([{ address, has_voted: false }]);

      if (insertError) {
        set({ error: insertError.message, isLoading: false });
        return false;
      }

      set({ 
        wallet: address, 
        isVerified: true,
        hasVoted: false, 
        isLoading: false
      });
      return true;
    } catch (error) {
      set({ error: 'ウォレットの検証に失敗しました', isLoading: false });
      return false;
    }
  },

  castVote: async (option: string) => {
    const { wallet } = get();
    
    if (!wallet) {
      set({ error: 'ウォレットが検証されていません' });
      return false;
    }

    try {
      set({ isLoading: true, error: null });

      // 投票を挿入
      const { error: voteError } = await supabase
        .from('votes')
        .insert([{ wallet_address: wallet, option }]);

      if (voteError) {
        set({ error: voteError.message, isLoading: false });
        return false;
      }

      // ウォレットステータスを更新
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ has_voted: true })
        .eq('address', wallet);

      if (updateError) {
        set({ error: updateError.message, isLoading: false });
        return false;
      }

      // ローカル状態を更新
      set({ hasVoted: true, isLoading: false });
      
      // 投票数を更新
      await get().getVoteCounts();
      
      return true;
    } catch (error) {
      set({ error: '投票に失敗しました', isLoading: false });
      return false;
    }
  },

  getVoteCounts: async () => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase
        .from('votes')
        .select('option');

      if (error) {
        set({ error: error.message, isLoading: false });
        return;
      }

      const voteCounts: Record<string, number> = { 'option1': 0, 'option2': 0, 'option3': 0 };
      
      data.forEach(vote => {
        if (voteCounts[vote.option] !== undefined) {
          voteCounts[vote.option]++;
        }
      });

      set({ votes: voteCounts, isLoading: false });
    } catch (error) {
      set({ error: '投票数の取得に失敗しました', isLoading: false });
    }
  },

  reset: () => {
    set({
      wallet: null,
      isVerified: false,
      hasVoted: false,
      error: null
    });
  }
}));