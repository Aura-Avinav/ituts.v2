import { User, Monitor, Database, Building, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export type SettingsTab = 'account' | 'preferences' | 'workspace' | 'data' | 'privacy';

interface SettingsSidebarProps {
    activeTab: SettingsTab;
    onTabChange: (tab: SettingsTab) => void;
}

const MENU_ITEMS: { id: SettingsTab; label: string; icon: LucideIcon }[] = [
    { id: 'account', label: 'My Account', icon: User },
    { id: 'preferences', label: 'My Settings', icon: Monitor },
    { id: 'workspace', label: 'Workspace', icon: Building }, // General workspace settings
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
];

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
    // const { signOut } = useStore(); // Not needed if we removed the button, but keeping imports clean

    return (
        <nav className="w-full md:w-64 flex flex-col gap-1 pr-4">
            <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 px-3">
                Settings
            </div>

            <div className="flex-1 space-y-1">
                {MENU_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-left",
                            activeTab === item.id
                                ? "bg-surfaceHighlight text-primary"
                                : "text-secondary hover:bg-surfaceHighlight/50 hover:text-foreground"
                        )}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </button>
                ))}
            </div>
        </nav>
    );
}
