import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Users, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useVotingSessionStore } from '../store/votingSessionStore';
import { WalletRegistration } from '../components/WalletRegistration';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { sessions, fetchSessions } = useVotingSessionStore();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const activeSessions = sessions.filter(s => s.is_active);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              NFT保有者限定
              <br />
              <span className="text-blue-600">ブロックチェーン投票システム</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Cardano NFTとGoogle認証を組み合わせた、透明性と信頼性の高い投票プラットフォーム
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  ダッシュボードへ
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            ) : (
              <p className="text-gray-600">
                投票に参加するには、上部のメールアドレスでログインしてください
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">システムの特徴</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 h-full">
                <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">NFT保有確認</h3>
                <p className="text-gray-600">
                  Cardano NFTの保有を自動確認し、正当な投票権を持つユーザーのみが投票可能
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 h-full">
                <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">メール認証</h3>
                <p className="text-gray-600">
                  メールアドレスで簡単ログイン。ウォレットアドレスと安全に紐付け
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 h-full">
                <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">リアルタイム集計</h3>
                <p className="text-gray-600">
                  投票結果をリアルタイムで確認。透明性の高い投票運営が可能
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wallet Registration */}
      {user && !user.wallet_address && (
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              投票に参加するには、ウォレットアドレスの登録が必要です
            </h2>
            <WalletRegistration />
          </div>
        </section>
      )}

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">現在開催中の投票</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSessions.slice(0, 6).map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card 
                    className="p-6 h-full cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/vote/${session.id}`)}
                  >
                    <h3 className="text-lg font-semibold mb-2">{session.title}</h3>
                    {session.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {session.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        参加者: {session.total_voters || 0}
                      </span>
                      <Button variant="outline" size="sm">
                        投票する
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}