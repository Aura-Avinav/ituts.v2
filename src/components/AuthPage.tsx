import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

import { ArrowLeft } from 'lucide-react';

interface AuthPageProps {
    initialMode?: 'signin' | 'signup';
    onBack?: () => void;
}

export function AuthPage({ initialMode = 'signin', onBack }: AuthPageProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Account created! Please check your email to confirm your account.' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error) {
            let errorMessage = error instanceof Error ? error.message : 'An error occurred';
            if (errorMessage === 'Invalid login credentials') {
                errorMessage = 'Invalid email or password. Please check your credentials or sign up if you don\'t have an account.';
            }
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-2 relative">
                    {onBack && (
                        <button 
                            onClick={onBack}
                            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-secondary hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    )}
                    <div className="flex justify-center mb-6">
                        <img src="/ituts-logo.png" alt="Logo" className="h-16 w-auto" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-primary">
                        {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-secondary text-lg">
                        {mode === 'signin'
                            ? 'Sign in to your high-performance journal'
                            : 'Start your journey to better habits'}
                    </p>
                </div>

                <div className="bg-surface border border-surfaceHighlight rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleAuth} className="space-y-6">
                        {message && (
                            <div className={`p-4 rounded-xl flex items-start gap-3 text-sm ${message.type === 'success'
                                    ? 'bg-green-500/10 border border-green-500/20 text-green-600'
                                    : 'bg-red-500/10 border border-red-500/20 text-red-600'
                                }`}>
                                {message.type === 'success' ? (
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                )}
                                <span>{message.text}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary" htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (message) setMessage(null);
                                    }}
                                    className="w-full px-4 py-3 bg-surfaceHighlight/30 border border-surfaceHighlight rounded-xl text-primary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary" htmlFor="password">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (message) setMessage(null);
                                    }}
                                    className="w-full px-4 py-3 bg-surfaceHighlight/30 border border-surfaceHighlight rounded-xl text-primary placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-premium flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                                </>
                            ) : (
                                mode === 'signin' ? 'Sign In' : 'Sign Up'
                            )}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-surfaceHighlight/50"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-surfaceHighlight px-2 text-secondary rounded">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    const { error } = await supabase.auth.signInWithOAuth({
                                        provider: 'google',
                                        options: {
                                            redirectTo: window.location.origin,
                                        },
                                    });
                                    if (error) throw error;
                                } catch (error) {
                                    setMessage({
                                        type: 'error',
                                        text: error instanceof Error ? error.message : 'Error logging in with Google'
                                    });
                                }
                            }}
                            className="w-full py-3 px-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-background transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26..81-.58z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                            className="text-sm text-accent hover:underline focus:outline-none"
                        >
                            {mode === 'signin'
                                ? "Don't have an account? Sign Up"
                                : "Already have an account? Sign In"}
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-secondary/50">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
