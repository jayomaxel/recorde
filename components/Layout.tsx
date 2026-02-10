
import React from 'react';
import { Feather, Plus, Search, Settings, Coffee, Heart, BarChart2, Menu } from 'lucide-react';
import { UserSettings } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onNewClick: () => void;
  onSettingsClick: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  userSettings: UserSettings;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onNewClick,
  onSettingsClick,
  searchQuery, 
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  userSettings
}) => {
  const navItems = [
    { id: 'all', label: '全部记录', icon: Menu },
    { id: 'fav', label: '心动收藏', icon: Heart },
    { id: 'inspire', label: '灵感片段', icon: Coffee },
    // Only show stats if AI is enabled and user hasn't hidden trends
    ...(userSettings.isAiEnabled && userSettings.showMoodTrends ? [{ id: 'stats', label: '心境趋势', icon: BarChart2 }] : []),
  ];

  return (
    <div className="flex h-screen bg-[#FCFAF7] overflow-hidden">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-60 border-r border-black/10 flex flex-col py-10 bg-white z-30">
        <div className="px-6 mb-16">
          <button 
            onClick={() => setActiveFilter('all')}
            className="flex items-center gap-3 hover:opacity-70"
          >
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-sm shrink-0">
              <Feather size={16} />
            </div>
            <h1 className="hidden md:block font-serif font-bold text-lg tracking-widest uppercase">Ethereal</h1>
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-3 text-sm ${
                activeFilter === item.id 
                ? 'bg-black text-white font-medium' 
                : 'text-zinc-400 hover:text-black hover:bg-zinc-50'
              }`}
            >
              <item.icon size={18} />
              <span className="hidden md:block tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 mt-auto space-y-4">
          <button
            onClick={onNewClick}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-sm hover:bg-zinc-800 active:scale-[0.98]"
          >
            <Plus size={20} />
            <span className="hidden md:block font-bold text-xs uppercase tracking-widest">记录当下</span>
          </button>
          
          <button 
            onClick={onSettingsClick}
            className="w-full flex items-center gap-4 px-6 py-3 text-sm text-zinc-400 hover:text-black hover:bg-zinc-50 rounded-sm"
          >
            <Settings size={18} />
            <span className="hidden md:block tracking-tight">偏好设置</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-16 md:ml-60 flex flex-col h-full relative overflow-hidden bg-[#FCFAF7]">
        <header className="sticky top-0 h-20 flex items-center justify-between px-10 border-b border-black/5 bg-white/70 backdrop-blur-md z-20 shrink-0">
          <div className="flex-1 max-lg relative group">
            {/* 仅在非趋势页面显示搜索框 */}
            {activeFilter !== 'stats' && (
              <>
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-black" size={16} />
                <input
                  type="text"
                  placeholder="SEARCH THOUGHTS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 py-2 pl-8 text-xs tracking-widest uppercase outline-none placeholder:text-zinc-300"
                />
              </>
            )}
          </div>
          
          <div className="flex items-center gap-6">
             <div className="text-right hidden sm:block">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">{new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</p>
                <p className="text-xs font-serif font-bold italic">{userSettings.userName}</p>
             </div>
             <button 
               onClick={onSettingsClick}
               className="h-10 w-10 border border-black p-0.5 rounded-sm hover:rotate-3 overflow-hidden transition-transform"
             >
                <img src={userSettings.avatarUrl} alt="User" className="w-full h-full object-cover" />
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
