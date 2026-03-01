
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface SidebarProps {
    navItems: NavItem[];
    activeFilter: string;
    onFilterChange: (id: string) => void;
    title: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ navItems, activeFilter, onFilterChange, title }) => {
    return (
        <aside className="w-72 border-r border-black/5 flex flex-col h-full bg-white">
            <div className="p-8 pb-12">
                <h1 className="text-2xl font-serif font-bold italic tracking-tighter">{title}</h1>
                <div className="h-[2px] w-8 bg-black mt-4" />
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onFilterChange(item.id)}
                        className={`w-full flex items-center gap-4 px-4 py-4 transition-all group ${activeFilter === item.id
                                ? 'bg-black text-white rounded-sm shadow-lg shadow-black/10'
                                : 'text-zinc-400 hover:text-black hover:translate-x-1'
                            }`}
                    >
                        <item.icon size={18} strokeWidth={activeFilter === item.id ? 2.5 : 2} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-8">
                <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest leading-relaxed">
                    Ethereal Notes<br />
                    Built for the inner self.<br />
                    v1.0.1
                </p>
            </div>
        </aside>
    );
};
