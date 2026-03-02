
import React, { useState, useEffect, useMemo } from 'react';
import { Menu, Heart, Coffee, BarChart2, Plus } from 'lucide-react';

// Organisms
import { ThoughtCard } from './components/organisms/ThoughtCard';
import { Editor } from './components/organisms/Editor';
import { SettingsModal } from './components/organisms/SettingsModal';
import { OnboardingModal } from './components/organisms/OnboardingModal';
import { PrivacyLock } from './components/organisms/PrivacyLock';
import { RandomExplorer } from './components/organisms/RandomExplorer';
import { Sidebar } from './components/organisms/Sidebar';
import { Header } from './components/organisms/Header';
import { MoodAnalytics } from './components/organisms/MoodAnalytics';

// Templates
import { DashboardTemplate } from './components/templates/DashboardTemplate';

// Services & Types
import { storage } from './services/storage';
import { Thought, UserSettings } from './types';
import { Feather, ArrowDown } from 'lucide-react';

const App: React.FC = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>(storage.getSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingThought, setEditingThought] = useState<Thought | undefined>();
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    setThoughts(storage.getThoughts());
    setUserSettings(storage.getSettings());
  }, []);

  const navItems = [
    { id: 'all', label: '全部记录', icon: Menu },
    { id: 'fav', label: '心动收藏', icon: Heart },
    { id: 'random', label: '随机漫游', icon: Coffee },
    ...(userSettings.isAiEnabled && userSettings.showMoodTrends ? [{ id: 'stats', label: '心境趋势', icon: BarChart2 }] : []),
  ];

  const filteredThoughts = useMemo(() => {
    let result = thoughts;
    if (activeFilter === 'fav') result = result.filter(t => t.isFavorite);
    const query = searchQuery.toLowerCase();
    if (query) {
      result = result.filter(t =>
        t.content.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return result;
  }, [thoughts, activeFilter, searchQuery]);

  const handleSaveThought = (content: string, aiResult: any) => {
    if (editingThought) {
      const updated = storage.updateThought(editingThought.id, content, aiResult);
      setThoughts(prev => prev.map(t => t.id === updated.id ? updated : t));
    } else {
      const created = storage.saveThought(content, aiResult);
      setThoughts(prev => [created, ...prev]);
    }
    setIsEditorOpen(false);
    setEditingThought(undefined);
  };

  const handleDelete = (id: string) => {
    storage.deleteThought(id);
    setThoughts(prev => prev.filter(t => t.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    const updated = storage.toggleFavorite(id);
    setThoughts(prev => prev.map(t => t.id === id ? updated : t));
  };

  const handleEdit = (thought: Thought) => {
    setEditingThought(thought);
    setIsEditorOpen(true);
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    storage.saveSettings(newSettings);
    setUserSettings(newSettings);
    setIsSettingsOpen(false);
  };

  if (isLocked && userSettings.password) {
    return <PrivacyLock onUnlock={() => setIsLocked(false)} correctPin={userSettings.password} />;
  }

  if (!userSettings.isInitialized) {
    return <OnboardingModal onComplete={handleUpdateSettings} />;
  }

  return (
    <DashboardTemplate
      sidebar={
        <Sidebar
          title="Ethereal"
          navItems={navItems}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      }
      header={
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          userSettings={userSettings}
          onProfileClick={() => setIsSettingsOpen(true)}
        />
      }
    >
      {/* RandomExplorer needs full height — render outside the padded wrapper */}
      {activeFilter === 'random' ? (
        <RandomExplorer
          thoughts={thoughts}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
          onEdit={handleEdit}
        />
      ) : activeFilter === 'stats' ? (
        <MoodAnalytics thoughts={thoughts} />
      ) : (
        <div className="px-8 md:px-12 flex flex-col min-h-full">
          <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
            {/* Sticky Header: Optimized Whitespace */}
            <div className="sticky top-0 z-20 bg-[#FCFAF7]/80 backdrop-blur-md pt-4 md:pt-6 pb-6 mb-8 border-b border-black/5 flex justify-between items-end min-h-[120px]">
              <h2 className="text-6xl font-serif font-bold tracking-tighter lowercase leading-none">
                {activeFilter === 'fav' ? 'fragments' : 'thoughts'}
                <span className="text-zinc-200 ml-2">.</span>
              </h2>
              <button
                onClick={() => setIsEditorOpen(true)}
                className="w-12 h-12 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-all rounded-full shrink-0 mb-1"
              >
                <Plus size={24} />
              </button>
            </div>

            {/* List or Empty State */}
            {filteredThoughts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in fade-in">
                <Feather size={48} className="text-zinc-200" />
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif font-bold italic">No {activeFilter === 'fav' ? 'fragments' : 'thoughts'}.</h2>
                  <p className="text-zinc-400">
                    {activeFilter === 'fav' ? '您还没有收藏任何思绪片段。' : '开始记录您的第一条思绪...'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-12">
                {filteredThoughts.map(thought => (
                  <div key={thought.id}>
                    <ThoughtCard
                      thought={thought}
                      onDelete={handleDelete}
                      onToggleFavorite={handleToggleFavorite}
                      onClick={activeFilter === 'fav' ? undefined : handleEdit}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Sticky Footer: Mirroring the Header Style */}
            <div className="sticky bottom-0 z-20 bg-[#FCFAF7]/80 backdrop-blur-md border-t border-black/5 py-4 mt-auto flex justify-between items-center text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-300">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-zinc-200" />
                <span>Ethereal Notes v2.0</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Encrypted Local Storage</span>
                <div className="w-1 h-1 rounded-full bg-zinc-200" />
                <span>AI Enhanced</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditorOpen && (
        <Editor
          thought={editingThought}
          onSave={handleSaveThought}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingThought(undefined);
          }}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          settings={userSettings}
          onSave={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
          onLogout={() => {
            setIsLocked(true);
            setIsSettingsOpen(false);
          }}
        />
      )}
    </DashboardTemplate>
  );
};

export default App;