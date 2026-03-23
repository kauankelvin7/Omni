import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh',
          background: 'var(--linear-bg, #0d0d0d)', color: 'var(--linear-text, #f0f0f0)',
          fontFamily: 'Inter, sans-serif', padding: 32, textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, marginBottom: 24,
          }}>
            ⚠️
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            Algo deu errado
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24, maxWidth: 400 }}>
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'var(--linear-accent, #5E6AD2)', border: 'none',
              color: 'white', padding: '10px 24px', borderRadius: 8,
              fontSize: 14, cursor: 'pointer', fontWeight: 500,
            }}
          >
            Recarregar página
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.04)',
              borderRadius: 8, fontSize: 11, color: '#ff6b6b',
              textAlign: 'left', maxWidth: 600, overflow: 'auto',
            }}>
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
