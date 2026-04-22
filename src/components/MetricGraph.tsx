import { useStore } from '../hooks/useStore';
import type { AppData } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';
import { format, eachDayOfInterval } from 'date-fns';

export function MetricGraph({ date }: { date: Date }) {
    const { data } = useStore();
    // Default to 'blue' (indigo) if not set, or map preferences
    const accent = data.preferences?.accentColor || 'blue';

    const colorMap: Record<string, string> = {
        blue: '#6366f1',   // Indigo-500
        purple: '#a855f7', // Purple-500
        rose: '#f43f5e',   // Rose-500
        orange: '#f97316', // Orange-500
        green: '#22c55e',  // Green-500
        cyan: '#06b6d4',   // Cyan-500
    };

    const activeColor = colorMap[accent] || '#6366f1';

    const currentMonthStr = format(date, 'yyyy-MM');

    // Filter habits for the current month (Strict separation to match HabitGrid)
    const activeHabits = data.habits.filter(h => {
        return h.month === currentMonthStr || !h.month;
    });

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <Activity className="w-5 h-5" style={{ color: activeColor }} />
                    Productivity Flow
                </h3>
                <div className="flex items-center gap-2 bg-surfaceHighlight/30 rounded-md p-1">
                    <span className="text-[10px] text-secondary px-2 uppercase tracking-wider font-medium">Daily Score</span>
                </div>
            </div>

            <div className="h-[200px] w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData(data, date, activeHabits)}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={activeColor} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={activeColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="day"
                            stroke="#666"
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            interval="preserveStartEnd"
                            minTickGap={15}
                        />
                        <YAxis hide domain={[0, 10]} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(24, 24, 27, 0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(4px)'
                            }}
                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <Area
                            type="basis"
                            dataKey="value"
                            stroke={activeColor}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}


function getChartData(data: AppData, date: Date, activeHabits: AppData['habits']) {
    // Generate days for the selected month
    const daysInMonth = eachDayOfInterval({
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0)
    });

    const totalHabits = activeHabits.length;

    return daysInMonth.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        let score = 0;

        // 1. Habit Score (Base 0-7)
        if (totalHabits > 0) {
            let completedCount = 0;
            activeHabits.forEach(habit => {
                if (habit.completedDates.includes(dateStr)) {
                    completedCount++;
                }
            });
            // Normalize to 0-7 range based on SELECTED MONTH'S ACTIVE HABITS
            score += (completedCount / totalHabits) * 7;
        }

        // 2. Journal Bonus (+3)
        if (data.journal[dateStr]) {
            score += 3;
        }

        // Round to 1 decimal
        score = Math.round(score * 10) / 10;

        return {
            day: format(day, 'd'),
            value: score
        };
    });
}
