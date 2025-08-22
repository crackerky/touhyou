import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, CheckCircle, Users, Clock, Wallet } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { testSupabaseCompatibility, validateVoteData, validateSupabaseConfig } from '../utils/supabaseCompatibility';
// import { WalletConnector } from './WalletConnector';
// import { useCardanoWallet } from '../hooks/useCardanoWallet';

interface VoteOption {
  id: string;
  label: string;
  description?: string;
  emoji?: string;
}

interface VoteResult {
  option: string;
  count: number;
  percentage: number;
}

export function ModernVotePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [voteResults, setVoteResults] = useState<VoteResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // ウォレット接続フック（一時的に無効化）
  // const { isConnected, address, checkNFTOwnership } = useCardanoWallet();
  const isConnected = false;
  const address = null;
  
  // 必要なNFTのポリシーID（実際の値に置き換えてください）
  const REQUIRED_NFT_POLICY_ID = 'your_nft_policy_id_here';

  // 果物投票の選択肢（固定）
  const options: VoteOption[] = [
    { id: 'apple', label: 'りんご', description: '甘くて美味しい', emoji: '🍎' },
    { id: 'banana', label: 'バナナ', description: 'エネルギー満点', emoji: '🍌' },
    { id: 'orange', label: 'オレンジ', description: 'ビタミンC豊富', emoji: '🍊' },
    { id: 'grape', label: 'ぶどう', description: '甘酸っぱい', emoji: '🍇' },
    { id: 'strawberry', label: 'いちご', description: '甘くてジューシー', emoji: '🍓' }
  ];

  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    try {
      setConnectionError(null);
      console.log('🚀 コンポーネント初期化開始...');
      
      // Supabase設定確認
      validateSupabaseConfig();
      console.log('✅ Supabase設定確認完了');
      
      // 互換性テスト実行
      const compatibilityResults = await testSupabaseCompatibility();
      
      if (!compatibilityResults.connection) {
        const error = 'データベースに接続できません。ネットワーク接続を確認してください。';
        setConnectionError(error);
        toast.error(error);
        return;
      }
      
      if (!compatibilityResults.tables.votes) {
        const error = '投票データベースが利用できません。管理者にお問い合わせください。';
        setConnectionError(error);
        toast.error(error);
        return;
      }
      
      if (!compatibilityResults.permissions.votes_select || !compatibilityResults.permissions.votes_insert) {
        const error = 'データベースの権限が不足しています。管理者にお問い合わせください。';
        setConnectionError(error);
        toast.error(error);
        return;
      }
      
      console.log('✅ 互換性チェック完了');
      
      // すべてのチェックが通った場合のみデータを取得
      await fetchVoteResults();
      await checkUserVote();
      
      setIsInitialized(true);
      console.log('🎉 コンポーネント初期化完了');
      
    } catch (error) {
      console.error('コンポーネント初期化エラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'アプリケーションの初期化に失敗しました';
      setConnectionError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const fetchVoteResults = async () => {
    try {
      console.log('投票結果を取得中...');
      const { data: votes, error } = await supabase
        .from('votes')
        .select('option');

      if (error) {
        console.error('Supabase fetch error:', error);
        throw error;
      }

      console.log('取得した投票データ:', votes);

      const results = options.map(option => {
        const optionVotes = votes?.filter(v => v.option === option.label) || [];
        return {
          option: option.label,
          count: optionVotes.length,
          percentage: votes?.length ? (optionVotes.length / votes.length) * 100 : 0
        };
      });

      console.log('計算された結果:', results);
      setVoteResults(results);
      setTotalVotes(votes?.length || 0);
      console.log('投票結果の設定完了');
    } catch (error) {
      console.error('投票結果の取得に失敗:', error);
      toast.error('投票結果の取得に失敗しました');
      // エラーが発生してもデフォルト値を設定
      const defaultResults = options.map(option => ({
        option: option.label,
        count: 0,
        percentage: 0
      }));
      setVoteResults(defaultResults);
      setTotalVotes(0);
    }
  };

  const checkUserVote = async () => {
    if (!user?.wallet_address) return;

    try {
      const { data: userVote, error } = await supabase
        .from('votes')
        .select('option')
        .eq('wallet_address', user.wallet_address)
        .single();

      if (userVote) {
        setHasVoted(true);
        setSelectedOption(userVote.option);
      }
    } catch (error) {
      // User hasn't voted yet
    }
  };

  const handleVote = async () => {
    if (!user?.wallet_address) {
      toast.error('ウォレットアドレスの登録が必要です');
      return;
    }

    if (!selectedOption) {
      toast.error('選択肢を選んでください');
      return;
    }

    // ウォレット接続確認（一時的に無効化）
    // if (!isConnected || !address) {
    //   toast.error('ウォレットを接続してください');
    //   return;
    // }

    // NFT保有確認（一時的に無効化）
    // const nftStatus = checkNFTOwnership(REQUIRED_NFT_POLICY_ID);
    // const hasRequiredNFT = nftStatus.hasNFT;
    
    // if (REQUIRED_NFT_POLICY_ID !== 'your_nft_policy_id_here' && !hasRequiredNFT) {
    //   toast.error('投票に必要なNFTを保有していません');
    //   return;
    // }

    console.log('投票開始:', { wallet: user.wallet_address, option: selectedOption });
    setIsVoting(true);

    // タイムアウト保護（10秒）
    const timeoutId = setTimeout(() => {
      console.log('投票処理がタイムアウトしました');
      setIsVoting(false);
      toast.error('投票処理がタイムアウトしました。再度お試しください。');
    }, 10000);

    try {
      // データ整合性チェック
      await validateVoteData(user.wallet_address, selectedOption);

      console.log('投票データを挿入中...');
      const { data, error } = await supabase
        .from('votes')
        .insert({
          wallet_address: user.wallet_address, // ユーザーのウォレットアドレスを使用
          option: selectedOption,
          nft_verified: false, // 一時的に無効化
          policy_id: null,
          verification_method: 'email_only'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`投票の保存に失敗しました: ${error.message}`);
      }

      console.log('投票成功:', data);
      setHasVoted(true);
      toast.success('🎉 投票が完了しました！');
      
      // 結果を再取得
      console.log('投票結果を更新中...');
      await fetchVoteResults();
      console.log('投票結果の更新完了');
      
    } catch (error) {
      console.error('Vote error:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      toast.error(errorMessage);
    } finally {
      clearTimeout(timeoutId);
      console.log('投票処理完了 - ローディング状態をリセット');
      setIsVoting(false);
    }
  };

  // エラー状態の表示
  if (connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">接続エラー</h2>
          <p className="text-gray-600 mb-6">{connectionError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              再読み込み
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors"
            >
              ホームに戻る
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 初期化中の表示
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">初期化中...</h2>
          <p className="text-gray-600">データベースとの接続を確認しています</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ログインが必要です</h2>
          <p className="text-gray-600 mb-6">投票に参加するには、ログインしてください</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            ホームに戻る
          </button>
        </motion.div>
      </div>
    );
  }

  if (!user.wallet_address || !isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>ホーム</span>
          </button>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">🍓 果物投票</h1>
            <p className="text-xl text-gray-600">Cardanoウォレットを接続して投票に参加しましょう</p>
          </motion.div>

          {/* Wallet Connector - 一時的に無効化 */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <WalletConnector 
              requiredPolicyId={REQUIRED_NFT_POLICY_ID}
              onWalletConnected={(walletAddress, hasNFT) => {
                console.log('ウォレット接続完了:', { walletAddress, hasNFT });
                toast.success('ウォレットが接続されました！投票できます。');
              }}
            />
          </motion.div> */}

          {/* NFT情報 */}
          {REQUIRED_NFT_POLICY_ID !== 'your_nft_policy_id_here' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">NFT保有者限定投票</h3>
              </div>
              <p className="text-blue-800 mb-2">
                この投票に参加するには、指定されたNFTを保有している必要があります。
              </p>
              <p className="text-sm text-blue-600">
                必要なポリシーID: {REQUIRED_NFT_POLICY_ID.slice(0, 20)}...
              </p>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>ホーム</span>
          </button>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{totalVotes} 票</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>開催中</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🍓 果物投票</h1>
          <p className="text-xl text-gray-600 mb-2">あなたの好きな果物を選んでください</p>
          
          {/* ウォレット情報表示 */}
          {isConnected && address && (
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-2">
              <Wallet className="h-4 w-4" />
              <span>ウォレット: {address.slice(0, 10)}...{address.slice(-6)}</span>
            </div>
          )}

          {/* NFT保有状況 */}
          {REQUIRED_NFT_POLICY_ID !== 'your_nft_policy_id_here' && isConnected && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mx-2 ${
              checkNFTOwnership(REQUIRED_NFT_POLICY_ID).hasNFT
                ? 'bg-green-100 text-green-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              <Shield className="h-4 w-4" />
              <span>
                {checkNFTOwnership(REQUIRED_NFT_POLICY_ID).hasNFT 
                  ? `NFT保有済み (${checkNFTOwnership(REQUIRED_NFT_POLICY_ID).count}個)`
                  : 'NFT未保有'
                }
              </span>
            </div>
          )}

          {hasVoted && (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <CheckCircle className="h-4 w-4" />
              <span>投票済み: {selectedOption}</span>
            </div>
          )}
        </motion.div>

        {/* Voting Section */}
        {!hasVoted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <AnimatePresence>
                {options.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative cursor-pointer group ${
                      selectedOption === option.label ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                    }`}
                    onClick={() => setSelectedOption(option.label)}
                  >
                    <div className={`bg-white rounded-2xl p-6 shadow-lg transition-all duration-200 ${
                      selectedOption === option.label 
                        ? 'bg-blue-50 border-2 border-blue-500' 
                        : 'border-2 border-transparent hover:shadow-xl hover:scale-105'
                    }`}>
                      <div className="text-center">
                        <div className="text-4xl mb-3">{option.emoji}</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{option.label}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      
                      {selectedOption === option.label && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Vote Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <button
                onClick={handleVote}
                disabled={!selectedOption || isVoting}
                className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                  selectedOption && !isVoting
                    ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isVoting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    投票中...
                  </div>
                ) : '投票する'}
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hasVoted ? 0.2 : 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {hasVoted ? '最終結果' : '現在の投票状況'}
          </h2>
          
          <div className="space-y-4">
            {voteResults.map((result, index) => {
              const option = options.find(opt => opt.label === result.option);
              return (
                <motion.div
                  key={result.option}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option?.emoji}</span>
                      <span className="font-semibold text-gray-900">{result.option}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.count} 票 ({result.percentage.toFixed(1)}%)
                    </div>
                  </div>
                  
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-gray-600">
            総投票数: {totalVotes} 票
          </div>
        </motion.div>
      </div>
    </div>
  );
}