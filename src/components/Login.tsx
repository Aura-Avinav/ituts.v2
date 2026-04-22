import { useState } from 'react';
import { Lock, User, ArrowRight, Book } from 'lucide-react';

interface LoginProps {
    onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'Avinav' && password === '12356') {
            onLogin();
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-in fade-in py-12">
                <div className="text-center mb-10">
                    <div className="mx-auto w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 text-accent">
                        <Book className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
                    <p className="text-secondary">Enter your credentials to access your LifeOS</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 bg-surface/30 p-8 border border-surfaceHighlight rounded-2xl backdrop-blur-sm shadow-2xl">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-secondary ml-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-secondary/50" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-surfaceHighlight/50 border border-surfaceHighlight rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-secondary/30 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                                placeholder="Enter username"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-secondary ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-secondary/50" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-surfaceHighlight/50 border border-surfaceHighlight rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-secondary/30 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-danger text-sm text-center bg-danger/10 py-2 rounded-lg border border-danger/20">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-white text-black font-bold py-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                        Access Journal
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <p className="text-center text-secondary/40 text-xs mt-8">
                    Secured by LifeOS v1.0
                </p>
            </div>
        </div>
    );
}
