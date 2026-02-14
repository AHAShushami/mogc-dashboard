import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode; // Optional custom fallback
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
                    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg border border-red-100">
                        <div className="flex items-center gap-3 mb-4 text-red-600">
                            <AlertCircle className="w-8 h-8" />
                            <h2 className="text-xl font-bold">Something went wrong</h2>
                        </div>

                        <p className="text-slate-600 mb-4">
                            The application encountered an unexpected error.
                        </p>

                        <div className="bg-slate-100 p-3 rounded text-xs font-mono overflow-auto max-h-64 mb-4 border border-slate-200">
                            <p className="font-bold text-red-800 mb-1">{this.state.error && this.state.error.toString()}</p>
                            <pre className="text-slate-500 whitespace-pre-wrap">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
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

export default ErrorBoundary;
