'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, User } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function Navbar({ 
  onOpenHistory, 
  userData 
}: { 
  onOpenHistory: () => void;
  userData: { name: string; role: string };
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-40 glass border-b border-white/10 px-4 md:px-8 h-16 flex items-center justify-between">
      <div className="w-12 flex justify-start">
        <button 
          onClick={onOpenHistory}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex justify-center items-center">
        <span className="font-display font-bold text-lg tracking-tight">
          PLANIX <span className="text-gradient">AI</span>
        </span>
      </div>

      <div className="w-12 flex justify-end relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <User className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-48 glass-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 py-2"
            >
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-sm font-medium text-white truncate">{userData?.name || 'Explorer'}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{userData?.role || 'Explorer'}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
