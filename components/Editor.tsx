
import React, { useState } from 'react';
import { X, Check, Loader2, Sparkles, Wand2, Quote, Fingerprint } from 'lucide-react';
import { Thought } from '../types';
import { analyzeThought } from '../services/gemini';

interface EditorProps {
  thought?: Thought;
  onSave: (content: string, aiData: any) => void;
  onClose: () => void;
}

const moods = ['Calm', 'Happy', 'Anxious', 'Inspired', 'Reflective'];

export const Editor: React.FC<EditorProps> = ({ thought, onSave, onClose }) => {
  const [content, setContent] = useState(thought?.content || '');
  const [selectedMood, setSelectedMood] = useState(thought?.mood || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(thought?.aiInsight || null);

  const handleManualAnalyze = async () => {
    if (!content.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    const result = await analyzeThought(content);
    if (result) {
       setAiInsight(result.wisdom);
       if (!selectedMood) setSelectedMood(result.mood);
    }
    setIsAnalyzing(false);
  };

  const handleSave = async () => {
    if (!content.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    const result = await analyzeThought(content);
    onSave(content, result);
    setIsAnalyzing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl shadow-indigo-200/20 overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[75vh] animate-in zoom-in-95 duration-500 border border-white/50">
        
        {/* Editor Area */}
        <div className="flex-1 flex flex-col p-8 md:p-14">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">
                {thought ? '思绪回响' : '倾听内心'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
                <Fingerprint size={12} />
                {thought ? '正在回顾已存片段' : '正在捕捉新的瞬间'}
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:rotate-90">
              <X size={20} />
            </button>
          </div>

          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="此刻，你的世界里正在发生什么？"
            className="flex-1 w-full text-xl leading-relaxed text-slate-700 bg-transparent border-none resize-none focus:ring-0 placeholder:text-slate-200 font-serif"
          />

          <div className="mt-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">设定你的基调</p>
            <div className="flex flex-wrap gap-2 mb-10">
              {moods.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMood(m)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedMood === m 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={!content.trim() || isAnalyzing}
                className="flex-1 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                保存这一刻
              </button>
              <button
                onClick={handleManualAnalyze}
                disabled={!content.trim() || isAnalyzing}
                className="px-6 py-4 bg-white text-slate-700 rounded-2xl hover:bg-slate-50 transition-all border border-slate-200 flex items-center gap-2 group shadow-sm"
                title="获取 AI 见解"
              >
                <Sparkles size={20} className="text-amber-500 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="w-full md:w-80 bg-[#FBFBFC] border-l border-slate-100 p-8 md:p-12 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-indigo-900">
            <Wand2 size={120} />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-10 relative z-10">
            <Sparkles size={14} />
            Ethereal Insight
          </div>

          <div className="flex-1 relative z-10">
            {isAnalyzing ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-4/5"></div>
                <div className="h-32 bg-slate-100 rounded-3xl w-full"></div>
              </div>
            ) : aiInsight ? (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="relative">
                  <Quote size={24} className="text-indigo-100 absolute -top-4 -left-4" />
                  <p className="text-base text-slate-600 leading-relaxed font-serif font-medium italic relative">
                    {aiInsight}
                  </p>
                </div>
                
                <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                    <p className="text-[10px] text-indigo-400 font-bold mb-3 uppercase tracking-widest">内省指引</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      这则思绪是否让你联想到了最近发生的其它事情？试着去感受其中隐藏的情绪。
                    </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-6">
                <div className="w-16 h-16 bg-white rounded-[2rem] shadow-sm flex items-center justify-center border border-slate-50">
                   <Wand2 size={24} className="text-slate-200" />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-700 mb-2 font-serif">准备好探索了吗？</p>
                   <p className="text-xs text-slate-400 leading-relaxed">捕捉你的想法，让 AI 为你编织更深层的理解。每一个念头都是灵魂的碎片。</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto pt-8 border-t border-slate-100 text-[10px] text-slate-300 font-bold uppercase tracking-widest relative z-10">
             Captured in Reality
          </div>
        </div>
      </div>
    </div>
  );
};
