import React from 'react'
import ReactDOM from 'react-dom/client'
import MaquinaPerformance from './maquina-performance'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Erro capturado pelo Boundary:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '2rem',
                    background: '#1a1a2e',
                    color: '#ff4f6e',
                    fontFamily: 'monospace',
                    height: '100vh',
                    overflow: 'auto'
                }}>
                    <h2>⚠️ Algo deu errado na renderização</h2>
                    <p style={{ marginBottom: '1rem', color: '#fff' }}>
                        Tente recarregar a página. Se o erro persistir, pode ser um problema de compatibilidade com a biblioteca de IA.
                    </p>
                    <div style={{ background: '#0d0d1a', padding: '1rem', borderRadius: '8px', border: '1px solid #ff4f6e' }}>
                        <strong>Erro:</strong> {this.state.error && this.state.error.toString()}
                        <br /><br />
                        <strong>Detalhes:</strong>
                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <MaquinaPerformance />
        </ErrorBoundary>
    </React.StrictMode>,
)
