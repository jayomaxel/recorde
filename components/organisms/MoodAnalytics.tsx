
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Thought } from '../../types';
import { Sparkles, Activity, Cloud, Sun, Wind, Compass, Terminal, Zap, Fingerprint } from 'lucide-react';
import { streamDeepInsight } from '../../services/gemini';

interface MoodAnalyticsProps {
  thoughts: Thought[];
}

const moodMeta: Record<string, { label: string, color: string, icon: any, desc: string }> = {
  'Calm': { label: '宁静', color: 'bg-emerald-400', icon: Wind, desc: '心境如止水，意识在平静中深潜。' },
  'Happy': { label: '喜悦', color: 'bg-orange-400', icon: Sun, desc: '内在的太阳正在升起，生命力蓬勃。' },
  'Anxious': { label: '焦虑', color: 'bg-zinc-400', icon: Activity, desc: '细碎的波澜，暗示着潜意识的躁动。' },
  'Inspired': { label: '灵感', color: 'bg-black', icon: Sparkles, desc: '星火击中暗夜，创造力的电光。' },
  'Reflective': { label: '反思', color: 'bg-indigo-400', icon: Cloud, desc: '回望来时路，在静默中重塑自我。' },
  'default': { label: '平淡', color: 'bg-zinc-200', icon: Compass, desc: '此时此刻，无风无浪。' }
};

export const MoodAnalytics: React.FC<MoodAnalyticsProps> = ({ thoughts }) => {
  const [insight, setInsight] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    thoughts.forEach(t => { counts[t.mood || 'default'] = (counts[t.mood || 'default'] || 0) + 1; });
    return counts;
  }, [thoughts]);

  const dominantMood = useMemo(() => {
    let max = 0; let mood = 'default';
    Object.entries(stats).forEach(([m, count]) => { if (count > max) { max = count; mood = m; } });
    return mood;
  }, [stats]);

  const moodInfo = moodMeta[dominantMood] || moodMeta['default'];

  // Auto-scroll logic when insight updates
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [insight]);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setInsight("");
    setIsGenerating(true);
    await streamDeepInsight(thoughts, (text) => setInsight(text));
    setIsGenerating(false);
  };

  return (
    <div className="h-full w-full flex flex-col p-6 md:p-8 space-y-6 overflow-hidden bg-[#FCFAF7] animate-in fade-in duration-700">
      
      {/* ── Top Dashboard: Compact Atmosphere ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 shrink-0">
        <div className="lg:col-span-8 relative p-8 overflow-hidden rounded-[24px] bg-white border border-black/5 shadow-sm flex items-center gap-8">
            <div className={`absolute -top-20 -left-20 w-64 h-64 blur-[100px] opacity-10 rounded-full ${moodInfo.color}`} />
            <div className={`p-3 rounded-xl ${moodInfo.color} text-white shrink-0`}>
              <moodInfo.icon size={24} />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-serif font-bold italic text-zinc-800 mb-1">
                “月度心境定格为 {moodInfo.label}”
              </h2>
              <p className="text-zinc-400 font-serif italic text-xs">
                基于 {thoughts.length} 段记录：{moodInfo.desc}
              </p>
            </div>
        </div>

        <div className="lg:col-span-4 p-8 rounded-[24px] bg-black text-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Fingerprint size={80} /></div>
            <div className="relative z-10">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-2">Data Statistics</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats).map(([mood, count]) => (
                  <span key={mood} className="px-2 py-0.5 bg-white/10 rounded-full text-[8px] font-bold uppercase tracking-widest text-zinc-100">
                    {moodMeta[mood]?.label || mood} · {count}
                  </span>
                ))}
              </div>
            </div>
        </div>
      </div>

      {/* ── Center: Deep Analysis Section (Takes remaining space) ──────── */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-4 px-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center text-white">
              <Terminal size={12} />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-800">心理分析报告</h3>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${isGenerating ? 'bg-zinc-100 text-zinc-400' : 'bg-black text-white hover:scale-105 active:scale-95 shadow-lg'}`}
          >
            {isGenerating ? <Zap size={10} className="animate-pulse" /> : <Sparkles size={10} />}
            {isGenerating ? '分析中...' : '生成分析'}
          </button>
        </div>

        <div className="flex-1 min-h-0 rounded-[24px] bg-white border border-black/5 shadow-inner relative flex flex-col group overflow-hidden">
          {/* Scrollable Output Container */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto custom-scrollbar p-10 md:p-12 scroll-smooth"
          >
            <div className="max-w-2xl mx-auto min-h-full flex items-center">
                {!insight && !isGenerating ? (
                <div className="w-full text-center space-y-3">
                    <p className="text-zinc-300 font-serif italic text-base">“等待授权读取历史思绪”</p>
                    <p className="text-zinc-300 font-serif italic text-xs leading-relaxed">点击上方按钮，开启由 AI 驱动的深度心理状态建模。</p>
                </div>
                ) : (
                <div className="w-full space-y-6 py-2 animate-in fade-in duration-1000">
                    <div className="font-serif text-lg md:text-xl leading-[2] text-zinc-800 whitespace-pre-wrap">
                    {insight}
                    {isGenerating && <span className="inline-block w-1 h-5 bg-black ml-1 animate-pulse align-middle" />}
                    </div>
                </div>
                )}
            </div>
          </div>
          
          {/* Bottom metadata - Compact */}
          <div className="px-8 py-4 border-t border-black/[0.02] flex items-center justify-center gap-3 bg-[#FCFAF7]/30 shrink-0">
            <span className="text-[7px] font-bold text-zinc-300 uppercase tracking-[0.3em]">Neural Analyzer v2.0</span>
            <div className="w-6 h-[1px] bg-zinc-100" />
            <span className="text-[7px] font-bold text-zinc-300 uppercase tracking-[0.3em]">Local Data Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
};
