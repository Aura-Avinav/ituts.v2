import { Sparkles } from 'lucide-react';

export function SplashScreen() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background animate-out fade-out fill-mode-forwards duration-500 delay-500">
            <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 fade-in duration-500 ease-out">
                <div className="w-20 h-20 bg-gradient-to-tr from-accent to-purple-600 rounded-3xl flex items-center justify-center shadow-xl shadow-accent/20">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 tracking-tight">
                    ITUTS
                </h1>
            </div>
        </div>
    );
}
