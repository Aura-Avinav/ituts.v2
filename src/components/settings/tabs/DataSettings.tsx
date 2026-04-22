import { useState } from 'react';
import { useStore } from '../../../hooks/useStore';
import { ImportModal } from '../../ui/ImportModal';
import { Modal } from '../../ui/Modal';
import { Upload, Download } from 'lucide-react';

export function DataSettings() {
    const { resetData, data } = useStore();
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const handleExport = () => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        const date = new Date().toISOString().split('T')[0];
        link.download = `ituts-backup-${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-2xl">
            <div>
                <h2 className="text-lg font-medium text-foreground mb-1">Data & Privacy</h2>
                <p className="text-sm text-secondary">Manage your data sources and reset application.</p>
            </div>

            <section className="space-y-6">
                {/* Export Section */}
                <div className="flex items-center justify-between py-4 border-b border-border/10">
                    <div>
                        <div className="font-medium text-foreground">Export Data</div>
                        <p className="text-sm text-secondary">Download a JSON backup of your habits and journal.</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground bg-surfaceHighlight hover:bg-surfaceHighlight/80 rounded-md transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                </div>

                {/* Import Section */}
                <div className="flex items-center justify-between py-4 border-b border-border/10">
                    <div>
                        <div className="font-medium text-foreground">Import Data</div>
                        <p className="text-sm text-secondary">Bring in data from Notion or Obsidian.</p>
                    </div>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground bg-surfaceHighlight hover:bg-surfaceHighlight/80 rounded-md transition-colors"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        Import
                    </button>
                </div>

                {/* Danger Zone */}
                <div className="pt-8">
                    <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-4">Danger Zone</h3>

                    <div className="border border-red-500/20 rounded-lg p-4 flex items-center justify-between bg-red-500/5">
                        <div>
                            <div className="font-medium text-red-500">Reset Application</div>
                            <p className="text-sm text-red-500/70">Permanently delete all data and return to defaults.</p>
                        </div>
                        <button
                            onClick={() => setIsResetModalOpen(true)}
                            className="px-4 py-2 text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-colors border border-red-500/20"
                        >
                            Reset to Defaults
                        </button>
                    </div>
                </div>

            </section>

            {/* Modals */}
            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
            />

            <Modal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                title="Reset All Data?"
            >
                <div className="space-y-4">
                    <p className="text-secondary">
                        This will <span className="text-red-400 font-bold">permanently delete</span> all your habits, todos, and achievements. This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsResetModalOpen(false)}
                            className="px-4 py-2 rounded-lg font-medium bg-surfaceHighlight text-secondary hover:text-foreground hover:bg-surfaceHighlight/80 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                resetData();
                                setIsResetModalOpen(false);
                            }}
                            className="px-4 py-2 rounded-lg font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                        >
                            Reset Everything
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
