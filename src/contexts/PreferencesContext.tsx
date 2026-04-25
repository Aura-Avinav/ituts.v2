/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type Theme = 'dark' | 'light' | 'system';
type Language = 'en-US' | 'en-GB' | 'en-IN';
type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
type TimeFormat = '12' | '24';
type StartOfWeek = 'monday' | 'sunday';

interface PreferencesState {
    theme: Theme;
    reducedMotion: boolean;
    language: Language;
    spellCheck: boolean;
    dateFormat: DateFormat;
    timeFormat: TimeFormat;
    startOfWeek: StartOfWeek;
    privacyBlur: boolean;
    workspaceName: string;
    fontSize: 'sm' | 'base' | 'lg';
    fontFamily: 'sans' | 'serif' | 'mono';
    contentWidth: 'standard' | 'full';
    startView: 'dashboard' | 'journal' | 'year';
    accentColor: 'blue' | 'purple' | 'rose' | 'orange' | 'green' | 'cyan';
    soundEnabled: boolean;
    _updatedAt?: number;
}

interface PreferencesContextType {
    preferences: PreferencesState;
    updatePreferences: (updates: Partial<PreferencesState>) => void;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    setLanguage: (lang: Language) => void;
    toggleSpellCheck: () => void;
    setDateFormat: (format: DateFormat) => void;
    setTimeFormat: (format: TimeFormat) => void;
    setStartOfWeek: (start: StartOfWeek) => void;
    togglePrivacyBlur: () => void;
    toggleReducedMotion: () => void;
    setWorkspaceName: (name: string) => void;
    setFontSize: (size: 'sm' | 'base' | 'lg') => void;
    setFontFamily: (family: 'sans' | 'serif' | 'mono') => void;
    setContentWidth: (width: 'standard' | 'full') => void;
    setStartView: (view: 'dashboard' | 'journal' | 'year') => void;
    setAccentColor: (color: PreferencesState['accentColor']) => void;
    toggleSound: () => void;
}

const THEME_STORAGE_KEY = 'journal_theme_preference';

const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light' || stored === 'system') return stored as Theme;
    }
    return 'system'; // Default to system
};

const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
        const navLang = navigator.language;
        if (navLang.startsWith('en-GB')) return 'en-GB';
        if (navLang.startsWith('en-IN')) return 'en-IN';
        return 'en-US';
    }
    return 'en-US';
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState<PreferencesState>(() => {
        // Load from local storage on mount
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('ituts_preferences_v1');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    console.error("Failed to parse preferences", e);
                }
            }
        }
        return {
            theme: getInitialTheme(),
            reducedMotion: false,
            language: getInitialLanguage(),
            spellCheck: true,
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12',
            startOfWeek: 'sunday',
            privacyBlur: false,
            workspaceName: 'My Workspace',
            fontSize: 'base',
            fontFamily: 'sans',
            contentWidth: 'standard',
            startView: 'dashboard',
            accentColor: 'blue',
            soundEnabled: true
        };
    });

    // 1. Sync Theme to DOM
    useEffect(() => {
        const root = document.documentElement;
        const applyTheme = (targetTheme: Theme) => {
            let effectiveTheme = targetTheme;
            if (targetTheme === 'system') {
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                effectiveTheme = systemDark ? 'dark' : 'light';
            }
            if (effectiveTheme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };
        applyTheme(preferences.theme);

        if (preferences.theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme('system');
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [preferences.theme]);

    // 1.5 Sync Typography to DOM
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-font-size', preferences.fontSize);
        root.setAttribute('data-font-family', preferences.fontFamily);
    }, [preferences.fontSize, preferences.fontFamily]);

    // 2. Privacy Blur Effect
    useEffect(() => {
        if (!preferences.privacyBlur) {
            document.body.style.filter = 'none';
            return;
        }
        const handleBlur = () => {
            document.body.style.filter = 'blur(10px) grayscale(100%)';
            document.body.style.transition = 'filter 0.3s ease';
        };
        const handleFocus = () => {
            document.body.style.filter = 'none';
        };
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.body.style.filter = 'none';
        };
    }, [preferences.privacyBlur]);

    // 3. Persist to Local Storage whenever preferences change
    useEffect(() => {
        localStorage.setItem('ituts_preferences_v1', JSON.stringify(preferences));
    }, [preferences]);

    // 4. Sync FROM Cloud (on load) — load preferences from user metadata if available.
    // NOTE: The profiles.preferences column may not exist in all deployments.
    // We use user_metadata as the reliable fallback (always available via Supabase Auth).
    useEffect(() => {
        if (!user) return;

        // Use user metadata as the preferences source (always available, no schema dependency)
        if (user.user_metadata?.preferences) {
            setPreferences(prev => ({
                ...prev,
                ...user.user_metadata.preferences
            }));
        }
    }, [user]);

    // 5. Sync Accent Color to DOM (CSS Variable)
    useEffect(() => {
        const root = document.documentElement;
        // Map friendly names to actual HSL values or predefined classes
        // For simplicity, we'll set a data-accent attribute and handle colors in CSS
        root.setAttribute('data-accent', preferences.accentColor);
    }, [preferences.accentColor]);

    // Actions
    const updatePreferences = (updates: Partial<PreferencesState>) => {
        setPreferences(prev => {
            const next = { ...prev, ...updates, _updatedAt: Date.now() };

            // Sync to User Metadata (fast, always-available, no schema dependency)
            if (user) {
                supabase.auth.updateUser({
                    data: { preferences: next }
                }).then(({ error }) => {
                    if (error && import.meta.env.DEV) {
                        // eslint-disable-next-line no-console
                        console.warn('[Preferences] Metadata sync failed:', error.message);
                    }
                });
            }

            return next;
        });
    };

    // Legacy individual setters can wrap updatePreferences or use it directly
    const setTheme = (theme: Theme) => updatePreferences({ theme });
    const toggleTheme = () => {
        const cycles: Theme[] = ['system', 'dark', 'light'];
        const next = cycles[(cycles.indexOf(preferences.theme) + 1) % cycles.length];
        setTheme(next);
    };
    const setLanguage = (language: Language) => updatePreferences({ language });
    const toggleSpellCheck = () => updatePreferences({ spellCheck: !preferences.spellCheck });
    const setDateFormat = (dateFormat: DateFormat) => updatePreferences({ dateFormat });
    const setTimeFormat = (timeFormat: TimeFormat) => updatePreferences({ timeFormat });
    const setStartOfWeek = (startOfWeek: StartOfWeek) => updatePreferences({ startOfWeek });
    const togglePrivacyBlur = () => updatePreferences({ privacyBlur: !preferences.privacyBlur });
    const toggleReducedMotion = () => updatePreferences({ reducedMotion: !preferences.reducedMotion });
    const setWorkspaceName = (workspaceName: string) => updatePreferences({ workspaceName });

    const setFontSize = (fontSize: 'sm' | 'base' | 'lg') => updatePreferences({ fontSize });
    const setFontFamily = (fontFamily: 'sans' | 'serif' | 'mono') => updatePreferences({ fontFamily });
    const setContentWidth = (contentWidth: 'standard' | 'full') => updatePreferences({ contentWidth });
    const setStartView = (startView: 'dashboard' | 'journal' | 'year') => updatePreferences({ startView });
    const setAccentColor = (accentColor: PreferencesState['accentColor']) => updatePreferences({ accentColor });
    const toggleSound = () => updatePreferences({ soundEnabled: !preferences.soundEnabled });

    const value = {
        preferences,
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
        setWorkspaceName,
        setFontSize,
        setFontFamily,
        setContentWidth,
        setStartView,
        setAccentColor,
        toggleSound
    };

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
}
