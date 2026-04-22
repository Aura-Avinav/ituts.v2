import { Loader2 } from 'lucide-react';

export function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full text-secondary animate-in fade-in duration-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-accent" />
            <p className="text-sm font-medium tracking-wide opacity-70">Loading your journal...</p>
        </div>
    );
}
