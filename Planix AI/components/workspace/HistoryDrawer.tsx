'use client';

import { motion } from 'motion/react';
import { Search, Plus, X, Map, Clock, CheckCircle2, PauseCircle } from 'lucide-react';
import { RoadmapData } from './Roadmap';

interface HistoryDrawerProps {
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  history: RoadmapData[];
}

export default function HistoryDrawer({ onClose, onNewChat, onSelectChat, history }: HistoryDrawerProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <Clock className="w-3 h-3 text-blue-400" />;
      case 'Completed': return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      case 'Paused': return <PauseCircle className="w-3 h-3 text-amber-400" />;
      default: return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 h-full w-80 bg-[#0a0a0c] border-r border-white/10 z-50 flex flex-col shadow-2xl"
      >
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium tracking-wide">Roadmaps</span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-white/5 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search roadmaps..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* New Roadmap Button */}
          <button 
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm text-white transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            <Plus className="w-4 h-4" />
            <span>New Roadmap</span>
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scroll-smooth">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-8">No history yet.</div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectChat(item.id);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-colors group flex flex-col gap-1"
              >
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate block w-full">
                  {item.goal}
                </span>
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] text-gray-500">{item.date}</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(item.status)}
                    <span className="text-[10px] text-gray-400">{item.status}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
}
