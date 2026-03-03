import React, { useState } from 'react';
import { Thought } from '../../types';
import { ChevronLeft, ChevronRight, Shuffle, Heart, Trash2, Calendar } from 'lucide-react';

interface RandomExplorerProps {
    thoughts: Thought[];
    onDelete: (id: string) => void;
    onToggleFavorite: (id: string) => void;
    onEdit: (thought: Thought) => void;
}

const stickyColors = [
    'bg-[#FFFDF0]',
    'bg-[#F5F9FF]',
    'bg-[#F7FFF5]',
    'bg-[#FFF5F5]',
];

const ITEM_WIDTH = 380; // width of each slot in the rail

export const RandomExplorer: React.FC<RandomExplorerProps> = ({ thoughts, onDelete, onToggleFavorite, onEdit }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => setCurrentIndex(prev => (prev + 1) % thoughts.length);
    const handlePrev = () => setCurrentIndex(prev => (prev - 1 + thoughts.length) % thoughts.length);
    const handleShuffle = () => setCurrentIndex(Math.floor(Math.random() * thoughts.length));

    if (thoughts.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-zinc-300 font-serif italic text-2xl">
                "暂无思绪可供漫游。"
            </div>
        );
    }

    // The offset so the active card is always centered.
    // The rail starts at left:50% (center of screen).
    // We shift left by (currentIndex * ITEM_WIDTH + ITEM_WIDTH/2) to put the
    // center of the current card at the screen center.
    const offset = currentIndex * ITEM_WIDTH + ITEM_WIDTH / 2;

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-[#FCFAF7] select-none relative">

            {/* ── horizontal rope (static, behind everything) ──────── */}
            <div
                className="absolute left-0 right-0 h-[1.5px] bg-zinc-800/15 z-0 pointer-events-none"
                style={{ top: 'calc(50% - 220px)' }}
            />

            {/* ── sliding rail ─────────────────────────────────────── */}
            <div className="absolute inset-0 flex items-center">
                <div
                    className="flex items-start transition-transform duration-700 ease-in-out"
                    style={{
                        // anchor the rail left edge at screen center, then pull left so active card centers
                        position: 'absolute',
                        left: '50%',
                        transform: `translateX(-${offset}px)`,
                    }}
                >
                    {thoughts.map((thought, index) => {
                        const isActive = index === currentIndex;
                        const date = new Date(thought.createdAt);
                        const hh = date.getHours().toString().padStart(2, '0');
                        const mm = date.getMinutes().toString().padStart(2, '0');
                        const color = stickyColors[index % stickyColors.length];

                        return (
                            <div
                                key={thought.id}
                                className="flex flex-col items-center flex-shrink-0"
                                style={{ width: ITEM_WIDTH }}
                            >
                                {/* ── string from rope to hole ── */}
                                <div className="flex flex-col items-center">
                                    <div className="w-px h-16 bg-zinc-400/30" />
                                    {/* The hole (ring) that the rope passes through */}
                                    <div className="w-6 h-6 rounded-full border-2 border-zinc-300 bg-white shadow-inner flex items-center justify-center -mb-3 z-10">
                                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-800/70" />
                                    </div>
                                </div>

                                {/* ── note ── */}
                                <div
                                    onClick={() => isActive && onEdit(thought)}
                                    className={`
                                        w-[310px] h-[350px] ${color} flex flex-col p-7 z-10
                                        border border-black/[0.03] cursor-pointer
                                        transition-all duration-700
                                        ${isActive
                                            ? 'shadow-[0_20px_60px_rgba(0,0,0,0.08)] scale-100 opacity-100'
                                            : 'shadow-none scale-90 opacity-30 pointer-events-none grayscale'}
                                    `}
                                    style={{
                                        clipPath: 'polygon(0 0,100% 0,100% 95%,92% 100%,0 100%)',
                                        rotate: `${index % 2 === 0 ? '0.5deg' : '-0.5deg'}`,
                                    }}
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-center mb-5">
                                        <div className="flex items-center gap-1.5 text-zinc-300">
                                            <Calendar size={10} />
                                            <span className="mono text-[9px] font-bold tracking-widest uppercase">
                                                {date.toLocaleDateString('en-GB').replace(/\//g, '.')} · {hh}:{mm}
                                            </span>
                                        </div>
                                        {thought.mood && (
                                            <span className="text-[9px] mono font-bold text-zinc-300 uppercase tracking-widest">
                                                {thought.mood}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex items-center justify-center overflow-hidden px-2">
                                        <p className="font-serif text-lg italic text-zinc-800 leading-relaxed text-center line-clamp-7">
                                            {thought.content}
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex justify-between items-center pt-5 border-t border-black/[0.03] mt-4">
                                        <div className="flex gap-4">
                                            <button
                                                onClick={e => { e.stopPropagation(); onToggleFavorite(thought.id); }}
                                                aria-label={thought.isFavorite ? '取消收藏' : '收藏'}
                                                title={thought.isFavorite ? '取消收藏' : '收藏'}
                                                className={`transition-colors ${thought.isFavorite ? 'text-rose-500' : 'text-zinc-200 hover:text-rose-400'}`}
                                            >
                                                <Heart size={15} fill={thought.isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
                                            </button>
                                            <button
                                                onClick={e => { e.stopPropagation(); onDelete(thought.id); }}
                                                aria-label="删除当前思绪"
                                                title="删除当前思绪"
                                                className="text-zinc-200 hover:text-black transition-colors"
                                            >
                                                <Trash2 size={15} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                        <span className="mono text-[8px] text-zinc-200 tracking-widest font-bold uppercase">
                                            {index + 1} / {thoughts.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── prev / next buttons ───────────────────────────────── */}
            <button
                onClick={handlePrev}
                aria-label="上一条"
                title="上一条"
                className="absolute left-8 top-1/2 -translate-y-1/2 z-50 p-5 bg-white rounded-full border border-black/5 shadow-xl text-zinc-400 hover:text-black hover:scale-110 active:scale-95 transition-all"
            >
                <ChevronLeft size={26} strokeWidth={1.5} />
            </button>
            <button
                onClick={handleNext}
                aria-label="下一条"
                title="下一条"
                className="absolute right-8 top-1/2 -translate-y-1/2 z-50 p-5 bg-white rounded-full border border-black/5 shadow-xl text-zinc-400 hover:text-black hover:scale-110 active:scale-95 transition-all"
            >
                <ChevronRight size={26} strokeWidth={1.5} />
            </button>

            {/* ── shuffle button ────────────────────────────────────── */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
                <button
                    onClick={handleShuffle}
                    className="flex items-center gap-3 px-10 py-4 bg-black text-white rounded-full hover:bg-zinc-800 shadow-2xl active:scale-95 transition-all group"
                >
                    <Shuffle size={14} className="group-hover:rotate-180 transition-transform duration-700" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em]">时光随机抽选</span>
                </button>
            </div>
        </div>
    );
};
