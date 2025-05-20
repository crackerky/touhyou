import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { isValidEthereumAddress, isCardanoAddressFormatValid } from '../lib/utils';
import { isValidCardanoAddress } from '../lib/wallet';

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
      
      // First check format with regex (fast)
      const isValidFormat = isValidEthereumAddress(address) || isCardanoAddressFormatValid(address);
      
      if (!isValidFormat) {
        set({ error: '無効なウォレットアドレス形式です', isLoading: false });
        return false;
      }

      // For Cardano addresses, also do a more thorough check if possible
      if (!isValidEthereumAddress(address)) {
        try {
          const isValid = await isValidCardanoAddress(address);
          if (!isValid) {
            console.warn('Address failed WASM validation but passed regex check:', address);
            // We continue anyway since the regex passed, and the WASM lib might not be loaded
          }
        } catch (err) {
          console.error('Cardano address validation error:', err);
          // Continue since the regex check passed
        }
      }

      // ウォレットが存在するか確認
      const { data: existingWallet, error: fetchError } = await supabase
        .from('wallets')
        .select('*')
        .eq('address', address)
        .single();

      if (fetchError && fetchError.message !== 'No rows found') {
        set({ error: `データの取得に失敗しました: ${fetchError.message}`, isLoading: false });
        return false;
      }

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
        set({ error: `ウォレット登録に失敗しました: ${insertError.message}`, isLoading: false });
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
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      set({ error: `ウォレットの検証に失敗しました: ${errorMessage}`, isLoading: false });
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
        set({ error: `投票登録に失敗しました: ${voteError.message}`, isLoading: false });
        return false;
      }

      // ウォレットステータスを更新
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ has_voted: true })
        .eq('address', wallet);

      if (updateError) {
        set({ error: `ウォレット状態の更新に失敗しました: ${updateError.message}`, isLoading: false });
        return false;
      }

      // ローカル状態を更新
      set({ hasVoted: true, isLoading: false });
      
      // 投票数を更新
      await get().getVoteCounts();
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      set({ error: `投票に失敗しました: ${errorMessage}`, isLoading: false });
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
        set({ error: `投票データの取得に失敗しました: ${error.message}`, isLoading: false });
        return;
      }

      const voteCounts: Record<string, number> = { 'option1': 0, 'option2': 0, 'option3': 0 };
      
      data?.forEach(vote => {
        if (voteCounts[vote.option] !== undefined) {
          voteCounts[vote.option]++;
        }
      });

      set({ votes: voteCounts, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      set({ error: `投票数の取得に失敗しました: ${errorMessage}`, isLoading: false });
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