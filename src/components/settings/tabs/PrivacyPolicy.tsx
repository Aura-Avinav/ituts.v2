import { Shield, Lock, Database, EyeOff, ServerOff } from 'lucide-react';

export function PrivacyPolicy() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 max-w-3xl">
            <div>
                <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
                    <Shield className="w-8 h-8 text-primary" />
                    Data & Privacy
                </h2>
                <p className="text-secondary text-lg">
                    Your data stays with you. We believe in privacy by design.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PrivacyCard
                    icon={<Database className="w-6 h-6 text-blue-400" />}
                    title="Local Storage"
                    description="All your journals, habits, and metrics are stored locally on your device's browser. We do not have a central database reading your personal thoughts."
                />
                <PrivacyCard
                    icon={<Lock className="w-6 h-6 text-green-400" />}
                    title="End-to-End Control"
                    description="You have full control to export, import, or wipe your data at any time. It's your digital life, we just provide the paper."
                />
                <PrivacyCard
                    icon={<EyeOff className="w-6 h-6 text-purple-400" />}
                    title="No Ad Tracking"
                    description="We do not sell your data to advertisers. There are no hidden trackers or analytics scripts monitoring your personal entries."
                />
                <PrivacyCard
                    icon={<ServerOff className="w-6 h-6 text-orange-400" />}
                    title="Offline Capable"
                    description="Since data is local, Ituts works even without an internet connection. Sync happens only when you choose to use cloud features (if enabled)."
                />
            </div>

            <div className="bg-surface/30 border border-surfaceHighlight rounded-xl p-6 mt-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Policy</h3>
                <div className="space-y-4 text-secondary text-sm leading-relaxed">
                    <p>
                        <strong>1. Data Collection:</strong> Ituts does not collect personal data solely for the purpose of harvesting user information. Any data you input is stored in `localStorage` or your connected Supabase instance if you configured it personally.
                    </p>
                    <p>
                        <strong>2. Data Usage:</strong> Your data is used exclusively to display your habits, journals, and metrics within the application.
                    </p>
                    <p>
                        <strong>3. Third-Party Services:</strong> We use Google Authentication (optional) for login, which shares your name and email for identification purposes only.
                    </p>
                    <p>
                        <strong>4. Consent:</strong> By using Ituts, you consent to this local-first data processing model.
                    </p>
                </div>
            </div>
        </div>
    );
}

function PrivacyCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-surface/40 backdrop-blur-sm border border-surfaceHighlight p-6 rounded-xl hover:bg-surface/60 transition-colors duration-300">
            <div className="mb-4 bg-surfaceHighlight/30 w-12 h-12 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-secondary text-sm leading-relaxed">
                {description}
            </p>
        </div>
    );
}
