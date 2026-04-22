import { useMemo } from 'react';
import { Modal } from './ui/Modal';
import type { Habit } from '../types';
import { calculateHabitStats } from '../lib/analytics';
import { eachDayOfInterval, endOfYear, format, startOfYear } from 'date-fns';
import { cn } from '../lib/utils';
import { Flame, Trophy, Calendar } from 'lucide-react';

interface HabitDetailsModalProps {
    habit: Habit | null;
    isOpen: boolean;
    onClose: () => void;
}

export function HabitDetailsModal({ habit, isOpen, onClose }: HabitDetailsModalProps) {
    const stats = useMemo(() => {
        if (!habit) return null;
        return calculateHabitStats(habit);
    }, [habit]);

    const heatmapData = useMemo(() => {
        if (!habit) return [];
        const today = new Date();
        const start = startOfYear(today);
        const end = endOfYear(today);

        const days = eachDayOfInterval({ start, end });
        return days.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isCompleted = habit.completedDates.includes(dateStr);
            return { date, isCompleted };
        });
    }, [habit]);

    if (!habit || !stats) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={habit.name} className="max-w-2xl">
            <div className="space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-col items-center justify-center text-center">
                        <Flame className="w-6 h-6 text-orange-500 mb-2" />
                        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.currentStreak}</span>
                        <span className="text-xs text-secondary uppercase tracking-wider">Current Streak</span>
                    </div>

                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex flex-col items-center justify-center text-center">
                        <Trophy className="w-6 h-6 text-yellow-500 mb-2" />
                        <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.longestStreak}</span>
                        <span className="text-xs text-secondary uppercase tracking-wider">Longest Streak</span>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center text-center">
                        <Calendar className="w-6 h-6 text-blue-500 mb-2" />
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCompletions}</span>
                        <span className="text-xs text-secondary uppercase tracking-wider">Total Check-ins</span>
                    </div>
                </div>

                {/* Heatmap */}
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">Yearly Activity</h3>
                    <div className="grid grid-cols-[repeat(53,1fr)] gap-1 p-4 bg-surfaceHighlight/10 rounded-xl overflow-x-auto">
                        {heatmapData.map((day) => (
                            <div
                                key={day.date.toISOString()}
                                className={cn(
                                    "w-3 h-3 rounded-[2px] transition-all",
                                    day.isCompleted ? "bg-green-500" : "bg-surfaceHighlight/30 hover:bg-surfaceHighlight/50"
                                )}
                                title={`${format(day.date, 'MMM d, yyyy')}: ${day.isCompleted ? 'Completed' : 'Missed'}`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center justify-end gap-2 text-[10px] text-secondary">
                        <span>Less</span>
                        <div className="w-3 h-3 rounded-[2px] bg-surfaceHighlight/30" />
                        <div className="w-3 h-3 rounded-[2px] bg-green-500" />
                        <span>More</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
