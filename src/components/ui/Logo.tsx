import { useEffect, useState } from 'react';
import { usePreferences } from '../../contexts/PreferencesContext';
import { cn } from '../../lib/utils';

interface LogoProps {
    className?: string;
    alt?: string;
}

export function Logo({ className, alt = "Ituts Logo" }: LogoProps) {
    const { preferences } = usePreferences();
    const [mounted, setMounted] = useState(false);

    // Resolve effective theme
    const systemTheme = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const effectiveTheme = preferences.theme === 'system' ? systemTheme : preferences.theme;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by rendering a placeholder or default until mounted
    // However, for logos, a flash is better than layout shift.
    // We can try to guess server side but usually it defaults.

    const logoSrc = effectiveTheme === 'dark' ? '/dark-mode-logo.png' : '/light-mode.png';

    return (
        <div className={cn("relative transition-opacity duration-200 ease-in-out", className)}>
            <img
                src={logoSrc}
                alt={alt}
                className={cn(
                    "w-auto h-full object-contain transition-all duration-300",
                    mounted ? "opacity-100" : "opacity-0" // Facade to prevent hydration flicker if needed, or remove for instant
                )}
            />
        </div>
    );
}
