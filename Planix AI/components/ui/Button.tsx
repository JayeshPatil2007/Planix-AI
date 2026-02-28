'use client';

import { motion, HTMLMotionProps } from 'motion/react';
import { ReactNode } from 'react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  if (variant === 'primary') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={`w-full relative group overflow-hidden rounded-2xl p-[1px] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        <span className="absolute inset-0 bg-gradient-primary opacity-70 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
        <span className="absolute inset-0 bg-gradient-primary" />
        <div className="relative bg-[#050505] px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 group-hover:bg-opacity-0">
          {children}
        </div>
      </motion.button>
    );
  }
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`px-5 py-3 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
