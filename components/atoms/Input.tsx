
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
    return (
        <div className="space-y-2 w-full">
            {label && (
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                    {label}
                </label>
            )}
            <input
                className={`w-full bg-white border border-black/10 rounded-sm py-3 px-4 text-sm mono outline-none focus:border-black transition-colors ${className}`}
                {...props}
            />
        </div>
    );
};
