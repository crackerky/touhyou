import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { isValidEthereumAddress, isCardanoAddressFormatValid, normalizeCardanoAddress } from '../lib/utils';
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
  // 果物の投票オプションに更新（後方互換性も考慮）
  votes: { 
    'banana': 0, 
    'apple': 0, 
    'orange': 0,
    // 古いキーも保持（既存データとの互換性のため）
    'option1': 0, 
    'option2': 0, 
    'option3': 0 
  },

  verifyWallet: async (address: string) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('Verifying wallet address:', address);
      
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

      // アドレスを正規化（必要に応じて）
      let normalizedAddress = address;
      try {
        normalizedAddress = await normalizeCardanoAddress(address);
        console.log('Normalized address:', normalizedAddress);
      } catch (err) {
        console.warn('Address normalization failed, using original:', err);
        normalizedAddress = address;
      }

      // 複数の形式のアドレスをチェック（HexとBech32の両方）
      const addressesToCheck = [normalizedAddress];
      if (normalizedAddress !== address) {
        addressesToCheck.push(address);
      }

      console.log('Checking addresses:', addressesToCheck);

      // ウォレットが存在するか確認（複数のアドレス形式をチェック）
      const { data: existingWallets, error: fetchError } = await supabase
        .from('wallets')
        .select('*')
        .in('address', addressesToCheck)
        .order('created_at', { ascending: false }); // 最新のレコードを優先

      if (fetchError) {
        console.error('Database fetch error:', fetchError);
        set({ error: `データの取得に失敗しました: ${fetchError.message}`, isLoading: false });
        return false;
      }

      // 既存のウォレットが見つかった場合
      if (existingWallets && existingWallets.length > 0) {
        const existingWallet = existingWallets[0]; // 最新のレコードを使用
        console.log('Found existing wallet:', existingWallet);
        
        // 重複レコードがある場合は古いものを削除
        if (existingWallets.length > 1) {
          console.log('Found duplicate wallets, cleaning up...');
          const walletsToDelete = existingWallets.slice(1).map(w => w.id);
          const { error: deleteError } = await supabase
            .from('wallets')
            .delete()
            .in('id', walletsToDelete);
          
          if (deleteError) {
            console.warn('Failed to clean up duplicate wallets:', deleteError);
          } else {
            console.log('Cleaned up duplicate wallets');
          }
        }

        set({ 
          wallet: normalizedAddress, // 正規化されたアドレスを使用
          isVerified: true,
          hasVoted: existingWallet.has_voted,
          isLoading: false
        });
        return true;
      }

      // 新しいウォレットレコードを作成
      console.log('Creating new wallet record for:', normalizedAddress);
      const { data: newWallet, error: insertError } = await supabase
        .from('wallets')
        .insert([{ address: normalizedAddress, has_voted: false }])
        .select()
        .single();

      if (insertError) {
        console.error('Wallet insertion error:', insertError);
        
        // 重複キーエラーの場合は再度検索を試行
        if (insertError.code === '23505') {
          console.log('Duplicate key detected, retrying fetch...');
          const { data: retryWallets, error: retryError } = await supabase
            .from('wallets')
            .select('*')
            .in('address', addressesToCheck)
            .order('created_at', { ascending: false })
            .limit(1);

          if (!retryError && retryWallets && retryWallets.length > 0) {
            const wallet = retryWallets[0];
            set({ 
              wallet: normalizedAddress,
              isVerified: true,
              hasVoted: wallet.has_voted,
              isLoading: false
            });
            return true;
          }
        }
        
        set({ error: `ウォレット登録に失敗しました: ${insertError.message}`, isLoading: false });
        return false;
      }

      console.log('Successfully created wallet:', newWallet);
      set({ 
        wallet: normalizedAddress, 
        isVerified: true,
        hasVoted: false, 
        isLoading: false
      });
      return true;
    } catch (error) {
      console.error('Wallet verification error:', error);
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

      console.log('Casting vote for wallet:', wallet, 'option:', option);

      // 投票を挿入
      const { error: voteError } = await supabase
        .from('votes')
        .insert([{ wallet_address: wallet, option }]);

      if (voteError) {
        console.error('Vote insertion error:', voteError);
        set({ error: `投票登録に失敗しました: ${voteError.message}`, isLoading: false });
        return false;
      }

      // ウォレットステータスを更新
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ has_voted: true })
        .eq('address', wallet);

      if (updateError) {
        console.error('Wallet update error:', updateError);
        set({ error: `ウォレット状態の更新に失敗しました: ${updateError.message}`, isLoading: false });
        return false;
      }

      // ローカル状態を更新
      set({ hasVoted: true, isLoading: false });
      
      // 投票数を更新
      await get().getVoteCounts();
      
      console.log('Vote cast successfully');
      return true;
    } catch (error) {
      console.error('Vote casting error:', error);
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
        console.error('Vote counts fetch error:', error);
        set({ error: `投票データの取得に失敗しました: ${error.message}`, isLoading: false });
        return;
      }

      // 果物の投票カウントを初期化（新旧両方のキーに対応）
      const voteCounts: Record<string, number> = { 
        'banana': 0, 
        'apple': 0, 
        'orange': 0,
        'option1': 0, 
        'option2': 0, 
        'option3': 0 
      };
      
      data?.forEach(vote => {
        if (voteCounts[vote.option] !== undefined) {
          voteCounts[vote.option]++;
        }
      });

      console.log('Updated vote counts:', voteCounts);
      set({ votes: voteCounts, isLoading: false });
    } catch (error) {
      console.error('Get vote counts error:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      set({ error: `投票数の取得に失敗しました: ${errorMessage}`, isLoading: false });
    }
  },

  reset: () => {
    console.log('Resetting vote store');
    set({
      wallet: null,
      isVerified: false,
      hasVoted: false,
      error: null
    });
  }
}));