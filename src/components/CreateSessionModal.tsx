import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useVotingSessionStore } from '../store/votingSessionStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { toast } from 'react-hot-toast';

interface CreateSessionModalProps {
  onClose: () => void;
}

interface VotingOption {
  id: string;
  label: string;
  description?: string;
}

export function CreateSessionModal({ onClose }: CreateSessionModalProps) {
  const { user } = useAuthStore();
  const { createSession, isLoading } = useVotingSessionStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [nftPolicyId, setNftPolicyId] = useState('');
  const [endDate, setEndDate] = useState('');
  const [options, setOptions] = useState<VotingOption[]>([
    { id: '1', label: '' },
    { id: '2', label: '' }
  ]);

  const addOption = () => {
    setOptions([...options, { id: Date.now().toString(), label: '' }]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(opt => opt.id !== id));
    }
  };

  const updateOption = (id: string, label: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, label } : opt));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }

    const validOptions = options.filter(opt => opt.label.trim());
    if (validOptions.length < 2) {
      toast.error('少なくとも2つの選択肢を入力してください');
      return;
    }

    try {
      await createSession({
        title,
        description: description || null,
        options: validOptions,
        nft_policy_id: nftPolicyId || null,
        end_date: endDate || null,
        is_active: true,
        created_by: user?.id || null
      });
      
      toast.success('投票セッションを作成しました');
      onClose();
    } catch (error) {
      console.error('Create session error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">新規投票作成</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">基本情報</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: 次期プロジェクトの方向性について"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="投票の詳細な説明を入力してください"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Voting Options */}
          <div>
            <h3 className="text-lg font-medium mb-4">投票選択肢</h3>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={option.id} className="flex gap-2">
                  <Input
                    type="text"
                    value={option.label}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    placeholder={`選択肢 ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(option.id)}
                    disabled={options.length <= 2}
                    className="px-3"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                選択肢を追加
              </Button>
            </div>
          </div>

          {/* Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4">詳細設定</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NFT Policy ID（NFT保有者限定の場合）
                </label>
                <Input
                  type="text"
                  value={nftPolicyId}
                  onChange={(e) => setNftPolicyId(e.target.value)}
                  placeholder="例: 1234567890abcdef..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  指定したNFTを保有するユーザーのみ投票可能になります
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  終了日時
                </label>
                <Input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  指定しない場合は手動で終了するまで継続されます
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? '作成中...' : '投票を作成'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}