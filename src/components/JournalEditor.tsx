import { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { cn } from '../lib/utils';
import { ChevronRight, Calendar, Save, Trash2, Search, Maximize2, Minimize2 } from 'lucide-react';

import { format } from 'date-fns';

export function JournalEditor() {
    const { data, updateJournal } = useStore();
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    });
    const [content, setContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Load content when date changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setContent(data.journal[selectedDate] || '');
    }, [selectedDate, data.journal]);

    // Autosave after delay
    useEffect(() => {
        const timer = setTimeout(() => {
            const cleanContent = content.trim();
            const currentSaved = (data.journal[selectedDate] || '').trim();

            if (content !== (data.journal[selectedDate] || '')) {
                // If the user cleared the content (or it's just whitespace), send empty string to trigger deletion
                if (!cleanContent) {
                    if (currentSaved) {
                        updateJournal(selectedDate, '');
                    }
                } else {
                    updateJournal(selectedDate, content);
                }
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [content, selectedDate, data.journal, updateJournal]);

    const formattedDate = dateFnsFormat(selectedDate);

    // Filter entries for sidebar
    const filteredDates = Object.keys(data.journal).filter(date => {
        const entryContent = data.journal[date]?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return entryContent.includes(query) || date.includes(query);
    }).sort().reverse();

    return (
        <div className={cn(
            "flex flex-col md:flex-row gap-6 animate-in fade-in duration-500",
            isFocusMode ? "fixed inset-0 z-50 bg-background p-8" : "h-[80vh]"
        )}>
            {/* Sidebar: Date Picker / List */}
            <div className={cn(
                "w-full md:w-64 bg-surface/30 border border-surfaceHighlight rounded-xl flex flex-col p-4 shrink-0 transition-all duration-500",
                isFocusMode ? "hidden" : ""
            )}>
                <div className="mb-6 space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 block">Jump to Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-surfaceHighlight/50 border border-surfaceHighlight text-white text-sm rounded-lg focus:ring-accent focus:border-accent block w-full p-2.5"
                        />
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary" />
                        <input
                            type="text"
                            placeholder="Search entries..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surfaceHighlight/30 border border-surfaceHighlight rounded-lg pl-9 pr-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-accent outline-none placeholder:text-secondary/50"
                        />
                    </div>
                </div>

                <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Saved Entries
                </h3>

                <div className="flex-1 overflow-y-auto space-y-1">
                    {filteredDates.length > 0 ? (
                        filteredDates.map(date => (
                            <button
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group",
                                    date === selectedDate ? "bg-accent/20 text-accent" : "text-secondary hover:bg-surfaceHighlight"
                                )}
                            >
                                <span>{date}</span>
                                <ChevronRight className={cn("w-4 h-4 opacity-0 transition-opacity", date === selectedDate ? "opacity-100" : "group-hover:opacity-50")} />
                            </button>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-secondary/50">
                            <span className="text-xs italic">No saved entries</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 bg-surface/30 border border-surfaceHighlight rounded-xl flex flex-col relative overflow-hidden focus-within:ring-1 focus-within:ring-accent/50 transition-all">
                <div className="p-4 border-b border-surfaceHighlight flex items-center justify-between bg-surface/50">
                    <span className="text-secondary text-sm">
                        Journaling - <span className="text-primary font-bold">{formattedDate}</span>
                    </span>
                    <div className="flex items-center gap-4 text-xs text-secondary">
                        {/* Status Indicator */}
                        {content.trim() ? (
                            <div className="flex items-center gap-2">
                                {content !== (data.journal[selectedDate] || '') ? 'Saving...' : 'Saved'}
                                <Save className="w-4 h-4 opacity-50" />
                            </div>
                        ) : (
                            <span className="opacity-50 italic">No Entry Saved</span>
                        )}

                        {/* Focus Mode Toggle */}
                        <button
                            onClick={() => setIsFocusMode(!isFocusMode)}
                            className="p-1.5 hover:bg-surfaceHighlight rounded-md transition-colors text-secondary"
                            title={isFocusMode ? "Exit Zen Mode" : "Enter Zen Mode"}
                        >
                            {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>

                        {/* Delete Button */}
                        {(data.journal[selectedDate] || '').trim() && (
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
                                        updateJournal(selectedDate, '');
                                        setContent(''); // Clear local state immediately
                                    }
                                }}
                                className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-colors text-secondary"
                                title="Delete entry"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your thoughts..."
                    className="flex-1 w-full bg-transparent p-6 resize-none focus:outline-none text-foreground leading-relaxed text-lg"
                />
            </div>
        </div>
    );
}

const dateFnsFormat = (dateStr: string) => {
    try {
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return format(date, 'PPP');
    } catch {
        return dateStr;
    }
};
