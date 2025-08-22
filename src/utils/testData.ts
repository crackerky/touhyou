import { supabase } from '../lib/supabase';

export async function createTestVotingSession() {
  try {
    console.log('Creating test voting session...');
    
    // まずユーザーを作成/取得
    const { data: authUser } = await supabase.auth.getUser();
    let userId = authUser?.user?.id;
    
    if (!userId) {
      console.log('No authenticated user, creating test user...');
      // テストユーザーを作成
      const testUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'test@example.com',
        google_id: 'test_google_id',
        display_name: 'テストユーザー',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: createdUser, error: userError } = await supabase
        .from('users')
        .upsert(testUser)
        .select()
        .single();
      
      if (userError) {
        console.error('User creation error:', userError);
      } else {
        console.log('Test user created:', createdUser);
        userId = testUser.id;
      }
    }
    
    // テスト投票セッションを作成
    const testSession = {
      id: '11111111-1111-1111-1111-111111111111',
      title: '果物投票',
      description: 'お気に入りの果物を選んでください',
      options: [
        { id: 'apple', label: 'りんご', description: '甘くて美味しい' },
        { id: 'banana', label: 'バナナ', description: 'エネルギー満点' },
        { id: 'orange', label: 'オレンジ', description: 'ビタミンC豊富' }
      ],
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7日後
      is_active: true,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: session, error: sessionError } = await supabase
      .from('voting_sessions')
      .upsert(testSession)
      .select()
      .single();
    
    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return null;
    }
    
    console.log('Test voting session created:', session);
    return session;
    
  } catch (error) {
    console.error('Error creating test data:', error);
    return null;
  }
}

export async function listAllTables() {
  try {
    console.log('Testing table access...');
    
    // 各テーブルにアクセスしてみる
    const tables = ['voting_sessions', 'users', 'session_votes', 'wallets'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`${table} table error:`, error);
        } else {
          console.log(`${table} table accessible:`, data?.length ?? 0, 'rows');
        }
      } catch (e) {
        console.error(`${table} table exception:`, e);
      }
    }
  } catch (error) {
    console.error('Error listing tables:', error);
  }
}