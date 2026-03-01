
import React from 'react';

interface ProfileBadgeProps {
    name: string;
    avatarUrl?: string;
    onClick?: () => void;
}

export const ProfileBadge: React.FC<ProfileBadgeProps> = ({ name, avatarUrl, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 p-1 pr-4 rounded-full hover:bg-zinc-50 transition-colors text-left"
        >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-black/5">
                <img
                    src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=000&color=fff`}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5">{name}</span>
                <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest leading-none">Settings</span>
            </div>
        </button>
    );
};
