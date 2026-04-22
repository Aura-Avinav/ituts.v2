import React from 'react';
import { Book, CheckSquare, Settings, Calendar, Trash2, Menu, X } from 'lucide-react';
import { Logo } from './ui/Logo';

import { cn } from '../lib/utils';
import { useStore } from '../hooks/useStore';

interface LayoutProps {
    children: React.ReactNode;
    currentView: 'dashboard' | 'journal' | 'achievements' | 'year' | 'settings';
    onNavigate: (view: 'dashboard' | 'journal' | 'achievements' | 'year' | 'settings') => void;
    currentDate?: Date;
}

export function Layout({ children, currentView, onNavigate, currentDate = new Date() }: LayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleMobileNavigate = (view: 'dashboard' | 'journal' | 'achievements' | 'year' | 'settings') => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans selection:bg-accent/20 relative isolation-auto">
            {/* Ambient Background - Makes Glassmorphism visible */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px] animate-pulse duration-[4000ms]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[100px] animate-pulse duration-[7000ms]" />
            </div>

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 border-b border-surfaceHighlight bg-surface/50 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-2 h-8">
                    <Logo className="h-full" />
                    <span className="font-bold text-lg">Ituts</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-secondary hover:text-primary transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Drawer Content */}
                    <aside className="absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-surface border-l border-surfaceHighlight p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex justify-end mb-8">
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-secondary hover:text-primary transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="space-y-4">
                            <NavItem
                                icon={<CheckSquare />}
                                label="Tracker"
                                active={currentView === 'dashboard'}
                                onClick={() => handleMobileNavigate('dashboard')}
                            />
                            <NavItem
                                icon={<Book />}
                                label="Journal"
                                active={currentView === 'journal'}
                                onClick={() => handleMobileNavigate('journal')}
                            />
                            <NavItem
                                icon={<Calendar />}
                                label="2026 Overview"
                                active={currentView === 'year'}
                                onClick={() => handleMobileNavigate('year')}
                            />

                            <hr className="border-surfaceHighlight my-4" />

                            <ResetButton currentDate={currentDate} />
                            <NavItem
                                icon={<Settings />}
                                label="Settings"
                                active={currentView === 'settings'}
                                onClick={() => handleMobileNavigate('settings')}
                            />
                        </nav>
                    </aside>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="w-64 border-r border-surfaceHighlight bg-surface/50 hidden md:flex flex-col p-4 fixed h-full z-10 backdrop-blur-md">
                <div className="flex items-center justify-start gap-3 mb-8 px-2 h-12">
                    <Logo className="h-full" />
                </div>

                <nav className="space-y-2">
                    <NavItem
                        icon={<CheckSquare />}
                        label="Tracker"
                        active={currentView === 'dashboard'}
                        onClick={() => onNavigate('dashboard')}
                    />
                    <NavItem
                        icon={<Book />}
                        label="Journal"
                        active={currentView === 'journal'}
                        onClick={() => onNavigate('journal')}
                    />
                    <NavItem
                        icon={<Calendar />}
                        label="2026 Overview"
                        active={currentView === 'year'}
                        onClick={() => onNavigate('year')}
                    />
                </nav>

                <div className="mt-auto space-y-2">
                    <ResetButton currentDate={currentDate} />
                    <NavItem
                        icon={<Settings />}
                        label="Settings"
                        active={currentView === 'settings'}
                        onClick={() => onNavigate('settings')}
                    />

                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden w-full max-w-[1920px] mx-auto animate-in fade-in duration-500 pt-6 md:pt-8">
                <div className={cn(
                    "mx-auto transition-all duration-300",
                    useStore().data.preferences?.contentWidth === 'full' ? "max-w-full" : "max-w-7xl"
                )}>
                    {children}
                </div>
            </main>
        </div>
    );
}



import { Modal } from './ui/Modal';

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                active
                    ? "bg-accent/10 text-accent"
                    : "text-secondary hover:bg-surfaceHighlight hover:text-primary"
            )}>
            <div className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform">{icon}</div>
            <span className="font-medium">{label}</span>
        </button>
    )
}

function ResetButton({ currentDate }: { currentDate: Date }) {
    const { resetMonthlyData } = useStore();
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    return (
        <>
            <NavItem
                icon={<Trash2 className="text-red-400" />}
                label="Reset Monthly Data"
                onClick={() => setIsConfirmOpen(true)}
            />

            <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title={`Reset ${monthName} Data?`}
            >
                <div className="space-y-4">
                    <p className="text-secondary">
                        This will delete tracked habits and data for <span className="text-primary font-bold">{monthName}</span> only.
                        <br />
                        Other months will remain unchanged.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsConfirmOpen(false)}
                            className="px-4 py-2 rounded-lg font-medium bg-surfaceHighlight text-secondary hover:text-foreground hover:bg-surfaceHighlight/80 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                resetMonthlyData(currentDate);
                                setIsConfirmOpen(false);
                            }}
                            className="px-4 py-2 rounded-lg font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                        >
                            Reset {monthName}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}


