import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SettingsSidebar } from './settings/SettingsSidebar';
import type { SettingsTab } from './settings/SettingsSidebar';
import { AccountSettings } from './settings/tabs/AccountSettings';
import { PreferencesSettings } from './settings/tabs/PreferencesSettings';
import { WorkspaceSettings } from './settings/tabs/WorkspaceSettings';
import { DataSettings } from './settings/tabs/DataSettings';
import { PrivacyPolicy } from './settings/tabs/PrivacyPolicy';

export function SettingsView({ onBack }: { onBack: () => void }) {
    const [activeTab, setActiveTab] = useState<SettingsTab>('account');

    const renderContent = () => {
        switch (activeTab) {
            case 'account':
                return <AccountSettings />;
            case 'preferences':
                return <PreferencesSettings />;
            case 'workspace':
                return <WorkspaceSettings />; // General workspace settings
            case 'data':
                return <DataSettings />; // Reset, Import, Export
            case 'privacy':
                return <PrivacyPolicy />;
            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pt-2">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-secondary hover:text-primary hover:bg-surfaceHighlight rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-semibold text-foreground">Settings</h1>
            </div>

            {/* Content Area - Split View */}
            <div className="flex flex-col md:flex-row gap-8 flex-1">
                {/* Sidebar */}
                <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Main Content */}
                <div className="flex-1 min-w-0 pb-20">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
