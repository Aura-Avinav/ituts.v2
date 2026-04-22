import { useEffect } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';

export function useDynamicFavicon() {
    const { preferences } = usePreferences();

    useEffect(() => {
        const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) return;

        // Determine current effective theme
        let effectiveTheme = preferences.theme;
        if (effectiveTheme === 'system') {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            effectiveTheme = systemDark ? 'dark' : 'light';
        }

        // Set favicon based on theme
        if (effectiveTheme === 'dark') {
            link.href = '/dark-mode-logo.png';
        } else {
            link.href = '/light-mode.png';
        }

        // Optional: Listen to system changes if theme is 'system'
        if (preferences.theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e: MediaQueryListEvent) => {
                link.href = e.matches ? '/dark-mode-logo.png' : '/light-mode.png';
            };
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [preferences.theme]);
}
