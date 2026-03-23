import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  useEffect(() => { document.title = 'Página não encontrada — Omni B2B'; }, []);
  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #111118 100%)', fontFamily: "'Inter', sans-serif",
      flexDirection: 'column', gap: 24, textAlign: 'center',
    }}>
      <Boxes size={48} style={{ color: '#5E6AD2', opacity: 0.5 }} />
      <div>
        <h1 style={{ fontSize: 48, fontWeight: 800, color: '#EDEDED', marginBottom: 8, letterSpacing: '-0.03em' }}>404</h1>
        <p style={{ fontSize: 16, color: '#71717A' }}>Página não encontrada</p>
      </div>
      <Link to="/" style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
        background: 'rgba(94,106,210,0.1)', border: '1px solid rgba(94,106,210,0.3)',
        borderRadius: 8, color: '#7B85E0', textDecoration: 'none', fontWeight: 600, fontSize: 14,
      }}>
        <ArrowLeft size={16} /> Voltar para o início
      </Link>
    </div>
  );
};
