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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      <Toaster position="top-center" />
      
      <header className="py-6 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center gap-2"
        >
          <VoteIcon size={28} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">ウォレット認証投票システム</h1>
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
        <p>
          ウォレット認証投票デモ &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

export default App;