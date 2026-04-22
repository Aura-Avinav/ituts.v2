import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function SplashScreen() {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center gap-4"
            >
                <div className="w-20 h-20 bg-gradient-to-tr from-accent to-purple-600 rounded-3xl flex items-center justify-center shadow-xl shadow-accent/20">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 tracking-tight">
                    ITUTS
                </h1>
            </motion.div>
        </motion.div>
    );
}
