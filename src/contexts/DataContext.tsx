/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { AppData, Habit, ToDo, Achievement, MetricData } from '../types';

interface DataContextType {
    habits: Habit[];
    achievements: Achievement[];
    todos: ToDo[];
    journal: Record<string, string>;
    metrics: MetricData[];
    loading: boolean;

    // Actions
    updateMetric: (date: string, label: string, value: number) => Promise<void>;
    toggleHabit: (habitId: string, date: string) => Promise<void>;
    addHabit: (name: string, month?: string) => Promise<void>;
    removeHabit: (id: string) => Promise<void>;

    addAchievement: (text: string, monthStr?: string) => Promise<void>;
    removeAchievement: (id: string) => Promise<void>;

    toggleTodo: (id: string) => Promise<void>;
    addTodo: (text: string, type?: 'daily' | 'weekly' | 'monthly') => Promise<void>;
    removeTodo: (id: string) => Promise<void>;

    updateJournal: (date: string, content: string) => Promise<void>;

    // Bulk
    mergeData: (newData: Partial<AppData>) => Promise<void>;
    resetData: () => Promise<void>;
    resetMonthlyData: (date: Date) => Promise<void>;
    exportDataJSON: () => string;
    importDataJSON: (json: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    const [habits, setHabits] = useState<Habit[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [todos, setTodos] = useState<ToDo[]>([]);
    const [journal, setJournal] = useState<Record<string, string>>({});
    const [metrics, setMetrics] = useState<MetricData[]>([]);
    const [loading, setLoading] = useState(true);

    // Load Data
    useEffect(() => {
        if (!user) {
            // Load from LocalStorage if no user (Guest Mode / Offline)
            const local = localStorage.getItem('aura_data');
            if (local) {
                try {
                    const parsed = JSON.parse(local);
                    setHabits(parsed.habits || []);
                    setAchievements(parsed.achievements || []);
                    setTodos(parsed.todos || []);
                    setJournal(parsed.journal || {});
                    setMetrics(parsed.metrics || []);
                } catch (e) {
                    console.error("Failed to parse local data", e);
                }
            }
            return;
        }

        const fetchData = async () => {
            const userId = user.id;

            // 1. Habits & Completions
            const { data: dbHabits } = await supabase.from('habits').select('*').eq('user_id', userId);
            const { data: dbCompletions } = await supabase.from('habit_completions').select('*').eq('user_id', userId);

            const habitsFormatted = (dbHabits || []).map((h: any) => ({
                id: h.id,
                name: h.name,
                month: h.month, // Map month field
                category: h.category,
                completedDates: (dbCompletions || [])
                    .filter((c: any) => c.habit_id === h.id)
                    .map((c: any) => {
                        // Normalize date: ensure it's YYYY-MM-DD
                        // If it's a full timestamp (e.g. 2024-02-15T00:00:00), take the first part.
                        return String(c.completed_date).split('T')[0];
                    })
            }));
            setHabits(habitsFormatted);

            // 2. Achievements
            const { data: dbAch } = await supabase.from('achievements').select('*').eq('user_id', userId);
            setAchievements((dbAch || []).map((a: any) => ({ id: a.id, text: a.text, month: a.month })));

            // 3. Todos
            const { data: dbTodos } = await supabase.from('todos').select('*').eq('user_id', userId);
            setTodos((dbTodos || []).map((t: any) => ({
                id: t.id,
                text: t.text,
                completed: t.completed,
                type: t.type || 'daily',
                createdAt: t.created_at
            })));

            // 4. Journal
            const { data: dbJournal } = await supabase.from('journal_entries').select('*').eq('user_id', userId);
            const journalMap: Record<string, string> = {};
            (dbJournal || []).forEach((e: any) => {
                if (e.content) journalMap[e.date] = e.content;
            });
            setJournal(journalMap);

            // 5. Metrics
            const { data: dbMetrics } = await supabase.from('metrics').select('*').eq('user_id', userId);
            setMetrics((dbMetrics || []).map((m: any) => ({ id: m.id, date: m.date, value: m.value, label: m.label })));

            setLoading(false);
        };

        fetchData();
    }, [user]);

    // Persist to LocalStorage on Change
    useEffect(() => {
        const dataToSave = {
            habits,
            achievements,
            todos,
            journal,
            metrics
        };
        localStorage.setItem('aura_data', JSON.stringify(dataToSave));
    }, [habits, achievements, todos, journal, metrics]);

    // --- Actions ---

    const toggleHabit = async (habitId: string, date: string) => {
        // 1. Determine action based on current state (safe enough for UI event)
        const currentHabit = habits.find(h => h.id === habitId);
        if (!currentHabit) return;

        const isCompleted = currentHabit.completedDates.includes(date);

        // 2. Optimistic Update
        setHabits(prev => prev.map(h => {
            if (h.id !== habitId) return h;
            return {
                ...h,
                completedDates: isCompleted
                    ? h.completedDates.filter(d => d !== date)
                    : [...h.completedDates, date]
            };
        }));

        if (!user) return;

        // 3. Database Sync
        if (isCompleted) {
            // It WAS completed -> Remove it
            await supabase.from('habit_completions').delete().match({ habit_id: habitId, completed_date: date, user_id: user.id });
        } else {
            // It WAS NOT completed -> Add it
            await supabase.from('habit_completions').insert({ habit_id: habitId, completed_date: date, user_id: user.id });
        }
    };

    const addHabit = async (name: string, month?: string) => {
        const tempId = crypto.randomUUID();
        // If no month is provided, it's a global habit (legacy behavior) or current month depending on usage.
        setHabits(prev => [...prev, { id: tempId, name, month, completedDates: [] }]);

        if (!user) return;

        // Attempt to insert 'month'. If column doesn't exist, this might fail or be ignored depending on Supabase settings.
        // We assume the column exists or we accept the risk currently. 
        // Ideally we would migrate the DB, but we lack direct SQL access tool for migration here.
        const { data: inserted } = await supabase.from('habits').insert({
            name,
            user_id: user.id,
            month: month || null
        }).select().single();

        if (inserted) {
            setHabits(prev => prev.map(h => h.id === tempId ? { ...h, id: inserted.id } : h));
        }
    };

    const removeHabit = async (id: string) => {
        setHabits(prev => prev.filter(h => h.id !== id));
        if (user) await supabase.from('habits').delete().eq('id', id);
    };

    const addAchievement = async (text: string, monthStr?: string) => {
        const month = monthStr || new Date().toISOString().slice(0, 7);
        const tempId = crypto.randomUUID();
        setAchievements(prev => [...prev, { id: tempId, month, text }]);

        if (!user) return;
        const { data: inserted } = await supabase.from('achievements').insert({ text, month, user_id: user.id }).select().single();
        if (inserted) {
            setAchievements(prev => prev.map(a => a.id === tempId ? { ...a, id: inserted.id } : a));
        }
    };

    const removeAchievement = async (id: string) => {
        setAchievements(prev => prev.filter(a => a.id !== id));
        if (user) await supabase.from('achievements').delete().eq('id', id);
    };

    const toggleTodo = async (id: string) => {
        const t = todos.find(todo => todo.id === id);
        if (!t) return;
        const newStatus = !t.completed;

        setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, completed: newStatus } : todo));
        if (user) await supabase.from('todos').update({ completed: newStatus }).eq('id', id);
    };

    const addTodo = async (text: string, type: 'daily' | 'weekly' | 'monthly' = 'daily') => {
        const tempId = crypto.randomUUID();
        const now = new Date().toISOString();
        setTodos(prev => [...prev, { id: tempId, text, completed: false, type, createdAt: now }]);

        if (!user) return;
        const { data: inserted } = await supabase.from('todos').insert({ text, user_id: user.id, completed: false, type }).select().single();
        if (inserted) {
            setTodos(prev => prev.map(t => t.id === tempId ? { ...t, id: inserted.id } : t));
        }
    };

    const removeTodo = async (id: string) => {
        setTodos(prev => prev.filter(t => t.id !== id));
        if (user) await supabase.from('todos').delete().eq('id', id);
    };

    const updateJournal = async (date: string, content: string) => {
        if (!content || !content.trim()) {
            const newJ = { ...journal };
            delete newJ[date];
            setJournal(newJ);
            if (user) await supabase.from('journal_entries').delete().match({ user_id: user.id, date });
            return;
        }

        setJournal(prev => ({ ...prev, [date]: content }));
        if (user) await supabase.from('journal_entries').upsert({ user_id: user.id, date, content }, { onConflict: 'user_id,date' });
    };

    const updateMetric = async (date: string, label: string, value: number) => {
        // Optimistic update
        setMetrics(prev => {
            const existing = prev.find(m => m.date === date && m.label === label);
            if (existing) {
                return prev.map(m => m.date === date && m.label === label ? { ...m, value } : m);
            }
            return [...prev, { date, label, value }];
        });

        if (user) {
            // Upsert based on match (assuming unique constraint on user_id, date, label)
            // If ID is needed forupsert, we might need to handle it, but match on unique columns usually works if DB supports it.
            // Using upsert with specific onConflict
            await supabase.from('metrics').upsert(
                { user_id: user.id, date, label, value },
                { onConflict: 'user_id,date,label' }
            );
        }
    };

    // Bulk & Reset
    const resetData = async () => {
        if (user) {
            const uid = user.id;
            await Promise.all([
                supabase.from('habit_completions').delete().eq('user_id', uid),
                supabase.from('habits').delete().eq('user_id', uid),
                supabase.from('achievements').delete().eq('user_id', uid),
                supabase.from('todos').delete().eq('user_id', uid),
                supabase.from('journal_entries').delete().eq('user_id', uid),
                supabase.from('metrics').delete().eq('user_id', uid)
            ]);
        }
        setHabits([]);
        setAchievements([]);
        setTodos([]);
        setJournal({});
        setMetrics([]);
    };

    const resetMonthlyData = async (date: Date) => {
        const monthStr = date.toISOString().slice(0, 7);
        if (user) {
            const uid = user.id;
            await supabase.from('achievements').delete().eq('user_id', uid).eq('month', monthStr);
            await supabase.from('journal_entries').delete().eq('user_id', uid).like('date', `${monthStr}%`);
            await supabase.from('habit_completions').delete().eq('user_id', uid).gte('completed_date', `${monthStr}-01`).lte('completed_date', `${monthStr}-31`);

            // NOTE: We do NOT delete the habits themselves, only completions, 
            // unless we want to delete habits created in this month. 
            // If habits are per-month, we SHOULD delete them.
            // Let's assume for now we only delete 'data' (completions), not the schema (habits).
            // But if habits are monthly, then deleting monthly data MIGHT mean deleting the habits too?
            // User said: "keep the monthly data seperate so if changes made to one then the other one doesnt get deleted."
            // This 'reset' function is for "Clear Month", so maybe it SHOULD delete habits for that month.
            await supabase.from('habits').delete().eq('user_id', uid).eq('month', monthStr);
        }

        // Optimistic
        setHabits(prev => prev.filter(h => h.month !== monthStr)); // Remove habits of this month
        setAchievements(prev => prev.filter(a => a.month !== monthStr));
        setJournal(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(k => { if (k.startsWith(monthStr)) delete next[k]; });
            return next;
        });
        setMetrics(prev => prev.filter(m => !m.date.startsWith(monthStr)));
    };

    const exportDataJSON = () => {
        const data = {
            habits,
            achievements,
            todos,
            journal,
            metrics,
            preferences: { theme: 'dark' as const, reducedMotion: false } // Placeholder, preferences are elsewhere
        };
        return JSON.stringify(data, null, 2);
    };

    const importDataJSON = (json: string) => {
        try {
            const parsed = JSON.parse(json);
            // Apply locally only for now
            if (parsed.habits) setHabits(parsed.habits);
            if (parsed.todos) setTodos(parsed.todos);
            if (parsed.journal) setJournal(parsed.journal);
            // ... etc
        } catch (e) {
            console.error("Import failed", e);
        }
    };

    const mergeData = async (newData: Partial<AppData>) => {
        // 1. Journal
        if (newData.journal) {
            setJournal(prev => ({ ...prev, ...newData.journal }));
        }
        // ... etc (Simplified for now)
        if (newData.todos) setTodos(prev => [...prev, ...newData.todos!]);
    };

    const value = {
        habits, achievements, todos, journal, metrics, loading,
        toggleHabit, addHabit, removeHabit,
        addAchievement, removeAchievement,
        toggleTodo, addTodo, removeTodo,
        updateJournal,
        updateMetric,
        mergeData, resetData, resetMonthlyData,
        exportDataJSON, importDataJSON
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
