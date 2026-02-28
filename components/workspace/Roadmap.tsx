'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Clock, PlayCircle, Network, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export interface RoadmapNode {
  id: number;
  title: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'locked';
  progress: number;
  objectives: string[];
  impact: string;
}

export interface RoadmapData {
  id: string;
  goal: string;
  date: string;
  status: string;
  nodes: RoadmapNode[];
  totalPhases: number;
  totalDuration: string;
}

export default function Roadmap({ data }: { data?: RoadmapData }) {
  const [expandedNode, setExpandedNode] = useState<number | null>(1);

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3 text-white tracking-tight">
            <Network className="w-6 h-6 md:w-7 md:h-7 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" /> 
            Your Roadmap
          </h2>
          <p className="text-sm md:text-base text-gray-400 mt-2 font-light">
            Tailored to your goals. Aligned with your pace.
          </p>
        </div>
        <div className="text-xs md:text-sm text-gray-300 bg-white/5 px-5 py-2.5 rounded-full border border-white/10 shadow-sm backdrop-blur-sm self-start md:self-auto">
          {data.totalPhases} Phases • {data.totalDuration}
        </div>
      </div>

      <div className="relative pt-4 pb-12">
        {/* Connection Lines (Simplified for vertical layout) */}
        <div className="absolute left-8 top-8 bottom-12 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-gray-800/50 rounded-full" />

        <div className="space-y-8">
          {data.nodes.map((node, idx) => {
            const isExpanded = expandedNode === node.id;
            return (
              <div key={node.id} className="relative pl-16 md:pl-20">
                {/* Node Point */}
                <div className={`absolute left-[22px] top-6 w-5 h-5 rounded-full border-4 border-[#0a0a0c] z-10 transition-all duration-500 ${
                  node.status === 'completed' ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]' :
                  node.status === 'in-progress' ? 'bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)] scale-110' :
                  'bg-gray-700'
                }`} />

                <motion.div 
                  layout
                  onClick={() => setExpandedNode(isExpanded ? null : node.id)}
                  className={`glass-card rounded-3xl p-6 md:p-8 cursor-pointer transition-all duration-500 group relative overflow-hidden ${
                    node.status === 'in-progress' 
                      ? 'border-purple-500/40 shadow-[0_0_40px_rgba(121,40,202,0.15)] bg-white/[0.03]' 
                      : 'hover:bg-white/[0.04] border-white/5 hover:border-white/10'
                  }`}
                >
                  {/* Subtle background glow for in-progress */}
                  {node.status === 'in-progress' && (
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none rounded-full" />
                  )}

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-[10px] md:text-xs font-mono text-gray-500 uppercase tracking-widest font-semibold">Phase {node.id}</span>
                        <span className="text-[10px] md:text-xs bg-white/10 px-2.5 py-1 rounded-md text-gray-300 flex items-center gap-1.5 backdrop-blur-sm border border-white/5">
                          <Clock className="w-3 h-3" /> {node.duration}
                        </span>
                        <span className="text-[10px] md:text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                          {node.impact}
                        </span>
                      </div>
                      <h3 className={`text-lg md:text-xl font-bold transition-colors duration-300 ${
                        node.status === 'in-progress' ? 'text-white' : 'text-gray-200 group-hover:text-white'
                      }`}>
                        {node.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-4 self-start md:self-center">
                      {node.status === 'in-progress' && (
                        <button className="bg-gradient-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:shadow-[0_0_20px_rgba(0,112,243,0.5)] transition-all duration-300 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <PlayCircle className="w-4 h-4" /> Continue
                        </button>
                      )}
                      <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" /> : <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative z-10 mt-6 mb-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-2.5 font-medium tracking-wide">
                      <span className="uppercase text-[10px]">Mastery Level</span>
                      <span>{node.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#050505] rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        className={`h-full rounded-full relative ${
                          node.status === 'completed' ? 'bg-blue-500' :
                          node.status === 'in-progress' ? 'bg-gradient-to-r from-purple-500 to-cyan-500' :
                          'bg-transparent'
                        }`}
                        initial={{ width: `${node.progress}%` }}
                        animate={{ width: `${node.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      >
                        {node.status === 'in-progress' && (
                          <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
                        )}
                      </motion.div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        key={`expanded-${node.id}`}
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="relative z-10 grid grid-cols-1 gap-8 pt-6 border-t border-white/10 overflow-hidden"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Key Objectives</h4>
                          <ul className="space-y-3">
                            {node.objectives.map((obj, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-gray-300 font-light leading-relaxed">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/70 shadow-[0_0_8px_rgba(59,130,246,0.8)] shrink-0" />
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
