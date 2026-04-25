import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, errorId: '' };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true, errorId: crypto.randomUUID().slice(0, 8) };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // In production, send to a logging service (e.g. Sentry).
        // We deliberately avoid console.error here to not leak stack traces.
        if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.error('[ErrorBoundary]', error, info);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, errorId: '' });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1.5rem',
                        padding: '2rem',
                        background: 'var(--color-background, #141414)',
                        color: 'var(--color-primary, #f5f0e8)',
                        fontFamily: 'inherit',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ fontSize: '3rem' }}>⚠️</div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            Something went wrong
                        </h1>
                        <p style={{ color: 'var(--color-secondary, #888)', maxWidth: '380px', lineHeight: 1.6 }}>
                            An unexpected error occurred. Your data is safe. Try refreshing the page or clicking the button below.
                        </p>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-secondary, #888)', opacity: 0.6 }}>
                            Error ID: {this.state.errorId}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            onClick={this.handleReset}
                            style={{
                                padding: '0.6rem 1.5rem',
                                background: 'var(--color-accent, #3b82f6)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                            }}
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '0.6rem 1.5rem',
                                background: 'transparent',
                                color: 'var(--color-primary, #f5f0e8)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                            }}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
