import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  return (
    <div className="relative group w-full">
      <input
        id={id}
        className={`w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500/50 transition-all duration-300 peer placeholder-transparent shadow-sm ${className}`}
        {...props}
      />
      <label 
        htmlFor={id} 
        className="absolute left-5 top-4 text-gray-500 transition-all duration-300 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-blue-400 peer-focus:bg-[#0a0a0c] peer-focus:px-2 peer-valid:-top-3 peer-valid:text-xs peer-valid:text-blue-400 peer-valid:bg-[#0a0a0c] peer-valid:px-2 cursor-text pointer-events-none"
      >
        {label}
      </label>
    </div>
  );
}
