import { supabase } from '../lib/supabase';

// Supabaseの互換性テスト関数
export async function testSupabaseCompatibility() {
  console.log('🔍 Supabase互換性テストを開始...');
  
  const results = {
    connection: false,
    tables: {
      votes: false,
      users: false,
      voting_sessions: false,
      wallets: false
    },
    permissions: {
      votes_select: false,
      votes_insert: false,
      users_select: false,
      voting_sessions_select: false
    }
  };

  try {
    // 1. 基本的な接続テスト
    console.log('📡 接続テスト...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('votes')
      .select('count', { count: 'exact', head: true });
    
    if (!connectionError) {
      results.connection = true;
      console.log('✅ Supabase接続: OK');
    } else {
      console.log('❌ Supabase接続: NG', connectionError);
    }

    // 2. テーブル存在確認とアクセステスト
    const tables = ['votes', 'users', 'voting_sessions', 'wallets'];
    
    for (const table of tables) {
      try {
        console.log(`📊 ${table}テーブルをテスト中...`);
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!error) {
          results.tables[table as keyof typeof results.tables] = true;
          console.log(`✅ ${table}テーブル: OK (${data?.length || 0} レコード確認)`);
        } else {
          console.log(`❌ ${table}テーブル: NG`, error.message);
        }
      } catch (e) {
        console.log(`❌ ${table}テーブル: 例外発生`, e);
      }
    }

    // 3. votesテーブルの詳細テスト
    if (results.tables.votes) {
      console.log('🗳️ votesテーブルの詳細テスト...');
      
      // SELECT権限テスト
      try {
        const { data: selectTest, error: selectError } = await supabase
          .from('votes')
          .select('id, option, wallet_address, created_at');
        
        if (!selectError) {
          results.permissions.votes_select = true;
          console.log(`✅ votes SELECT権限: OK (${selectTest?.length || 0} レコード)`);
          
          // 既存データの構造確認
          if (selectTest && selectTest.length > 0) {
            console.log('📋 既存の投票データサンプル:', selectTest[0]);
            
            // オプションの集計
            const optionCounts = selectTest.reduce((acc: Record<string, number>, vote: any) => {
              acc[vote.option] = (acc[vote.option] || 0) + 1;
              return acc;
            }, {});
            console.log('📊 現在の投票状況:', optionCounts);
          }
        } else {
          console.log('❌ votes SELECT権限: NG', selectError);
        }
      } catch (e) {
        console.log('❌ votes SELECT権限: 例外', e);
      }

      // INSERT権限テスト（実際には挿入しない）
      try {
        const testWallet = 'test_compatibility_' + Date.now();
        const { error: insertError } = await supabase
          .from('votes')
          .insert({
            wallet_address: testWallet,
            option: 'テスト',
            nft_verified: false,
            verification_method: 'compatibility_test'
          })
          .select();
        
        if (!insertError) {
          results.permissions.votes_insert = true;
          console.log('✅ votes INSERT権限: OK');
          
          // テストデータを削除
          await supabase
            .from('votes')
            .delete()
            .eq('wallet_address', testWallet);
        } else {
          console.log('❌ votes INSERT権限: NG', insertError);
        }
      } catch (e) {
        console.log('❌ votes INSERT権限: 例外', e);
      }
    }

    // 4. 結果サマリー
    console.log('\n📋 Supabase互換性テスト結果:');
    console.log('接続:', results.connection ? '✅' : '❌');
    console.log('テーブル:');
    Object.entries(results.tables).forEach(([table, status]) => {
      console.log(`  ${table}:`, status ? '✅' : '❌');
    });
    console.log('権限:');
    Object.entries(results.permissions).forEach(([perm, status]) => {
      console.log(`  ${perm}:`, status ? '✅' : '❌');
    });

    return results;
    
  } catch (error) {
    console.error('🚨 互換性テスト中に予期しないエラー:', error);
    return results;
  }
}

// 投票データの整合性チェック
export async function validateVoteData(walletAddress: string, option: string) {
  console.log('🔍 投票データ整合性チェック:', { walletAddress, option });
  
  // 1. ウォレットアドレスの形式チェック
  if (!walletAddress || walletAddress.trim().length === 0) {
    throw new Error('ウォレットアドレスが無効です');
  }

  // 2. 選択肢の有効性チェック
  const validOptions = ['りんご', 'バナナ', 'オレンジ', 'ぶどう', 'いちご'];
  if (!validOptions.includes(option)) {
    throw new Error(`無効な選択肢です: ${option}`);
  }

  // 3. 重複投票チェック
  const { data: existingVote, error } = await supabase
    .from('votes')
    .select('id, option, created_at')
    .eq('wallet_address', walletAddress)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
    throw new Error(`投票履歴の確認に失敗しました: ${error.message}`);
  }

  if (existingVote) {
    throw new Error(`このウォレットアドレスは既に投票済みです (選択: ${existingVote.option})`);
  }

  console.log('✅ 投票データ整合性チェック: 合格');
  return true;
}

// Supabaseクライアント設定の確認
export function validateSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('🔧 Supabase設定確認:');
  console.log('URL:', url ? '✅ 設定済み' : '❌ 未設定');
  console.log('Anonymous Key:', key ? '✅ 設定済み' : '❌ 未設定');
  
  if (!url || !key) {
    throw new Error('Supabaseの環境変数が設定されていません');
  }
  
  return { url, key };
}