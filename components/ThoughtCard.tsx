
import React from 'react';
import { Clock, Tag, Sparkles, Trash2, Heart, Share2 } from 'lucide-react';
import { Thought } from '../types';

interface ThoughtCardProps {
  thought: Thought;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onClick: (thought: Thought) => void;
}

const moodColors: Record<string, string> = {
  'Calm': 'bg-teal-500',
  'Anxious': 'bg-amber-500',
  'Inspired': 'bg-indigo-500',
  'Reflective': 'bg-purple-500',
  'Happy': 'bg-rose-400',
  'default': 'bg-slate-300'
};

const moodBg: Record<string, string> = {
  'Calm': 'bg-teal-50/30 border-teal-100/50',
  'Anxious': 'bg-amber-50/30 border-amber-100/50',
  'Inspired': 'bg-indigo-50/30 border-indigo-100/50',
  'Reflective': 'bg-purple-50/30 border-purple-100/50',
  'Happy': 'bg-rose-50/30 border-rose-100/50',
  'default': 'bg-white border-slate-100'
};

export const ThoughtCard: React.FC<ThoughtCardProps> = ({ thought, onDelete, onToggleFavorite, onClick }) => {
  const currentMoodColor = moodColors[thought.mood || 'default'] || moodColors['default'];
  const currentMoodBg = moodBg[thought.mood || 'default'] || moodBg['default'];

  return (
    <div 
      onClick={() => onClick(thought)}
      className={`group relative flex flex-col p-7 rounded-[2.5rem] border hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer ${currentMoodBg}`}
    >
      {/* Mood Accent Tag */}
      <div className={`absolute top-8 -left-1 w-1 h-8 rounded-full ${currentMoodColor}`} />

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-white/80 rounded-xl shadow-sm border border-slate-50">
              <Clock size={14} className="text-slate-400" />
           </div>
           <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(thought.createdAt).toLocaleDateString('zh-CN')}</p>
              {thought.mood && (
                <p className="text-[10px] font-bold text-slate-600 uppercase mt-0.5">{thought.mood}</p>
              )}
           </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(thought.id); }}
            className={`p-2 rounded-full transition-colors ${thought.isFavorite ? 'text-rose-500 bg-rose-50' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'}`}
          >
            <Heart size={16} fill={thought.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(thought.id); }}
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 mb-6">
        <p className="text-slate-700 text-lg leading-relaxed font-serif font-medium line-clamp-4">
          {thought.content}
        </p>
      </div>

      {thought.summary && (
        <div className="mb-6 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={12} className="text-indigo-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">AI 极简总结</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed italic">
            {thought.summary}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-auto">
        {thought.tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1.5 text-[10px] font-bold bg-white text-slate-500 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm uppercase tracking-wide">
            <Tag size={10} className="text-slate-300" />
            {tag}
          </span>
        ))}
        {thought.tags.length === 0 && (
           <span className="text-[10px] text-slate-300 font-bold uppercase">无标签</span>
        )}
      </div>
    </div>
  );
};
