'use client';

import { motion } from 'motion/react';
import { BrainCircuit } from 'lucide-react';

export default function SplashIntro() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="h-screen w-full flex flex-col items-center justify-center relative"
    >
      {/* Particle/Neural effect background simulation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, -60],
            y: [0, -60],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-[100px] opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(0, 223, 216, 0.1) 0%, transparent 8%), radial-gradient(circle at center, rgba(121, 40, 202, 0.1) 0%, transparent 8%)',
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 30px 30px'
          }}
        />
      </div>

      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, type: 'spring' }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full bg-gradient-primary blur-xl opacity-50"
          />
          <div className="relative bg-[#050505] p-6 rounded-full border border-white/10">
            <BrainCircuit className="w-16 h-16 text-white" />
          </div>
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-4"
        >
          PLANIX <span className="text-gradient">AI</span>
        </motion.h1>
      </motion.div>
    </motion.div>
  );
}
