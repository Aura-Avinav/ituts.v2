/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { PreferencesProvider, usePreferences } from '../contexts/PreferencesContext';
import { DataProvider, useData } from '../contexts/DataContext';
import type { AppData } from '../types';

export function StoreProvider({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <PreferencesProvider>
                <DataProvider>
                    {children}
                </DataProvider>
            </PreferencesProvider>
        </AuthProvider>
    );
}

// Legacy hook that combines everything
export function useStore() {
    const { session, user, signOut, loading: authLoading } = useAuth();
    const {
        preferences, updatePreferences, setTheme, toggleTheme, setLanguage, toggleSpellCheck,
        setDateFormat, setTimeFormat, setStartOfWeek, togglePrivacyBlur, toggleReducedMotion
    } = usePreferences();

    const {
        habits, achievements, todos, journal, metrics, loading,
        toggleHabit, addHabit, removeHabit,
        addAchievement, removeAchievement,
        toggleTodo, addTodo, removeTodo,
        updateJournal,
        updateMetric,
        mergeData, resetData, resetMonthlyData,
        importDataJSON
    } = useData();

    // Construct the legacy 'data' object on the fly
    const data: AppData = {
        habits,
        achievements,
        todos,
        journal,
        metrics,
        loading,
        preferences: {
            ...preferences
        }
    };

    return {
        session,
        user,
        authLoading,
        signOut,
        data,

        // Preferences
        updatePreferences,
        setTheme,
        toggleTheme,
        setLanguage,
        toggleSpellCheck,
        setDateFormat,
        setTimeFormat,
        setStartOfWeek,
        togglePrivacyBlur,
        toggleReducedMotion,

        // Data Actions
        toggleHabit,
        addHabit,
        removeHabit,
        addAchievement,
        removeAchievement,
        toggleTodo,
        addTodo,
        removeTodo,
        updateJournal,
        updateMetric,
        mergeData,
        resetData,
        resetMonthlyData,

        // Import/Export
        exportData: () => {
            // Combine Data and Preferences for Export
            const fullData: AppData = {
                habits,
                achievements,
                todos,
                journal,
                metrics,
                preferences: { ...preferences } // Use actual preferences from Context
            };

            const json = JSON.stringify(fullData, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ituts_backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        importData: importDataJSON
    };
}
