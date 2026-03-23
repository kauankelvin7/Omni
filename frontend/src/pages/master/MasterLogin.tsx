import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import masterApi from '../../services/master';
import { Shield, ArrowRight, AlertTriangle, Loader2 } from 'lucide-react';

export const MasterLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Acesso Master — Omni B2B';
    if (localStorage.getItem('master_token')) navigate('/master/dashboard');
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await masterApi.post('/auth/login', { email, password });
      localStorage.setItem('master_token', res.data.token);
      navigate('/master/dashboard');
    } catch {
      setError('Credenciais inválidas ou acesso não autorizado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #060609 0%, #0c0c14 100%)',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        width: '100%', maxWidth: 400, padding: 40,
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 20, position: 'relative',
      }}>
        {/* Warning badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
          background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)',
          borderRadius: 999, padding: '6px 16px', fontSize: 12, fontWeight: 600,
          color: '#F87171', marginBottom: 32,
        }}>
          <AlertTriangle size={14} /> Acesso Restrito — Omni Master
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Shield size={40} style={{ color: '#DC2626', margin: '0 auto 12px' }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#EDEDED', marginBottom: 4 }}>Painel Master</h1>
          <p style={{ fontSize: 13, color: '#71717A', lineHeight: 1.5 }}>
            Esta área é exclusiva do administrador do sistema. Acesso não autorizado é monitorado.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.08)', color: '#F87171', padding: '10px 14px',
            borderRadius: 8, fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#A1A1AA', marginBottom: 6 }}>
              Email do administrador
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@omnib2b.com" required autoFocus disabled={loading}
              style={{
                width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#EDEDED',
                fontSize: 14, outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#A1A1AA', marginBottom: 6 }}>
              Senha
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required disabled={loading}
              style={{
                width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#EDEDED',
                fontSize: 14, outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: 'linear-gradient(180deg, #DC2626 0%, #991B1B 100%)',
            color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
            fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
          }}>
            {loading ? (
              <>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Autenticando...
              </>
            ) : (
              <>Entrar no Painel Master <ArrowRight size={16} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
