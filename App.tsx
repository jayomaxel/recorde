
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { ThoughtCard } from './components/ThoughtCard';
import { Editor } from './components/Editor';
import { storage } from './services/storage';
import { Thought, AIAnalysisResult } from './types';
// Fixed: Added missing Plus and Search icons to the import list
import { Cloud, Sunrise, Sparkle, Filter, Plus, Search } from 'lucide-react';

const App: React.FC = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, fav, stats, inspire
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingThought, setEditingThought] = useState<Thought | undefined>();

  useEffect(() => {
    setThoughts(storage.getThoughts());
  }, []);

  const filteredThoughts = useMemo(() => {
    let result = thoughts;

    if (activeFilter === 'fav') {
      result = result.filter(t => t.isFavorite);
    }

    const query = searchQuery.toLowerCase();
    if (query) {
      result = result.filter(t => 
        t.content.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (t.mood && t.mood.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [thoughts, searchQuery, activeFilter]);

  const handleSaveThought = (content: string, aiResult: AIAnalysisResult | null) => {
    const newThought: Thought = editingThought ? {
      ...editingThought,
      content,
      aiInsight: aiResult?.wisdom || editingThought.aiInsight,
      summary: aiResult?.summary || editingThought.summary,
      tags: aiResult?.tags || editingThought.tags,
      mood: aiResult?.mood || editingThought.mood,
    } : {
      id: Date.now().toString(),
      content,
      createdAt: Date.now(),
      tags: aiResult?.tags || [],
      aiInsight: aiResult?.wisdom,
      summary: aiResult?.summary,
      mood: aiResult?.mood,
      isFavorite: false,
    };

    if (editingThought) {
      storage.updateThought(newThought);
    } else {
      storage.addThought(newThought);
    }

    setThoughts(storage.getThoughts());
    setIsEditorOpen(false);
    setEditingThought(undefined);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条思绪吗？')) {
      storage.deleteThought(id);
      setThoughts(storage.getThoughts());
    }
  };

  const handleToggleFavorite = (id: string) => {
    storage.toggleFavorite(id);
    setThoughts(storage.getThoughts());
  };

  const handleEdit = (thought: Thought) => {
    setEditingThought(thought);
    setIsEditorOpen(true);
  };

  return (
    <Layout 
      onNewClick={() => { setEditingThought(undefined); setIsEditorOpen(true); }}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      activeFilter={activeFilter}
      setActiveFilter={setActiveFilter}
    >
      {activeFilter === 'stats' ? (
        <div className="h-full flex items-center justify-center">
           <div className="text-center space-y-4 max-w-sm">
              <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] mx-auto flex items-center justify-center text-indigo-400">
                <Filter size={32} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-800">心境统计正在构建</h2>
              <p className="text-slate-400 text-sm">未来这里将展示你本周的情绪趋势、高频词云以及思绪密度图。</p>
           </div>
        </div>
      ) : thoughts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <div className="relative group">
              <div className="absolute inset-0 bg-indigo-100 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="bg-white p-12 rounded-[4rem] relative shadow-2xl shadow-slate-100 border border-slate-50 rotate-3 group-hover:rotate-0 transition-transform">
                 <Cloud className="text-indigo-400/20" size={100} />
                 <Sparkle className="absolute top-8 right-8 text-amber-300 animate-pulse" size={32} />
              </div>
           </div>
           <div className="max-w-md mx-auto">
              <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4 tracking-tight">捕捉第一个灵光...</h2>
              <p className="text-slate-400 leading-relaxed font-medium">
                不要让思绪随风而逝。在这里，每一个微小的念头都会被温柔收藏，并生长出意想不到的见解。
              </p>
           </div>
           <button
             onClick={() => setIsEditorOpen(true)}
             className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-2xl shadow-slate-200 hover:scale-[1.05] active:scale-95 transition-all"
           >
             现在就开始书写
           </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-12 gap-6">
             <div>
                <h2 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">
                  {activeFilter === 'fav' ? '心动片段' : '思绪之河'}
                </h2>
                <div className="flex items-center gap-3 mt-3">
                   <div className="h-1 w-8 bg-indigo-500 rounded-full" />
                   <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.15em]">Captured {filteredThoughts.length} Moments</p>
                </div>
             </div>
             
             <div className="flex items-center gap-4 bg-white/50 p-2 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase pl-3 pr-2 border-r border-slate-100">Quick Actions</span>
                <button onClick={() => setIsEditorOpen(true)} className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 transition-colors">
                   <Plus size={18} />
                </button>
             </div>
          </div>

          {filteredThoughts.length === 0 ? (
             <div className="py-32 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] mx-auto flex items-center justify-center text-slate-200 mb-6">
                  <Search size={24} />
                </div>
                <p className="text-slate-400 font-medium font-serif italic">“在寂静中，未曾寻得那丝痕迹。”</p>
                <p className="text-xs text-slate-300 mt-2 uppercase tracking-widest">试试换个搜索词</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredThoughts.map((thought) => (
                <ThoughtCard
                  key={thought.id}
                  thought={thought}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onClick={handleEdit}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {isEditorOpen && (
        <Editor
          thought={editingThought}
          onSave={handleSaveThought}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </Layout>
  );
};

export default App;
