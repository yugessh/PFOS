'use client';

import React, { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

/**
 * Global Error Boundary for production safety
 * Catches and handles React errors gracefully
 * Prevents white screen of death
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error in production (could send to error tracking service)
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking (Sentry, LogRocket, etc.)
      console.error('Error caught by boundary:', error, errorInfo);
    } else {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorCount: 0 });
    // Hard refresh
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
          <div className="max-w-md w-full">
            <div className="bg-card rounded-card p-6 border border-border shadow-card">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="w-12 h-12 text-destructive" />
              </div>

              <h1 className="text-2xl font-bold text-center mb-2">Oops! Something went wrong</h1>

              <p className="text-muted-foreground text-center mb-4">
                We encountered an unexpected error. Please try refreshing the page or go back to the dashboard.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-4 p-3 bg-destructive/10 rounded border border-destructive/30">
                  <p className="text-xs font-mono text-destructive break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-background font-semibold py-3 rounded-pill hover:brightness-110 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>

                <button
                  onClick={() => (window.location.href = '/dashboard')}
                  className="flex-1 py-3 rounded-pill border border-border text-foreground font-semibold hover:bg-card transition"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
