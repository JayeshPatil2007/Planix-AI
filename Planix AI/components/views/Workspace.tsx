'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '@/components/workspace/Navbar';
import HistoryDrawer from '@/components/workspace/HistoryDrawer';
import Roadmap, { RoadmapData } from '@/components/workspace/Roadmap';
import { Send, Plus, FileText, Image as ImageIcon, Sparkles, Map, BookOpen, FileType2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Markdown from 'react-markdown';

type ModeType = 'roadmap' | 'teaching' | 'notes';
type ComponentType = 'roadmap';

type Message = {
  id: string;
  role: 'user' | 'ai';
  text?: string;
  component?: ComponentType;
  data?: any;
};

export default function Workspace({ userData }: { userData: any }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<ModeType>('roadmap');
  const [showUpload, setShowUpload] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const [hasRoadmap, setHasRoadmap] = useState(false);
  const [isCreatingRoadmap, setIsCreatingRoadmap] = useState(false);

  const [roadmapGoal, setRoadmapGoal] = useState('');
  const [roadmapTimeline, setRoadmapTimeline] = useState('');
  const [roadmapHours, setRoadmapHours] = useState('');

  const [currentRoadmap, setCurrentRoadmap] = useState<RoadmapData | null>(null);
  const [roadmapHistory, setRoadmapHistory] = useState<RoadmapData[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/roadmap');
        if (res.ok) {
          const data = await res.json();
          setRoadmapHistory(data);
        }
      } catch (error) {
        // Handle error silently
      }
    };
    fetchHistory();
  }, []);

  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmapGoal || !roadmapTimeline || !roadmapHours) return;

    setIsGeneratingRoadmap(true);

    try {
      console.log("Calling generateRoadmap API...");
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', goal: roadmapGoal, timeline: roadmapTimeline, hours: roadmapHours })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate roadmap');
      }

      const roadmapData = await res.json();
      console.log("Received roadmapData:", roadmapData);

      const tempRoadmap: RoadmapData = {
        id: 'temp-' + Date.now().toString(),
        goal: roadmapGoal,
        date: 'Just now',
        status: 'Active',
        totalPhases: roadmapData.nodes.length,
        totalDuration: roadmapData.totalDuration,
        nodes: roadmapData.nodes.map((n: any, i: number) => ({
          id: i + 1,
          title: n.title,
          duration: n.duration,
          status: i === 0 ? 'in-progress' : 'locked',
          progress: i === 0 ? 10 : 0,
          objectives: n.objectives,
          impact: n.impact
        }))
      };

      // Save to DB first to get the real ID
      const dbRes = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tempRoadmap, hoursPerDay: roadmapHours })
      });

      let finalRoadmap = tempRoadmap;
      if (dbRes.ok) {
        const { roadmap } = await dbRes.json();
        console.log("Saved to DB. ID:", roadmap.id);
        finalRoadmap = {
          ...tempRoadmap,
          id: roadmap.id,
        };
      } else {
        const errorData = await dbRes.json();
        console.error("DB Save Error:", errorData);
        throw new Error('Failed to save roadmap to database');
      }

      setRoadmapHistory(prev => [finalRoadmap, ...prev]);
      setCurrentRoadmap(finalRoadmap);
      setIsCreatingRoadmap(false);
      setHasRoadmap(true);

      setMessages([
        {
          id: Date.now().toString(),
          role: 'ai',
          text: `Your AI-Designed Learning Path\nTailored to your goals. Aligned with your pace.`,
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          component: 'roadmap'
        }
      ]);
    } catch (error: any) {
      console.error('Roadmap generation error:', error);
      if (error.message?.includes('API key') || error.toString().includes('API key')) {
        alert('Failed to generate roadmap: Invalid Gemini API Key. Please check your AI Studio Secrets panel.');
      } else {
        alert('Failed to generate roadmap. Please try again.');
      }
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleModeSwitch = (modeId: ModeType) => {
    setActiveMode(modeId);
    setShowUpload(false);
  };

  const [isSending, setIsSending] = useState(false);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim() || isSending) return;

    setIsSending(true);
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setShowUpload(false);

    try {
      let statusLine = '';
      switch (activeMode) {
        case 'teaching': statusLine = 'Breaking down your roadmap concepts step-by-step.'; break;
        case 'notes': statusLine = 'Generating structured notes from your roadmap.'; break;
        default: statusLine = 'Analyzing your request and building your path...'; break;
      }

      const newAiMsgText: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: statusLine
      };
      setMessages(prev => [...prev, newAiMsgText]);

      let componentData: any = null;
      let aiResponseText = '';
      let context = currentRoadmap ? `Goal: ${currentRoadmap.goal}. Timeline: ${currentRoadmap.totalDuration}.` : '';
      
      let res;
      if (activeMode === 'roadmap') {
        res = await fetch('/api/roadmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'refine',
            prompt: text,
            currentRoadmap: currentRoadmap
          })
        });
      } else {
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: activeMode,
            text: text,
            context: context
          })
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate response');
      }

      const responseData = await res.json();

      if (activeMode === 'teaching' || activeMode === 'notes') {
        aiResponseText = responseData.text;
      } else if (activeMode === 'roadmap') {
        if (currentRoadmap) {
          const updatedRoadmap: RoadmapData = {
            ...currentRoadmap,
            totalPhases: responseData.nodes?.length || currentRoadmap.totalPhases,
            totalDuration: responseData.totalDuration || currentRoadmap.totalDuration,
            nodes: (responseData.nodes || []).map((n: any, i: number) => {
              const existingNode = currentRoadmap.nodes.find(en => en.title === n.title);
              return {
                id: i + 1,
                title: n.title,
                duration: n.duration,
                status: existingNode ? existingNode.status : (i === 0 ? 'in-progress' : 'locked'),
                progress: existingNode ? existingNode.progress : (i === 0 ? 10 : 0),
                objectives: n.objectives || [],
                impact: n.impact || ''
              };
            })
          };
          setCurrentRoadmap(updatedRoadmap);
          setRoadmapHistory(prev => prev.map(r => r.id === updatedRoadmap.id ? updatedRoadmap : r));
          componentData = updatedRoadmap;
        }
      }

      const newAiMsgComp: Message = {
        id: (Date.now() + 2).toString(),
        role: 'ai',
        ...(activeMode === 'roadmap' ? { component: 'roadmap', data: componentData } : { text: aiResponseText })
      };
      
      setMessages(prev => {
        // Remove the status line message
        const filtered = prev.filter(m => m.id !== newAiMsgText.id);
        return [...filtered, newAiMsgComp];
      });

      // Save chat history
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: newUserMsg, aiMessage: newAiMsgComp, roadmapId: currentRoadmap?.id })
      });

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        text: 'Sorry, I encountered an error processing your request. Please try again.'
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const startNewRoadmap = () => {
    setHasRoadmap(false);
    setIsCreatingRoadmap(true);
    setMessages([]);
    setRoadmapGoal('');
    setRoadmapTimeline('');
    setRoadmapHours('');
  };

  const loadRoadmap = async (id: string) => {
    const selected = roadmapHistory.find(r => r.id === id);
    if (selected) {
      setCurrentRoadmap(selected);
      setHasRoadmap(true);
      setIsCreatingRoadmap(false);
      setActiveMode('roadmap');
      
      try {
        const res = await fetch(`/api/chat?roadmapId=${id}`);
        if (res.ok) {
          const chatData = await res.json();
          if (chatData.length > 0) {
            const formattedMessages: Message[] = chatData.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              text: msg.content,
              component: msg.mode as ComponentType,
              data: msg.data,
            }));
            
            // Check if there's already a roadmap component in the history
            const hasRoadmapComponent = formattedMessages.some(m => m.component === 'roadmap');
            
            if (!hasRoadmapComponent) {
              setMessages([
                {
                  id: Date.now().toString(),
                  role: 'ai',
                  text: `Loaded your roadmap for: ${selected.goal}`,
                },
                {
                  id: (Date.now() + 1).toString(),
                  role: 'ai',
                  component: 'roadmap'
                },
                ...formattedMessages
              ]);
            } else {
              setMessages(formattedMessages);
            }
          } else {
            setMessages([
              {
                id: Date.now().toString(),
                role: 'ai',
                text: `Loaded your roadmap for: ${selected.goal}`,
              },
              {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                component: 'roadmap'
              }
            ]);
          }
        }
      } catch (error) {
        // Handle error silently
      }
    }
  };

  const modes = [
    { id: 'roadmap', label: 'Roadmap Mode', icon: Map },
    { id: 'teaching', label: 'Teaching Mode', icon: BookOpen },
    { id: 'notes', label: 'Notes Mode', icon: FileText },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="h-screen w-full flex flex-col relative bg-[#030305] overflow-hidden"
    >
      <Navbar 
        onOpenHistory={() => setIsHistoryOpen(true)} 
        userData={userData}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pt-24 pb-48 px-4 md:px-8 scroll-smooth">
        <div className="max-w-5xl mx-auto h-full flex flex-col">
          
          {!hasRoadmap && !isCreatingRoadmap && (
            /* First Dashboard Experience */
            <div className="flex-1 flex flex-col justify-center items-start py-12 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mb-12"
              >
                <h1 className="text-5xl md:text-6xl font-display font-semibold mb-6 text-white tracking-tight leading-tight">
                  Hi {userData.name || 'Explorer'},<br/>
                  <span className="text-gray-500">What should we build today?</span>
                </h1>
                <p className="text-gray-400 text-lg md:text-xl font-light">
                  Planix AI is ready to architect your growth.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Button 
                  onClick={() => setIsCreatingRoadmap(true)}
                  className="w-auto px-8 py-4"
                >
                  <span className="font-medium text-white tracking-wide">Create Learning Roadmap</span>
                  <ArrowRight className="w-5 h-5 text-white ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </div>
          )}

          {isCreatingRoadmap && (
            /* Roadmap Creation Flow */
            <div className="flex-1 flex flex-col justify-center items-center py-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-lg glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl border border-white/10"
              >
                <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />
                
                <div className="relative z-10">
                  <div className="mb-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-3 text-white tracking-tight">
                      Design Your Learning Journey
                    </h2>
                    <p className="text-gray-500 text-sm font-light">Tell us your goal. AI will map the path.</p>
                  </div>

                  <form onSubmit={handleGenerateRoadmap} className="space-y-8">
                    <div className="space-y-6">
                      {/* Goal Input */}
                      <Input
                        id="roadmapGoal"
                        type="text"
                        required
                        value={roadmapGoal}
                        onChange={(e) => setRoadmapGoal(e.target.value)}
                        placeholder="What’s your primary learning goal?"
                        label="What’s your primary learning goal?"
                      />

                      {/* Timeline */}
                      <Input
                        id="roadmapTimeline"
                        type="text"
                        required
                        value={roadmapTimeline}
                        onChange={(e) => setRoadmapTimeline(e.target.value)}
                        placeholder="By when do you want to achieve it?"
                        label="By when do you want to achieve it?"
                      />

                      {/* Hours */}
                      <Input
                        id="roadmapHours"
                        type="number"
                        required
                        min="1"
                        max="24"
                        value={roadmapHours}
                        onChange={(e) => setRoadmapHours(e.target.value)}
                        placeholder="How much time can you dedicate each day?"
                        label="How much time can you dedicate each day?"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={!roadmapGoal || !roadmapTimeline || !roadmapHours || isGeneratingRoadmap}
                      className="mt-4"
                    >
                      <span className="font-semibold text-white tracking-wide">
                        {isGeneratingRoadmap ? 'Generating...' : 'Generate Roadmap'}
                      </span>
                      {!isGeneratingRoadmap && <ArrowRight className="w-5 h-5 text-white ml-2 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}

          {hasRoadmap && (
            /* Chat Feed / Mission Control */
            <div className="space-y-10">
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'user' ? (
                    <div className="bg-white/5 border border-white/10 text-gray-200 rounded-2xl px-6 py-3.5 max-w-[85%] md:max-w-[70%] shadow-sm font-light whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="w-full flex flex-col gap-5">
                      {msg.text && (
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_15px_rgba(0,112,243,0.4)]">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <div className="pt-1 text-gray-200 text-lg font-light tracking-wide leading-relaxed w-full overflow-hidden">
                            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl max-w-none whitespace-pre-wrap space-y-3">
                              <Markdown>{msg.text}</Markdown>
                            </div>
                          </div>
                        </div>
                      )}

                      {msg.component && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                          className="w-full mt-2"
                        >
                          <div className="glass-card border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl bg-[#0a0a0c]/50">
                            {msg.component === 'roadmap' && currentRoadmap && <Roadmap data={currentRoadmap} />}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Input Area - ONLY SHOW IF HAS ROADMAP */}
      {hasRoadmap && (
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[#030305] via-[#030305] to-transparent pt-20 pb-8 px-4 md:px-8 z-30 pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            
            {/* Input Box */}
            <div className="relative flex items-end gap-2 bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-2.5 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
              
              {/* Upload & Modes Menu */}
              <AnimatePresence>
                {showUpload && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full left-0 mb-3 w-64 glass-card border border-white/10 rounded-2xl p-3 flex flex-col gap-4 shadow-2xl"
                  >
                    {/* Section 1: Upload */}
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Upload</h4>
                      <div className="flex flex-col gap-1">
                        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm text-gray-300 hover:text-white transition-colors text-left group">
                          <ImageIcon className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" /> 
                          <span>Upload Image</span>
                        </button>
                        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm text-gray-300 hover:text-white transition-colors text-left group">
                          <FileType2 className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" /> 
                          <span className="flex-1">Upload Document</span>
                          <span className="text-[10px] text-gray-500">PDF, DOCX</span>
                        </button>
                      </div>
                    </div>

                    <div className="h-px w-full bg-white/10" />

                    {/* Section 2: AI Modes */}
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">AI Modes</h4>
                      <div className="flex flex-col gap-1">
                        {modes.map(mode => {
                          const Icon = mode.icon;
                          const isActive = activeMode === mode.id;
                          return (
                            <button 
                              key={mode.id}
                              onClick={() => handleModeSwitch(mode.id)}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left group ${
                                isActive ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-gray-300 hover:text-white'
                              }`}
                            >
                              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'} transition-colors`} /> 
                              <span>{mode.label}</span>
                              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={() => setShowUpload(!showUpload)}
                className={`p-4 rounded-2xl transition-colors shrink-0 ${showUpload ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
              >
                <Plus className={`w-5 h-5 transition-transform duration-300 ${showUpload ? 'rotate-45' : 'rotate-0'}`} />
              </button>

              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(inputValue);
                  }
                }}
                className="flex-1 bg-transparent resize-none max-h-32 min-h-[52px] py-4 px-3 text-white outline-none placeholder:text-gray-500 text-sm md:text-base font-light" 
                placeholder={
                  activeMode === 'teaching' ? 'Ask AI to explain this concept...' :
                  activeMode === 'notes' ? 'Generate notes from roadmap...' :
                  'Refine roadmap, ask AI to teach, or create anything...'
                }
                rows={1}
              />

              <button 
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim() || isSending}
                className={`p-4 rounded-2xl transition-all shrink-0 ${
                  inputValue.trim() && !isSending
                    ? 'bg-gradient-primary text-white shadow-[0_0_15px_rgba(0,112,243,0.4)]' 
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlays */}
      <AnimatePresence>
        {isHistoryOpen && (
          <HistoryDrawer 
            onClose={() => setIsHistoryOpen(false)} 
            onNewChat={startNewRoadmap}
            onSelectChat={loadRoadmap}
            history={roadmapHistory}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
