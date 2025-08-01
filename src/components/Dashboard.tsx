import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Users, BarChart3, Settings, Trash2, Edit, Eye } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useVotingSessionStore } from '../store/votingSessionStore';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { CreateSessionModal } from './CreateSessionModal';
import { SessionDetailsModal } from './SessionDetailsModal';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export function Dashboard() {
  const { user } = useAuthStore();
  const { sessions, fetchSessions, isLoading } = useVotingSessionStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const userSessions = sessions.filter(s => s.created_by === user?.id);
  const activeSessions = sessions.filter(s => s.is_active);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">投票ダッシュボード</h1>
            <p className="mt-2 text-gray-600">投票セッションの管理と結果の確認</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            新規投票作成
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">アクティブな投票</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeSessions.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">作成した投票</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{userSessions.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総投票数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {sessions.reduce((acc, s) => acc + (s.total_voters || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Sessions List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">投票セッション一覧</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                読み込み中...
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">投票セッションがありません</p>
                <p className="mt-2">新規投票を作成してください</p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {session.title}
                            </h3>
                            {session.is_active ? (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                アクティブ
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                終了
                              </span>
                            )}
                          </div>
                          
                          {session.description && (
                            <p className="mt-2 text-sm text-gray-600">
                              {session.description}
                            </p>
                          )}

                          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(session.created_at), 'yyyy年MM月dd日', { locale: ja })}
                            </div>
                            {session.end_date && (
                              <div className="flex items-center gap-1">
                                <span>〜</span>
                                {format(new Date(session.end_date), 'yyyy年MM月dd日', { locale: ja })}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {session.total_voters || 0} 投票
                            </div>
                          </div>

                          {session.nft_policy_id && (
                            <div className="mt-2 text-xs text-gray-500">
                              NFT Policy ID: {session.nft_policy_id.slice(0, 12)}...
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSession(session.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            詳細
                          </Button>
                          
                          {session.created_by === user?.id && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {/* TODO: Edit functionality */}}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {/* TODO: Delete functionality */}}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateSessionModal onClose={() => setShowCreateModal(false)} />
        )}
        {selectedSession && (
          <SessionDetailsModal 
            sessionId={selectedSession}
            onClose={() => setSelectedSession(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}