import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import type { AppData } from '../../types';
import { parseObsidianFiles, parseNotionFiles } from '../../lib/importers';
import { Modal } from './Modal';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ImportSource = 'obsidian' | 'notion' | null;

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
    const { mergeData } = useStore();
    const [source, setSource] = useState<ImportSource>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
            setStatus('idle');
        }
    };

    const handleImport = async () => {
        if (!source || files.length === 0) return;

        setIsProcessing(true);
        setStatus('idle');

        try {
            let parsedData: Partial<AppData> = {};

            if (source === 'obsidian') {
                parsedData = await parseObsidianFiles(files);
            } else if (source === 'notion') {
                parsedData = await parseNotionFiles(files);
            }

            if ((!parsedData.todos || parsedData.todos.length === 0) && (!parsedData.habits || parsedData.habits.length === 0) && (!parsedData.journal || Object.keys(parsedData.journal).length === 0)) {
                setStatus('error');
                setStatusMessage("No data found. CSV needs a column named: 'Daily Work', 'Task', 'Habit', 'Name', 'Title' or 'Topic'.");
            } else {
                await mergeData(parsedData);
                setStatus('success');
                const count = (parsedData.todos?.length || 0) + Object.keys(parsedData.journal || {}).length;
                setStatusMessage(`Successfully imported ${count} items!`);
                setTimeout(() => {
                    onClose();
                    setFiles([]);
                    setSource(null);
                    setStatus('idle');
                }, 2000);
            }
        } catch (error) {
            console.error("Import failed:", error);
            setStatus('error');
            setStatusMessage("Failed to process files. Please check the format.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import Data">
            <div className="space-y-6">
                {/* Source Selection */}
                {!source ? (
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setSource('obsidian')}
                            className="flex flex-col items-center gap-3 p-6 rounded-xl border border-surfaceHighlight bg-surface/50 hover:bg-surfaceHighlight transition-all hover:scale-[1.02]"
                        >
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-foreground">Obsidian</span>
                            <span className="text-xs text-secondary text-center">Import Markdown daily notes & tasks</span>
                        </button>

                        <button
                            onClick={() => setSource('notion')}
                            className="flex flex-col items-center gap-3 p-6 rounded-xl border border-surfaceHighlight bg-surface/50 hover:bg-surfaceHighlight transition-all hover:scale-[1.02]"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-foreground">Notion</span>
                            <span className="text-xs text-secondary text-center">Import CSV exports</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <button
                            onClick={() => { setSource(null); setFiles([]); setStatus('idle'); }}
                            className="text-sm text-secondary hover:text-foreground flex items-center gap-1"
                        >
                            ← Back to selection
                        </button>

                        <div className="border-2 border-dashed border-surfaceHighlight rounded-xl p-8 text-center space-y-4 relative">
                            <input
                                type="file"
                                multiple
                                accept={source === 'obsidian' ? '.md' : '.csv,.md'}
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isProcessing}
                            />
                            <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                <Upload className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-foreground">
                                    {files.length > 0 ? `${files.length} files selected` : `Drop ${source} files here`}
                                </h3>
                                <p className="text-sm text-secondary mt-1">
                                    {source === 'obsidian' ? 'Select your daily notes (.md)' : 'Select CSV exports'}
                                </p>
                            </div>
                        </div>

                        {files.length > 0 && (
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-secondary hover:text-foreground"
                                    disabled={isProcessing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={isProcessing}
                                    className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Importing...
                                        </>
                                    ) : (
                                        <>
                                            Import {files.length} Files
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-500 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                {statusMessage}
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {statusMessage}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
