import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  Activity, Building2, DollarSign, FileText, LogOut, Shield
} from 'lucide-react';

export const MasterLayout = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    localStorage.removeItem('master_token');
    window.location.href = '/master/login';
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#060609', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#0a0a10', borderRight: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', flexDirection: 'column', padding: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, padding: 8 }}>
          <Shield size={22} style={{ color: '#DC2626' }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#EDEDED' }}>Omni Master</span>
          <span style={{
            background: 'rgba(220,38,38,0.15)', color: '#F87171',
            padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, marginLeft: 'auto',
          }}>MASTER</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <Link to="/master/dashboard" className={`nav-link ${isActive('/master/dashboard')}`}>
            <Activity size={18} /> Dashboard
          </Link>
          <Link to="/master/tenants" className={`nav-link ${isActive('/master/tenants')}`}>
            <Building2 size={18} /> Clínicas
          </Link>
          <Link to="/master/revenue" className={`nav-link ${isActive('/master/revenue')}`}>
            <DollarSign size={18} /> Financeiro
          </Link>
          <Link to="/master/logs" className={`nav-link ${isActive('/master/logs')}`}>
            <FileText size={18} /> Logs
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="nav-link"
          style={{
            marginTop: 'auto', background: 'transparent', border: 'none',
            color: '#71717A', textAlign: 'left', cursor: 'pointer', outline: 'none', width: '100%',
          }}
        >
          <LogOut size={18} /> Sair
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 48px' }}>
        <Outlet />
      </main>
    </div>
  );
};
