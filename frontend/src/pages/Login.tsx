import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { ArrowRight, Boxes, AlertCircle, Loader2 } from 'lucide-react';
import '../styles/design-system.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem('jwt_token', response.token);
      // Smart redirect: go to intended route if saved, otherwise dashboard
      const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectTo);
    } catch (err) {
      console.error(err);
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* O brilho sutil no fundo para dar o aspecto premium */}
      <div className="auth-bg-glow" />
      
      <div className="auth-card glass-card">
        <header className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Boxes size={42} style={{ color: 'var(--linear-accent)' }} />
          </div>
          <h1 className="auth-title">Omni</h1>
          <p className="auth-subtitle">Entre na sua conta para continuar</p>
        </header>

        {error && (
          <div className="form-error" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="email">Endereço de e-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="secretaria@clinica.com.br"
              required
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary auth-button"
            disabled={isLoading}
            style={{ width: '100%', padding: '10px', fontSize: '14px', justifyContent: 'center' }}
          >
            {isLoading ? (
              <>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>Continuar</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <footer className="auth-footer">
          Não tem uma conta?{' '}
          <a href="#" className="auth-footer-link" style={{ color: 'var(--linear-accent)', textDecoration: 'none', fontWeight: 500 }}>
            Contate o suporte
          </a>
        </footer>
      </div>
    </div>
  );
};