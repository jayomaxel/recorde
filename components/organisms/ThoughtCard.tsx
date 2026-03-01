
import React from 'react';
import { Tag, Trash2, Heart } from 'lucide-react';
import { Thought } from '../../types';
import { storage } from '../../services/storage';

interface ThoughtCardProps {
  thought: Thought;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onClick?: (thought: Thought) => void;
}

const moodColors: Record<string, string> = {
  'Calm': 'bg-emerald-600',
  'Anxious': 'bg-stone-400',
  'Inspired': 'bg-black',
  'Reflective': 'bg-indigo-900',
  'Happy': 'bg-orange-500',
  'default': 'bg-zinc-200'
};

export const ThoughtCard: React.FC<ThoughtCardProps> = ({ thought, onDelete, onToggleFavorite, onClick }) => {
  const moodColor = moodColors[thought.mood || 'default'] || moodColors['default'];
  const settings = storage.getSettings();

  return (
    <div
      onClick={() => onClick?.(thought)}
      className={`group flex flex-col w-full h-[320px] p-8 bg-white border border-black/10 transition-all duration-300 relative rounded-2xl shadow-sm ${onClick ? 'cursor-pointer hover:border-black/40 hover:shadow-xl hover:-translate-y-1' : ''}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <span className="mono text-[10px] text-zinc-300 font-medium tracking-tighter">
            {new Date(thought.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.')} · {new Date(thought.createdAt).getHours().toString().padStart(2, '0')}:{new Date(thought.createdAt).getMinutes().toString().padStart(2, '0')}
          </span>
          {thought.mood && settings.isAiEnabled && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{thought.mood}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(thought.id); }}
            className={`p-1 transition-colors ${thought.isFavorite ? 'text-rose-500' : 'text-zinc-300 hover:text-black'}`}
          >
            <Heart size={14} fill={thought.isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(thought.id); }}
            className="p-1 text-zinc-300 hover:text-black transition-colors"
          >
            <Trash2 size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="flex-1 mb-4 flex items-center overflow-hidden">
        <p className="font-serif leading-relaxed text-zinc-800 text-lg line-clamp-5">
          {thought.content}
        </p>
      </div>

      {thought.tags && thought.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-6">
          {thought.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
              # {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};