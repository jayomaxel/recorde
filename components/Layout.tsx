
import React from 'react';
import { Feather, Plus, Search, Archive, Settings, Coffee, Heart, BarChart2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onNewClick: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onNewClick, 
  searchQuery, 
  setSearchQuery,
  activeFilter,
  setActiveFilter
}) => {
  // Removed 'all' (Archive) from here as it's now handled by the top logo
  const navItems = [
    { id: 'fav', label: '心动收藏', icon: Heart },
    { id: 'stats', label: '心境统计', icon: BarChart2 },
    { id: 'inspire', label: '灵感库', icon: Coffee },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden text-slate-800">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 border-r border-slate-200/50 flex flex-col items-center md:items-stretch py-8 bg-white/70 backdrop-blur-xl z-20">
        {/* Logo acting as "All/Home" button */}
        <button 
          onClick={() => setActiveFilter('all')}
          className="px-6 mb-12 flex items-center gap-3 group transition-transform active:scale-95"
        >
          <div className={`p-2.5 rounded-2xl shadow-lg transition-all duration-300 ${
            activeFilter === 'all' 
            ? 'bg-indigo-600 text-white shadow-indigo-200' 
            : 'bg-white text-indigo-600 border border-slate-100 shadow-slate-100 group-hover:bg-slate-50'
          }`}>
            <Feather size={20} />
          </div>
          <h1 className={`hidden md:block font-bold text-xl tracking-tight font-serif italic transition-colors ${
            activeFilter === 'all' ? 'text-slate-900' : 'text-slate-400'
          }`}>Ethereal</h1>
        </button>

        <nav className="flex-1 px-4 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-medium transition-all duration-300 ${
                activeFilter === item.id 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} />
              <span className="hidden md:block text-sm">{item.label}</span>
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-slate-100 hidden md:block">
            <button className="w-full flex items-center gap-4 px-4 py-3 text-slate-300 hover:text-slate-500 transition-colors">
              <Settings size={18} />
              <span className="text-sm">偏好设置</span>
            </button>
          </div>
        </nav>

        <div className="px-4 mt-auto">
          <button
            onClick={onNewClick}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-4 px-3 rounded-2xl shadow-2xl shadow-slate-200 transition-all hover:scale-[1.05] active:scale-95 group"
          >
            <Plus size={22} className="group-hover:rotate-90 transition-transform" />
            <span className="hidden md:block font-bold">记录当下</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Top Header */}
        <header className="h-24 flex items-center justify-between px-8 bg-white/40 backdrop-blur-md border-b border-slate-100 z-10">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder="搜索思绪、关键词或情绪..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/60 border-none focus:ring-2 focus:ring-indigo-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm transition-all outline-none"
            />
          </div>
          
          <div className="ml-8 flex items-center gap-5">
             <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Today</span>
                <span className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}</span>
             </div>
             <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-[1px] shadow-lg shadow-indigo-100 cursor-pointer hover:rotate-3 transition-transform">
                <div className="h-full w-full rounded-[calc(0.75rem-1px)] overflow-hidden bg-white">
                  <img src="https://picsum.photos/seed/ethereal/120/120" alt="Profile" className="object-cover w-full h-full" />
                </div>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
};
