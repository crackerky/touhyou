import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">アプリケーションエラー</h2>
            <p className="text-slate-700 mb-4">
              申し訳ありませんが、エラーが発生しました。ページを再読み込みするか、しばらく経ってからもう一度お試しください。
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {this.state.error?.message || "不明なエラー"}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;