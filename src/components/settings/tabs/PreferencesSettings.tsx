import { Moon, Sun, Monitor, Type, Check, Globe, Languages, Volume2 } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '../../../lib/utils';

export function PreferencesSettings() {
    const {
        data,
        updatePreferences
    } = useStore();

    // Safely access global preferences with defaults
    // Safely access global preferences with defaults
    const globalPreferences = {
        theme: data.preferences?.theme || 'system',
        reducedMotion: data.preferences?.reducedMotion || false,
        language: data.preferences?.language || 'en-US',
        spellCheck: data.preferences?.spellCheck ?? true,
        dateFormat: data.preferences?.dateFormat || 'MM/DD/YYYY',
        timeFormat: data.preferences?.timeFormat || '12',
        startOfWeek: data.preferences?.startOfWeek || 'sunday',
        privacyBlur: data.preferences?.privacyBlur || false,
        workspaceName: data.preferences?.workspaceName || 'My Workspace',
        fontSize: data.preferences?.fontSize || 'base',
        fontFamily: data.preferences?.fontFamily || 'sans',
        contentWidth: data.preferences?.contentWidth || 'standard',
        startView: data.preferences?.startView || 'dashboard',
        accentColor: data.preferences?.accentColor || 'blue',
        soundEnabled: data.preferences?.soundEnabled ?? true,
        _updatedAt: data.preferences?._updatedAt
    };

    // Memoize global preferences to avoid unstable reference issues from useStore
    const stableGlobalPreferences = useMemo(() => globalPreferences, [JSON.stringify(globalPreferences)]);

    // Local Draft State
    const [draft, setDraft] = useState(stableGlobalPreferences);
    const [isDirty, setIsDirty] = useState(false);

    // Sync draft with global state only when global state *values* change significantly
    useEffect(() => {
        if (!isDirty) {
            // console.log('[PreferencesSettings] syncing draft to global:', stableGlobalPreferences.contentWidth);
            setDraft(stableGlobalPreferences);
        } else {
            // console.log('[PreferencesSettings] NOT syncing (dirty). Global:', stableGlobalPreferences.contentWidth, 'Draft:', draft.contentWidth);
        }
    }, [stableGlobalPreferences, isDirty]);

    const handleChange = (key: keyof typeof draft, value: any) => {
        setDraft(prev => {
            const next = { ...prev, [key]: value };

            // Compare with stable global preferences
            const keysToCheck = [
                'theme', 'language', 'spellCheck', 'dateFormat',
                'timeFormat', 'startOfWeek', 'privacyBlur', 'reducedMotion',
                'fontSize', 'fontFamily', 'contentWidth', 'startView',
                'accentColor', 'soundEnabled'
            ] as const;

            const hasChanges = keysToCheck.some(k => next[k] !== stableGlobalPreferences[k]);

            setIsDirty(hasChanges);
            return next;
        });
    };

    const handleSave = () => {
        updatePreferences(draft);
        setIsDirty(false); // Optimistically set dirty to false
    };

    const handleCancel = () => {
        setDraft(stableGlobalPreferences);
        setIsDirty(false);
    };

    // Helper for animation
    const spring = {
        type: "spring" as const,
        stiffness: 700,
        damping: 30
    };

    const themes = [
        { id: 'light', icon: Sun, label: 'Light' },
        { id: 'dark', icon: Moon, label: 'Dark' },
        { id: 'system', icon: Monitor, label: 'System' }
    ] as const;

    return (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl px-1 pb-24 relative">
            {/* Header */}
            <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground tracking-tight">Preferences</h2>
                <p className="text-sm text-secondary leading-relaxed">Customize your experience to fit your workflow.</p>
            </div>

            <div className="grid gap-6">

                {/* Appearance Card */}
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-accent/10 text-accent">
                                <Monitor className="w-4 h-4" />
                            </div>
                            Appearance
                        </h3>
                        <p className="text-xs text-secondary pl-9">Choose how the app looks.</p>
                    </div>

                    <div className="p-1 rounded-xl inline-flex relative w-full sm:w-auto">
                        <AnimatePresence>
                            {/* Active Background Pill */}
                            <motion.div
                                layoutId="theme-active"
                                className="absolute inset-y-1 rounded-lg bg-surfaceHighlight/50 shadow-sm"
                                style={{
                                    left: `calc(${themes.findIndex(t => t.id === draft.theme) * 33.333}% + 0.25rem)`,
                                    width: `calc(33.333% - 0.5rem)`
                                }}
                                transition={spring}
                            />
                        </AnimatePresence>

                        {themes.map((t) => {
                            const Icon = t.icon;
                            const isActive = draft.theme === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => handleChange('theme', t.id)}
                                    className={cn(
                                        "relative z-10 flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium transition-colors duration-200 rounded-lg select-none",
                                        isActive ? "text-foreground" : "text-secondary hover:text-foreground/80"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", isActive && "fill-current text-accent")} />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Accent & Sound */}
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-accent/10 text-accent">
                                <span className="w-4 h-4 rounded-full border-2 border-current block" />
                            </div>
                            Personalize
                        </h3>
                        <p className="text-xs text-secondary pl-9">Make it yours.</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Accent Color */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                Accent Color
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'blue', color: 'bg-blue-500' },
                                    { id: 'purple', color: 'bg-purple-500' },
                                    { id: 'rose', color: 'bg-rose-500' },
                                    { id: 'orange', color: 'bg-orange-500' },
                                    { id: 'green', color: 'bg-green-500' },
                                    { id: 'cyan', color: 'bg-cyan-500' },
                                ].map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => handleChange('accentColor', c.id)}
                                        className={cn(
                                            "w-8 h-8 rounded-full transition-all flex items-center justify-center ring-2 ring-offset-2 ring-offset-background",
                                            c.color,
                                            draft.accentColor === c.id ? "ring-foreground scale-110" : "ring-transparent hover:scale-110"
                                        )}
                                        aria-label={`Select ${c.id} accent`}
                                    >
                                        {draft.accentColor === c.id && <Check className="w-4 h-4 text-white font-bold" strokeWidth={3} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sound Effects */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                <Volume2 className="w-3.5 h-3.5" /> Sound Effects
                            </label>
                            <button
                                onClick={() => handleChange('soundEnabled', !draft.soundEnabled)}
                                className={cn(
                                    "w-full p-2.5 rounded-lg text-sm text-left flex items-center justify-between transition-all",
                                    draft.soundEnabled
                                        ? "bg-accent/10 text-accent font-medium"
                                        : "bg-transparent text-secondary hover:bg-surfaceHighlight/30"
                                )}
                            >
                                {draft.soundEnabled ? 'On' : 'Off'}
                                <div className={cn("w-8 h-5 rounded-full relative transition-colors", draft.soundEnabled ? "bg-accent" : "bg-border/40")}>
                                    <div className={cn("absolute top-1 bottom-1 w-3 h-3 bg-white rounded-full transition-all", draft.soundEnabled ? "left-4" : "left-1")} />
                                </div>
                            </button>
                            <p className="text-xs text-secondary">Play sounds when completing tasks.</p>
                        </div>
                    </div>
                </div>

                {/* General Settings */}
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-accent/10 text-accent">
                                <Globe className="w-4 h-4" />
                            </div>
                            General
                        </h3>
                        <p className="text-xs text-secondary pl-9">Language, date, and time settings.</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Language */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                <Languages className="w-3.5 h-3.5" /> Language
                            </label>
                            <div className="relative">
                                <select
                                    value={draft.language || 'en-US'}
                                    onChange={(e) => handleChange('language', e.target.value)}
                                    className="w-full p-2.5 bg-transparent hover:bg-surfaceHighlight/30 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none pl-3"
                                >
                                    <option value="en-US">English (US)</option>
                                    <option value="en-GB">English (UK)</option>
                                    <option value="en-IN">English (India)</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Spell Check */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                <Type className="w-3.5 h-3.5" /> Spell Check
                            </label>
                            <button
                                onClick={() => handleChange('spellCheck', !draft.spellCheck)}
                                className={cn(
                                    "w-full p-2.5 rounded-lg text-sm text-left flex items-center justify-between transition-all",
                                    draft.spellCheck
                                        ? "bg-accent/10 text-accent font-medium dark:text-accent"
                                        : "bg-transparent text-secondary hover:bg-surfaceHighlight/30"
                                )}
                            >
                                {draft.spellCheck ? 'Enabled' : 'Disabled'}
                                <div className={cn("w-4 h-4 rounded-full flex items-center justify-center transition-colors", draft.spellCheck ? "bg-accent text-white" : "bg-border/20")}>
                                    {draft.spellCheck && <Check className="w-2.5 h-2.5" />}
                                </div>
                            </button>
                        </div>

                        {/* Date Format */}
                        {/* Date Format (Coming Soon) */}
                        {/* 
                        <div className="space-y-2 opacity-50 pointer-events-none filter grayscale">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Date Format
                            </label>
                            <div className="relative">
                                <select
                                    value={draft.dateFormat || 'MM/DD/YYYY'}
                                    onChange={(e) => handleChange('dateFormat', e.target.value)}
                                    className="w-full p-2.5 bg-transparent hover:bg-surfaceHighlight/30 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none pl-3"
                                >
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2 opacity-50 pointer-events-none filter grayscale">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> Time Format
                            </label>
                             <div className="flex gap-2">
                                {[
                                    { value: '12', label: '12-Hour' },
                                    { value: '24', label: '24-Hour' }
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleChange('timeFormat', opt.value)}
                                        className={cn(
                                            "flex-1 p-2.5 text-sm font-medium rounded-lg transition-all",
                                            draft.timeFormat === opt.value
                                                ? "bg-blue-500/5 text-blue-600 dark:text-blue-400"
                                                : "bg-transparent text-secondary hover:bg-surfaceHighlight/30"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div> 
                        */}

                        {/* Start of Week */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-secondary flex items-center gap-2">
                                Start of Week
                            </label>
                            <div className="flex gap-2">
                                {[
                                    { value: 'sunday', label: 'Sunday' },
                                    { value: 'monday', label: 'Monday' }
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleChange('startOfWeek', opt.value)}
                                        className={cn(
                                            "flex-1 p-2.5 text-sm font-medium rounded-lg transition-all capitalize",
                                            draft.startOfWeek === opt.value
                                                ? "bg-accent/10 text-accent font-medium dark:text-accent"
                                                : "bg-transparent text-secondary hover:bg-surfaceHighlight/30"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


                {/* Privacy & Data */}
                {/* Typography */}
                {/* Typography & System */}
                <div className="space-y-8">
                    {/* Typography Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Type className="w-5 h-5 text-secondary" />
                            <h3 className="text-base font-medium text-foreground">Typography</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Font Size */}
                            <div className="space-y-3">
                                <label className="text-xs font-medium text-secondary uppercase tracking-wider">Font Size</label>
                                <div className="flex bg-surfaceHighlight/30 rounded-lg p-1">
                                    {[
                                        { value: 'sm', label: 'Small', icon: 'A', size: 'text-xs' },
                                        { value: 'base', label: 'Medium', icon: 'A', size: 'text-base' },
                                        { value: 'lg', label: 'Large', icon: 'A', size: 'text-xl' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleChange('fontSize', opt.value)}
                                            className={cn(
                                                "flex-1 py-1.5 rounded-md transition-all flex items-center justify-center",
                                                draft.fontSize === opt.value
                                                    ? "bg-background shadow-sm text-foreground"
                                                    : "text-secondary hover:text-foreground/80"
                                            )}
                                            title={opt.label}
                                        >
                                            <span className={opt.size} style={{ fontWeight: 600 }}>{opt.icon}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Font Family */}
                            <div className="space-y-3">
                                <label className="text-xs font-medium text-secondary uppercase tracking-wider">Font Family</label>
                                <div className="flex bg-surfaceHighlight/30 rounded-lg p-1">
                                    {[
                                        { value: 'sans', label: 'Sans', family: 'font-sans' },
                                        { value: 'serif', label: 'Serif', family: 'font-serif' },
                                        { value: 'mono', label: 'Mono', family: 'font-mono' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleChange('fontFamily', opt.value)}
                                            className={cn(
                                                "flex-1 py-1.5 rounded-md transition-all text-xs font-medium",
                                                draft.fontFamily === opt.value
                                                    ? "bg-background shadow-sm text-foreground"
                                                    : "text-secondary hover:text-foreground/80",
                                                opt.family
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-border/5 w-full" />

                    {/* System Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Monitor className="w-5 h-5 text-secondary" />
                            <h3 className="text-base font-medium text-foreground">System</h3>
                        </div>

                        {/* Content Width */}
                        <div className="space-y-3">
                            <label className="text-xs font-medium text-secondary uppercase tracking-wider">Content Width</label>
                            <div className="flex bg-surfaceHighlight/30 rounded-lg p-1">
                                {[
                                    { value: 'standard', label: 'Focus', desc: 'Centered (Max 7xl)' },
                                    { value: 'full', label: 'Full Width', desc: 'Edge to Edge' },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleChange('contentWidth', opt.value)}
                                        className={cn(
                                            "flex-1 py-2 px-3 rounded-md transition-all flex flex-col items-center justify-center gap-0.5",
                                            (draft.contentWidth || 'standard') === opt.value
                                                ? "bg-background shadow-sm text-foreground"
                                                : "text-secondary hover:text-foreground/80"
                                        )}
                                    >
                                        <span className="text-xs font-semibold">{opt.label}</span>
                                        <span className="text-[10px] opacity-70 hidden sm:block">{opt.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Default Start View */}
                        <div className="space-y-3">
                            <label className="text-xs font-medium text-secondary uppercase tracking-wider">Default Startup View</label>
                            <div className="flex bg-surfaceHighlight/30 rounded-lg p-1">
                                {[
                                    { value: 'dashboard', label: 'Tracker' },
                                    { value: 'journal', label: 'Journal' },
                                    { value: 'year', label: '2026' },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleChange('startView', opt.value)}
                                        className={cn(
                                            "flex-1 py-2 px-3 rounded-md transition-all",
                                            (draft.startView || 'dashboard') === opt.value
                                                ? "bg-background shadow-sm text-foreground font-semibold"
                                                : "text-secondary hover:text-foreground/80 font-medium"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-border/5 w-full my-2" />

                        <button
                            onClick={() => handleChange('reducedMotion', !draft.reducedMotion)}
                            className={cn(
                                "p-4 rounded-xl transition-all text-left space-y-2 group hover:bg-surfaceHighlight/10 w-full",
                                draft.reducedMotion
                                    ? "bg-accent/10"
                                    : "bg-transparent"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className={cn("text-sm font-medium", draft.reducedMotion ? "text-accent dark:text-accent" : "text-foreground")}>Reduce Motion</span>
                                <div className={cn("w-8 h-5 rounded-full relative transition-colors", draft.reducedMotion ? "bg-accent" : "bg-border/40")}>
                                    <div className={cn("absolute top-1 bottom-1 w-3 h-3 bg-white rounded-full transition-all", draft.reducedMotion ? "left-4" : "left-1")} />
                                </div>
                            </div>
                            <p className="text-xs text-secondary leading-relaxed">
                                Minimize UI animations.
                            </p>
                        </button>
                    </div>
                </div>


            </div>

            {/* Floating Save Action Bar */}
            <AnimatePresence>
                {isDirty && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="fixed bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 flex items-center justify-between md:justify-start gap-2 p-1.5 pr-2 bg-card/95 backdrop-blur-xl text-foreground rounded-full shadow-2xl border border-primary/20 ring-1 ring-black/5 dark:ring-white/10"
                    >
                        <div className="pl-4 pr-2 text-sm font-medium whitespace-nowrap flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            Unsaved Changes
                        </div>
                        <div className="h-6 w-px bg-border mx-1" />
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-surfaceHighlight rounded-full transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-5 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-transform active:scale-95 shadow-sm"
                        >
                            Save Changes
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
