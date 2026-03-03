
import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "搜索思绪碎片..." }) => {
    return (
        <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
            <input
                type="text"
                id="thought-search"
                name="thought_search"
                aria-label="搜索思绪"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-black/5 rounded-full py-3 pl-12 pr-6 text-sm outline-none focus:border-black/20 focus:bg-zinc-50 transition-all font-serif italic"
            />
        </div>
    );
};
