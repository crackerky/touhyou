import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
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
    this.setState({ errorInfo });
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
            <div className="text-sm text-slate-500 mt-2 overflow-auto max-h-40 p-2 bg-slate-50 rounded">
              <p><strong>エラー:</strong> {this.state.error?.message || "不明なエラー"}</p>
              {this.state.errorInfo && (
                <details>
                  <summary className="cursor-pointer text-blue-500">詳細情報</summary>
                  <pre className="whitespace-pre-wrap text-xs mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
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