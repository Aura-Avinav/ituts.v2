import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out", className)}>
            {children}
        </div>
    );
}
