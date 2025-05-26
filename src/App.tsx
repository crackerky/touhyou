import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { VoteIcon } from 'lucide-react';
import WalletConnection from './components/WalletConnection';
import VotingSection from './components/VotingSection';
import VoteResults from './components/VoteResults';
import { useVoteStore } from './store/voteStore';

function App() {
  const { isVerified, hasVoted, error } = useVoteStore();

  // エラーがあればトーストを表示
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-red-50 flex flex-col">
      <Toaster position="top-center" />
      
      <header className="py-6 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center gap-3"
        >
          <div className="text-3xl">🍎</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">好きな果物投票</h1>
            <p className="text-sm text-slate-600 mt-1">Cardanoウォレット認証システム</p>
          </div>
          <div className="text-3xl">🍌</div>
        </motion.div>
      </header>
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex justify-center">
            <AnimatePresence mode="wait">
              {!isVerified ? (
                <WalletConnection key="connection" />
              ) : (
                <VotingSection key="voting" />
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center">
            <VoteResults />
          </div>
        </div>
      </main>
      
      <footer className="py-6 px-4 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>🍊</span>
          <p>好きな果物投票デモ &copy; {new Date().getFullYear()}</p>
          <span>🍎</span>
        </div>
        <p className="text-xs">
          ウォレット認証で安全な投票を実現
        </p>
      </footer>
    </div>
  );
}

export default App;