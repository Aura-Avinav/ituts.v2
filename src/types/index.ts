export interface Habit {
    id: string;
    name: string;
    category?: string; // e.g. "Health", "Study"
    month?: string; // "YYYY-MM" (If undefined, applies to all/legacy)
    completedDates: string[]; // ISO Date strings "YYYY-MM-DD"
}

export interface Achievement {
    id: string;
    month: string; // "YYYY-MM"
    text: string;
}

export interface ToDo {
    id: string;
    text: string;
    completed: boolean;
    type: 'daily' | 'weekly' | 'monthly';
    createdAt: string; // ISO string
}

export interface JournalEntry {
    date: string; // "YYYY-MM-DD"
    content: string;
}

export interface MetricData {
    id?: string;
    date: string; // "YYYY-MM-DD"
    value: number; // e.g. 1-10
    label: 'mood' | 'energy' | string;
}

export interface AppData {
    habits: Habit[];
    achievements: Achievement[];
    todos: ToDo[];
    journal: Record<string, string>; // date -> content mapping for O(1) access
    metrics: MetricData[];
    preferences?: {
        theme: 'dark' | 'light' | 'system';
        reducedMotion?: boolean;
        language?: 'en-US' | 'en-GB' | 'en-IN';
        spellCheck?: boolean;
        dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
        timeFormat?: '12' | '24';
        startOfWeek?: 'monday' | 'sunday';
        privacyBlur?: boolean;
        workspaceName?: string;
        fontSize?: 'sm' | 'base' | 'lg';
        fontFamily?: 'sans' | 'serif' | 'mono';
        contentWidth?: 'standard' | 'full';
        startView?: 'dashboard' | 'journal' | 'year';
        accentColor?: 'blue' | 'purple' | 'rose' | 'orange' | 'green' | 'cyan';
        soundEnabled?: boolean;
        _updatedAt?: number;
    };
    loading?: boolean;
}

export interface CoachMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}
