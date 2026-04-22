import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div
                className={cn(
                    "relative w-full max-w-md bg-surface border border-surfaceHighlight rounded-xl shadow-2xl",
                    className
                )}
            >
                <div className="flex items-center justify-between p-6 border-b border-surfaceHighlight/50">
                    <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-secondary hover:text-foreground transition-colors rounded-full hover:bg-surfaceHighlight"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
    const variants = {
        primary: "bg-accent text-white hover:bg-accent/90",
        secondary: "bg-surfaceHighlight text-secondary hover:text-foreground hover:bg-surfaceHighlight/80",
        danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
        ghost: "hover:bg-accent/10 hover:text-accent"
    };

    return (
        <button
            className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}
