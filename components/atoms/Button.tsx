
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isFullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isFullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-sm';

    const variants = {
        primary: 'bg-black text-white hover:bg-zinc-800',
        secondary: 'bg-zinc-100 text-black hover:bg-zinc-200',
        outline: 'bg-transparent border border-black text-black hover:bg-black hover:text-white',
        ghost: 'bg-transparent text-black hover:bg-zinc-50',
    };

    const sizes = {
        sm: 'px-4 py-2 text-[10px]',
        md: 'px-8 py-4 text-xs',
        lg: 'px-12 py-5 text-sm',
    };

    const widthStyle = isFullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
