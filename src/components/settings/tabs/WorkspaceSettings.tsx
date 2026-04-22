import { useState, useEffect } from 'react';
import { useStore } from '../../../hooks/useStore';
import { usePreferences } from '../../../contexts/PreferencesContext';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function WorkspaceSettings() {
    const { exportData } = useStore();
    const { preferences, updatePreferences } = usePreferences();

    // Stable initialization
    const [workspaceName, setWorkspaceName] = useState(() => preferences.workspaceName || "My Workspace");

    // Sync from global if not dirty (optional, but good for resets)
    useEffect(() => {
        setWorkspaceName(preferences.workspaceName || "My Workspace");
    }, [preferences.workspaceName]);

    // Check for changes
    const hasChanges = workspaceName !== (preferences.workspaceName || "My Workspace");

    const handleSave = () => {
        updatePreferences({ workspaceName });
    };

    const handleCancel = () => {
        setWorkspaceName(preferences.workspaceName || "My Workspace");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-2xl px-1 relative">
            <div>
                <h2 className="text-xl font-semibold text-foreground tracking-tight">Workspace</h2>
                <p className="text-sm text-secondary leading-relaxed">Manage your workspace settings and exports.</p>
            </div>

            <section className="space-y-6 py-2">
                {/* Workspace Name */}
                <div className="grid gap-2">
                    <label className="text-sm font-medium text-secondary">Workspace Name</label>
                    <input
                        type="text"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        className="w-full p-3 bg-transparent hover:bg-surfaceHighlight/30 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-secondary/40"
                        placeholder="My Awesome Workspace"
                    />
                </div>

                {/* Analytics Toggle (Mock) */}
                <div className="flex items-center justify-between py-4">
                    <div className="pr-8">
                        <div className="font-medium text-foreground text-sm">Analytics</div>
                        <p className="text-xs text-secondary mt-0.5">
                            Save and display page view analytics.
                        </p>
                    </div>
                    {/* Simple Toggle Switch Mockup */}
                    <div className="w-10 h-6 bg-surfaceHighlight rounded-full relative cursor-not-allowed opacity-50">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-secondary/50 rounded-full shadow-sm"></div>
                    </div>
                </div>

                {/* Export Content */}
                <div className="flex items-center justify-between py-4">
                    <div>
                        <div className="font-medium text-foreground text-sm">Export Content</div>
                        <p className="text-xs text-secondary mt-0.5">
                            Download all your data (JSON).
                        </p>
                    </div>
                    <button
                        onClick={exportData}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-foreground bg-surfaceHighlight/50 hover:bg-surfaceHighlight rounded-lg transition-all active:scale-95"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                </div>
            </section>

            {/* Floating Action Bar for Unsaved Changes */}
            <AnimatePresence>
                {hasChanges && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="fixed bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 flex items-center justify-between md:justify-start gap-2 p-1.5 pr-2 bg-card/95 backdrop-blur-xl text-foreground rounded-full shadow-2xl border border-primary/20 ring-1 ring-black/5 dark:ring-white/10"
                    >
                        <div className="pl-3 pr-2 py-1.5 text-xs font-medium flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Unsaved changes
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleCancel}
                                className="px-3 py-1.5 rounded-full text-xs font-medium text-secondary hover:text-foreground hover:bg-surfaceHighlight/50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
