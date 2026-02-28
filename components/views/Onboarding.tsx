'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const ROLES = ['Student', 'Professional', 'Entrepreneur', 'Explorer'];

export default function Onboarding({ onComplete }: { onComplete: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    role: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.role) {
      onComplete(formData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen w-full flex items-center justify-center p-6"
    >
      <div className="w-full max-w-lg glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl border border-white/10">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)' }} />

        <div className="relative z-10">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3 text-white tracking-tight">
              Welcome to <span className="text-gradient">Planix AI</span>
            </h2>
            <p className="text-gray-500 text-sm font-light">Your Personal Evolution System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {/* Name Input */}
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="What should we call you?"
                label="What should we call you?"
              />

              {/* Role Selection */}
              <div className="space-y-3">
                <label className="text-sm text-gray-400 ml-1 font-medium">Current Identity</label>
                <div className="flex flex-wrap gap-3">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role })}
                      className={`px-5 py-2.5 rounded-full text-sm transition-all duration-300 border ${
                        formData.role === role 
                          ? 'bg-white/10 border-blue-500/50 text-white shadow-[0_0_15px_rgba(0,112,243,0.3)]' 
                          : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!formData.name.trim() || !formData.role}
              className="mt-4"
            >
              <span className="font-semibold text-white tracking-wide">Continue</span>
              <ArrowRight className="w-5 h-5 text-white ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
