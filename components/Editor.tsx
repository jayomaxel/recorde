
import React, { useState } from 'react';
import { X, Loader2, ArrowRight } from 'lucide-react';
import { Thought } from '../types';
import { analyzeThought } from '../services/gemini';
import { storage } from '../services/storage';

interface EditorProps {
  thought?: Thought;
  onSave: (content: string, aiData: any) => void;
  onClose: () => void;
}

const moods = ['Calm', 'Happy', 'Anxious', 'Inspired', 'Reflective'];

export const Editor: React.FC<EditorProps> = ({ thought, onSave, onClose }) => {
  const settings = storage.getSettings();
  const [content, setContent] = useState(thought?.content || '');
  const [selectedMood, setSelectedMood] = useState(thought?.mood || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSave = async () => {
    if (!content.trim() || isAnalyzing) return;
    
    let aiResult = null;
    if (settings.isAiEnabled) {
      setIsAnalyzing(true);
      aiResult = await analyzeThought(content);
      setIsAnalyzing(false);
    }
    
    onSave(content, aiResult);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white shadow-2xl flex flex-col h-full md:h-[70vh] overflow-hidden">
        
        <div className="flex-1 flex flex-col p-10 md:p-16">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
               <span className="mono text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Thought / Composition</span>
               <div className="h-[1px] w-8 bg-zinc-200" />
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-black">
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="开始记录你的思绪..."
            className="flex-1 w-full text-2xl leading-[1.6] text-zinc-800 bg-transparent border-none resize-none focus:ring-0 placeholder:text-zinc-100 font-serif"
          />

          <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-8 pt-8 border-t border-zinc-50">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Manual Tone (Optional)</p>
              <div className="flex flex-wrap gap-2">
                {moods.map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedMood(m)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border ${
                      selectedMood === m 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-zinc-300 border-zinc-100 hover:border-zinc-300 hover:text-zinc-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!content.trim() || isAnalyzing}
              className="px-8 py-4 bg-black text-white flex items-center justify-center gap-3 hover:bg-zinc-800 disabled:opacity-30 group min-w-[160px]"
            >
              {isAnalyzing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <span className="font-bold text-xs uppercase tracking-[0.2em]">存档思绪</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
