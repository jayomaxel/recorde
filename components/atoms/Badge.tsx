
import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'mood' | 'tag';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
    const baseStyles = 'inline-flex items-center font-bold uppercase tracking-widest rounded-sm';

    const variants = {
        default: 'text-[9px] text-zinc-400',
        mood: 'text-[10px] text-zinc-400 px-3 py-1 bg-black/5 rounded-full',
        tag: 'text-[9px] text-zinc-400',
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
