import { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { cn } from '../lib/utils';
import { Battery, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const MOODS = [
    { value: 1, emoji: '😫', label: 'Awful', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
    { value: 2, emoji: '😕', label: 'Bad', color: 'bg-orange-500/20 text-orange-500 border-orange-500/30' },
    { value: 3, emoji: '😐', label: 'Okay', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
    { value: 4, emoji: '🙂', label: 'Good', color: 'bg-lime-500/20 text-lime-500 border-lime-500/30' },
    { value: 5, emoji: '🤩', label: 'Great', color: 'bg-green-500/20 text-green-500 border-green-500/30' },
];

export function MoodSelector({ date }: { date: Date }) {
    const { data, updateMetric } = useStore();
    const dateStr = format(date, 'yyyy-MM-dd');

    // Find existing mood/energy for this day
    const existingMood = data.metrics.find(m => m.date === dateStr && m.label === 'mood');
    const existingEnergy = data.metrics.find(m => m.date === dateStr && m.label === 'energy');

    const [mood, setMood] = useState<number | null>(existingMood?.value || null);
    const [energy, setEnergy] = useState<number | null>(existingEnergy?.value || null);

    // Sync specific day selection
    useEffect(() => {
        const foundMood = data.metrics.find(m => m.date === dateStr && m.label === 'mood');
        const foundEnergy = data.metrics.find(m => m.date === dateStr && m.label === 'energy');
        setMood(foundMood?.value || null);
        setEnergy(foundEnergy?.value || null);
    }, [dateStr, data.metrics]);

    const handleMoodSelect = (value: number) => {
        setMood(value);
        updateMetric(dateStr, 'mood', value);
    };

    const handleEnergySelect = (value: number) => {
        setEnergy(value);
        updateMetric(dateStr, 'energy', value);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Mood Section */}
            <div>
                <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">Daily Mood</h3>
                <div className="grid grid-cols-5 gap-2">
                    {MOODS.map((m) => {
                        const isSelected = mood === m.value;
                        return (
                            <button
                                key={m.value}
                                onClick={() => handleMoodSelect(m.value)}
                                className="relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 isolate group"
                            >
                                {isSelected && (
                                    <motion.div
                                        layoutId="mood-active-bg"
                                        className={cn("absolute inset-0 rounded-xl z-[-1]", m.color.split(' ')[0], "opacity-100")}
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                <motion.span
                                    className="text-2xl mb-1 filter drop-shadow-sm select-none"
                                    animate={{
                                        scale: isSelected ? 1.4 : 1,
                                        y: isSelected ? -2 : 0
                                    }}
                                    whileHover={{ scale: 1.2 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                                >
                                    {m.emoji}
                                </motion.span>

                                <span className={cn(
                                    "text-[10px] font-medium transition-colors duration-200",
                                    isSelected ? m.color.split(' ')[1] : "text-secondary group-hover:text-foreground"
                                )}>
                                    {m.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Energy Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider">Energy Level</h3>
                    <AnimatePresence mode="wait">
                        {energy && (
                            <motion.span
                                key="energy-label"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className={cn(
                                    "text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                                    energy >= 8 ? "bg-green-500/10 text-green-500 ring-1 ring-green-500/20" :
                                        energy >= 5 ? "bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/20" :
                                            "bg-red-500/10 text-red-500 ring-1 ring-red-500/20"
                                )}>
                                <span>{energy}/10</span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative h-14 bg-surface/30 rounded-xl border border-surfaceHighlight flex items-center px-2 overflow-hidden group">
                    {/* Interactive Slider Area */}
                    <div className="absolute inset-0 z-20 grid grid-cols-10 cursor-pointer">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                            <div
                                key={v}
                                onClick={() => handleEnergySelect(v)}
                                className="h-full hover:bg-white/5 transition-colors"
                                title={`Energy: ${v}/10`}
                            />
                        ))}
                    </div>

                    {/* Background Track */}
                    <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-2 bg-surfaceHighlight/50 rounded-full overflow-hidden"></div>

                    {/* Animated Fill Bar */}
                    <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-2 rounded-full pointer-events-none">
                        <motion.div
                            layout
                            className={cn(
                                "h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)]",
                                !energy ? "w-0 opacity-0" :
                                    energy >= 8 ? "bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.4)]" :
                                        energy >= 5 ? "bg-gradient-to-r from-yellow-500 to-orange-400 shadow-[0_0_10px_rgba(234,179,8,0.4)]" :
                                            "bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                            )}
                            animate={{
                                width: `${(energy || 0) * 10}%`,
                            }}
                            transition={{ type: "spring", stiffness: 150, damping: 20 }}
                        />
                    </div>

                    {/* Floating Battery Icon Indicator */}
                    <motion.div
                        className="absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                        animate={{
                            left: `calc(${(energy || 0) * 10}% - 14px)`,
                            opacity: energy ? 1 : 0.5
                        }}
                        transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center bg-background border shadow-lg",
                            !energy ? "border-surfaceHighlight text-secondary" :
                                energy >= 8 ? "border-green-500/50 text-green-500" :
                                    energy >= 5 ? "border-yellow-500/50 text-yellow-500" :
                                        "border-red-500/50 text-red-500"
                        )}>
                            {energy === null ? <Battery className="w-4 h-4 opacity-50" /> :
                                energy >= 8 ? <BatteryFull className="w-4 h-4 fill-current" /> :
                                    energy >= 4 ? <BatteryMedium className="w-4 h-4 fill-current" /> :
                                        <BatteryLow className="w-4 h-4 fill-current" />
                            }
                        </div>
                    </motion.div>
                </div>
                <div className="flex justify-between text-[10px] text-secondary/40 mt-1 px-1 font-medium select-none">
                    <span>Low</span>
                    <span>High</span>
                </div>
            </div>
        </div>
    );
}
