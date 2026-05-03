import React from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export default class RomanErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null, errorId: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, info: React.ErrorInfo) {
    const errorId = `fe-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this.setState({ errorId });

    // Report to R.O.M.A.N. — he needs to know about frontend failures
    try {
      await supabase.from('system_logs').insert({
        source: 'frontend_error_boundary',
        message: `React error: ${error.message}`,
        level: 'error',
        metadata: {
          error_id: errorId,
          error_name: error.name,
          error_message: error.message,
          component_stack: info.componentStack?.slice(0, 2000),
          url: window.location.pathname,
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      });
    } catch {
      // Reporting failure must never mask the original error
    }

    console.error('[RomanErrorBoundary] React error reported to R.O.M.A.N.:', error.message);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="max-w-md w-full bg-slate-800 border border-red-500/30 rounded-xl p-6 text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h2 className="text-white font-bold text-lg mb-2">Component Error</h2>
          <p className="text-slate-400 text-sm mb-4">
            R.O.M.A.N. has been notified. This error has been logged for autonomous analysis.
          </p>
          {this.state.errorId && (
            <p className="text-slate-500 text-xs mb-4 font-mono">ID: {this.state.errorId}</p>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorId: null })}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
}
