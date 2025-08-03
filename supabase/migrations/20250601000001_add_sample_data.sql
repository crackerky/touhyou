/*
  # Add sample voting sessions for testing
  
  This migration adds sample voting sessions that users can immediately participate in
  after logging in, including fruit voting and other examples.
*/

-- Create a sample admin user (using a fixed UUID for consistency)
INSERT INTO users (id, email, display_name, created_at) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'システム管理者', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create sample voting sessions
INSERT INTO voting_sessions (id, title, description, options, start_date, end_date, is_active, created_by, created_at) VALUES 
  (
    '10000000-0000-0000-0000-000000000001',
    '好きな果物投票',
    'あなたの一番好きな果物を教えてください！',
    '[
      {"id": "apple", "label": "りんご 🍎", "description": "甘くてシャキシャキ"},
      {"id": "banana", "label": "バナナ 🍌", "description": "栄養豊富で食べやすい"},
      {"id": "orange", "label": "オレンジ 🍊", "description": "ビタミンCたっぷり"},
      {"id": "grape", "label": "ぶどう 🍇", "description": "甘酸っぱくてジューシー"},
      {"id": "strawberry", "label": "いちご 🍓", "description": "甘くて可愛い"}
    ]'::jsonb,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '30 days',
    true,
    '00000000-0000-0000-0000-000000000001',
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '理想の休日の過ごし方',
    'あなたの理想的な休日の過ごし方は？',
    '[
      {"id": "home", "label": "家でリラックス 🏠", "description": "ゆっくり家で過ごす"},
      {"id": "outdoor", "label": "アウトドア活動 🏕️", "description": "自然の中で活動する"},
      {"id": "shopping", "label": "ショッピング 🛍️", "description": "お買い物を楽しむ"},
      {"id": "friends", "label": "友人と過ごす 👥", "description": "友人との時間を大切に"},
      {"id": "travel", "label": "旅行 ✈️", "description": "新しい場所を探索"}
    ]'::jsonb,
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '14 days',
    true,
    '00000000-0000-0000-0000-000000000001',
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '次回のチームイベント',
    'チームの次回イベントで何をしたいですか？',
    '[
      {"id": "bbq", "label": "バーベキュー 🍖", "description": "みんなでBBQを楽しむ"},
      {"id": "karaoke", "label": "カラオケ 🎤", "description": "歌って盛り上がる"},
      {"id": "bowling", "label": "ボウリング 🎳", "description": "スポーツで汗を流す"},
      {"id": "game", "label": "ゲーム大会 🎮", "description": "ゲームで競い合う"}
    ]'::jsonb,
    NOW(),
    NOW() + INTERVAL '7 days',
    true,
    '00000000-0000-0000-0000-000000000001',
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'プログラミング言語の人気投票',
    '最も使いやすいと思うプログラミング言語は？',
    '[
      {"id": "javascript", "label": "JavaScript", "description": "Web開発の定番"},
      {"id": "python", "label": "Python", "description": "AI・データ分析に最適"},
      {"id": "typescript", "label": "TypeScript", "description": "型安全なJavaScript"},
      {"id": "rust", "label": "Rust", "description": "高速で安全なシステム言語"},
      {"id": "go", "label": "Go", "description": "シンプルで効率的"}
    ]'::jsonb,
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '21 days',
    true,
    '00000000-0000-0000-0000-000000000001',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;