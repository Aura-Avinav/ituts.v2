import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { cn } from '../lib/utils';
import { Check, Plus, Trash2, Sparkles, Flame, Trophy } from 'lucide-react';
import { format, getDaysInMonth } from 'date-fns';
import { Modal, Button } from './ui/Modal';
import { calculateHabitStats } from '../lib/analytics';
import { HabitDetailsModal } from './HabitDetailsModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../hooks/useSound';

export function HabitGrid({ date }: { date: Date }) {
    const { data, toggleHabit, addHabit, removeHabit } = useStore();
    const { play } = useSound();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth(); // 0-indexed

    const daysInMonth = getDaysInMonth(date);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [habitToDelete, setHabitToDelete] = useState<{ id: string, name: string } | null>(null);
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

    const currentMonthStr = format(date, 'yyyy-MM');

    const handleAddClick = () => {
        setNewHabitName('');
        setIsAddModalOpen(true);
    };

    const confirmAddHabit = () => {
        if (newHabitName.trim()) {
            addHabit(newHabitName.trim(), currentMonthStr); // Pass month
            setIsAddModalOpen(false);
        }
    };

    const handleDeleteClick = (id: string, name: string) => {
        setHabitToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteHabit = () => {
        if (habitToDelete) {
            removeHabit(habitToDelete.id);
            setHabitToDelete(null);
            setIsDeleteModalOpen(false);
        }
    };

    // Derived state for selected habit for details
    const selectedHabit = data.habits.find(h => h.id === selectedHabitId) || null;

    // Filter habits for the current month view
    const visibleHabits = data.habits.filter(h => {
        // Show if it matches current month OR if it's a global habit (no month)
        return h.month === currentMonthStr || !h.month;
    });

    // Calculate Daily Progress for "Celebration"
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const isCurrentMonthView = format(date, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

    // Only celebrate if looking at current month AND there are habits
    const totalHabitsToday = visibleHabits.length;
    const completedHabitsToday = visibleHabits.filter(h => h.completedDates.includes(todayStr)).length;
    const isDayComplete = totalHabitsToday > 0 && totalHabitsToday === completedHabitsToday;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold tracking-tight text-primary">Habit Tracker</h2>
                    {isCurrentMonthView && isDayComplete && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full text-xs font-semibold border border-yellow-500/20"
                        >
                            <Trophy className="w-3.5 h-3.5" />
                            <span>Day Complete!</span>
                        </motion.div>
                    )}
                </div>
                <button
                    onClick={handleAddClick}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-surfaceHighlight hover:bg-surfaceHighlight/80 text-foreground hover:text-accent rounded-full transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 group"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Add Protocol</span>
                </button>
            </div>

            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left border-separate border-spacing-0">
                    <thead className="text-xs uppercase text-secondary">
                        <tr>
                            <th scope="col" className="sticky left-0 z-20 px-4 py-3 bg-background/95 backdrop-blur-md min-w-[200px] font-semibold text-primary/80 border-b border-surfaceHighlight/20">
                                Habit
                            </th>
                            {days.map(d => (
                                <th key={d} scope="col" className="px-1 py-3 text-center min-w-[32px] font-medium border-b border-surfaceHighlight/20 text-secondary/70">
                                    {d}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {visibleHabits.map((habit) => {
                                const stats = calculateHabitStats(habit);
                                const showStreak = stats.currentStreak > 2;

                                return (
                                    <motion.tr
                                        key={habit.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="group hover:bg-surfaceHighlight/5 transition-colors"
                                    >
                                        <th scope="row" className="sticky left-0 z-20 px-4 py-3 font-medium text-primary bg-background/95 backdrop-blur-md whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] border-b border-surfaceHighlight/10">
                                            <div className="flex items-center justify-between gap-2">
                                                <button
                                                    onClick={() => setSelectedHabitId(habit.id)}
                                                    className="truncate hover:text-accent hover:underline decoration-dashed underline-offset-4 transition-all text-left flex items-center gap-2"
                                                >
                                                    {habit.name}
                                                    {showStreak && (
                                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold">
                                                            <Flame className="w-3 h-3 fill-current" /> {stats.currentStreak}
                                                        </span>
                                                    )}
                                                    {!habit.month && (
                                                        <span className="text-[10px] bg-secondary/10 text-secondary px-1 py-0.5 rounded ml-1" title="This protocol appears in all months">
                                                            Global
                                                        </span>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteClick(habit.id, habit.name)}
                                                    className="opacity-0 group-hover:opacity-100 text-secondary hover:text-red-500 transition-all"
                                                    title="Remove habit"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </th>
                                        {days.map(day => {
                                            const dateObj = new Date(currentYear, currentMonth, day);
                                            const dateStr = format(dateObj, 'yyyy-MM-dd');

                                            const isCompleted = habit.completedDates.includes(dateStr);

                                            const today = new Date();
                                            const isToday = day === today.getDate() &&
                                                currentMonth === today.getMonth() &&
                                                currentYear === today.getFullYear();

                                            const isFuture = dateObj > new Date(new Date().setHours(23, 59, 59, 999));

                                            return (
                                                <td key={day} className={cn(
                                                    "p-0 text-center border-b border-surfaceHighlight/10 relative",
                                                    isToday && "bg-accent/5",
                                                    isFuture && "bg-surface/5"
                                                )}>
                                                    <button
                                                        onClick={() => {
                                                            if (!isFuture) {
                                                                toggleHabit(habit.id, dateStr);
                                                                if (!isCompleted) play('pop');
                                                            }
                                                        }}
                                                        disabled={isFuture}
                                                        className={cn(
                                                            "w-full h-10 flex items-center justify-center transition-all duration-200",
                                                            isFuture ? "cursor-not-allowed opacity-20" :
                                                                isCompleted ? "text-accent scale-110" : "text-surfaceHighlight/20 hover:text-secondary/50 hover:scale-105"
                                                        )}
                                                    >
                                                        {isCompleted ? (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                            >
                                                                <Check className="w-5 h-5 shadow-sm" strokeWidth={3} />
                                                            </motion.div>
                                                        ) : (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />
                                                        )}
                                                    </button>
                                                </td>
                                            )
                                        })}
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>

                {visibleHabits.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16 text-center"
                    >
                        <div className="w-16 h-16 bg-surfaceHighlight/30 rounded-full flex items-center justify-center mb-4 text-accent animate-pulse">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-primary mb-2">Start Your Journey</h3>
                        <p className="text-secondary max-w-sm mb-6">
                            "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
                        </p>
                        <button
                            onClick={handleAddClick}
                            className="px-6 py-2.5 bg-accent text-background font-bold rounded-lg hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-accent/20"
                        >
                            Create First Protocol
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Add Habit Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Protocol"
            >
                <div className="space-y-4">
                    <div>
                        <label htmlFor="habitName" className="block text-sm font-medium text-secondary mb-1">
                            Protocol Name
                        </label>
                        <input
                            id="habitName"
                            type="text"
                            value={newHabitName}
                            onChange={(e) => setNewHabitName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && confirmAddHabit()}
                            placeholder="e.g. Read 30 mins"
                            className="w-full bg-surfaceHighlight/10 border border-surfaceHighlight rounded-md px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmAddHabit} disabled={!newHabitName.trim()}>
                            Add Protocol
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Habit Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Remove Protocol"
            >
                <div className="space-y-4">
                    <p className="text-secondary">
                        Are you sure you want to remove <span className="text-primary font-medium">"{habitToDelete?.name}"</span>?
                        <br />
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={confirmDeleteHabit}>
                            Remove
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Habit Details Modal */}
            <HabitDetailsModal
                habit={selectedHabit}
                isOpen={!!selectedHabit}
                onClose={() => setSelectedHabitId(null)}
            />
        </div>
    );
}
