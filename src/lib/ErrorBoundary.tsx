import { Component, ErrorInfo, ReactNode } from 'react';
import { recordRomanEvent } from './roman-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ODYSSEY-1 Error Boundary
 * 
 * Catches React component errors and prevents full app crashes.
 * Logs errors to R.O.M.A.N. for autonomous monitoring and healing.
 * 
 * Usage:
 * <ErrorBoundary componentName="CustomerList">
 *   <CustomerListComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { componentName = 'UnknownComponent' } = this.props;

    console.error(`[ErrorBoundary] ${componentName} crashed:`, error, errorInfo);

    // Log to R.O.M.A.N. for autonomous monitoring
    recordRomanEvent({
      action_type: 'react_error_caught',
      context: {
        component: componentName,
        error_message: error.message,
        error_stack: error.stack,
        component_stack: errorInfo.componentStack,
      },
      payload: {
        error_name: error.name,
        timestamp: new Date().toISOString(),
      },
      severity: 'error',
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      const { fallback, componentName = 'Component' } = this.props;

      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 border border-red-200">
            <div className="flex items-center mb-4">
              <svg
                className="w-8 h-8 text-red-500 mr-3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">
                {componentName} Error
              </h2>
            </div>

            <p className="text-gray-700 mb-4">
              Something went wrong in this component. The error has been logged
              and R.O.M.A.N. has been notified for analysis.
            </p>

            {this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 font-medium">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto text-red-600">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Error ID logged to system_logs for debugging
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
