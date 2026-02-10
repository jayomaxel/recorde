
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { ThoughtCard } from './components/ThoughtCard';
import { Editor } from './components/Editor';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { storage } from './services/storage';
import { Thought, AIAnalysisResult, UserSettings } from './types';
import { Feather, Plus, ArrowDown } from 'lucide-react';

const App: React.FC = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>(storage.getSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingThought, setEditingThought] = useState<Thought | undefined>();

  useEffect(() => {
    setThoughts(storage.getThoughts());
    setUserSettings(storage.getSettings());
  }, []);

  // Strict check for AI stats page
  useEffect(() => {
    if (activeFilter === 'stats' && (!userSettings.isAiEnabled || !userSettings.showMoodTrends)) {
      setActiveFilter('all');
    }
  }, [userSettings.isAiEnabled, userSettings.showMoodTrends, activeFilter]);

  const filteredThoughts = useMemo(() => {
    let result = thoughts;
    if (activeFilter === 'fav') result = result.filter(t => t.isFavorite);
    else if (activeFilter === 'inspire') {
      result = result.filter(t => t.mood === 'Inspired' || (t.tags && t.tags.some(tag => tag.includes('灵感') || tag.includes('idea'))));
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
      mood: aiResult?.mood || editingThought.mood,
    } : {
      id: Date.now().toString(),
      content,
      createdAt: Date.now(),
      tags: [],
      mood: aiResult?.mood,
      isFavorite: false,
    };

    if (editingThought) storage.updateThought(newThought);
    else storage.addThought(newThought);

    setThoughts(storage.getThoughts());
    setIsEditorOpen(false);
    setEditingThought(undefined);
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    storage.saveSettings(newSettings);
    setUserSettings(newSettings);
  };

  const handleOnboardingComplete = (data: Partial<UserSettings>) => {
    const finalSettings = { ...userSettings, ...data, isInitialized: true };
    storage.saveSettings(finalSettings);
    setUserSettings(finalSettings);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要永久移除这段思绪吗？')) {
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

  if (!userSettings.isInitialized) {
    return <OnboardingModal onComplete={handleOnboardingComplete} />;
  }

  return (
    <Layout 
      onNewClick={() => { setEditingThought(undefined); setIsEditorOpen(true); }}
      onSettingsClick={() => setIsSettingsOpen(true)}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      activeFilter={activeFilter}
      setActiveFilter={setActiveFilter}
      userSettings={userSettings}
    >
      <div className="min-h-[calc(100vh-80px)] w-full flex flex-col p-6 md:p-16">
        {activeFilter === 'stats' && userSettings.isAiEnabled && userSettings.showMoodTrends ? (
          <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto text-center">
              <h2 className="text-4xl font-serif italic font-bold mb-6 tracking-tight">趋势正在生长</h2>
              <div className="w-12 h-[1px] bg-black mb-8" />
              <p className="text-zinc-500 font-serif leading-relaxed mb-10">
                通过 AI 分析您的表达，我们正在为您呈现情感起伏的精确图谱。
              </p>
              <div className="flex gap-4">
                 {[4, 10, 6, 8, 3].map((h, i) => (
                   <div key={i} className="w-2 bg-zinc-100 rounded-full flex flex-col justify-end h-16">
                     <div className="w-full bg-black rounded-full" style={{ height: `${h * 10}%` }} />
                   </div>
                 ))}
              </div>
          </div>
        ) : thoughts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-12">
             <div className="w-16 h-16 border-2 border-black/5 flex items-center justify-center rotate-45">
                <Feather className="text-black -rotate-45" size={24} />
             </div>
             <div className="space-y-4">
                <h2 className="text-5xl font-serif font-bold italic tracking-tighter">Silent Mind.</h2>
                <p className="text-zinc-400 font-serif text-lg leading-relaxed">
                  这里尚未有只言片语。在第一道光照进现实之前，所有的思绪都在静候被捕捉。
                </p>
             </div>
             <div className="flex flex-col items-center gap-4">
                <ArrowDown className="text-zinc-200" size={20} />
                <button
                  onClick={() => setIsEditorOpen(true)}
                  className="px-12 py-5 bg-black text-white font-bold text-xs uppercase tracking-[0.3em] hover:bg-zinc-800 active:scale-95"
                >
                  开始书写记录
                </button>
             </div>
          </div>
        ) : (
          <div className="max-w-6xl w-full mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <span className="mono text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Library / Index</span>
                     <div className="h-[1px] w-12 bg-black/10" />
                  </div>
                  <h2 className="text-6xl font-serif font-bold tracking-tighter lowercase">
                    {activeFilter === 'fav' ? 'fragments' : activeFilter === 'inspire' ? 'inspiration' : 'thoughts'}
                    <span className="text-zinc-200 text-3xl ml-2">.</span>
                  </h2>
               </div>
               
               <div className="flex items-center gap-6">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Total: {filteredThoughts.length}</p>
                  <div className="h-8 w-[1px] bg-black/10" />
                  <button 
                    onClick={() => setIsEditorOpen(true)}
                    className="p-3 border border-black hover:bg-black hover:text-white rounded-sm"
                  >
                    <Plus size={18} />
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-100 border border-zinc-100">
              {filteredThoughts.map((thought) => (
                <ThoughtCard
                  key={thought.id}
                  thought={thought}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onClick={handleEdit}
                />
              ))}
              {filteredThoughts.length === 0 && (
                 <div className="col-span-2 py-40 bg-white text-center">
                    <p className="text-zinc-300 font-serif italic">“寻觅已尽，未见归人。”</p>
                 </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isEditorOpen && (
        <Editor
          thought={editingThought}
          onSave={handleSaveThought}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal 
          settings={userSettings}
          onSave={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </Layout>
  );
};

export default App;