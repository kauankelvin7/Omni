import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Calendar, Users, Settings, Activity, LogOut, Boxes, BarChart3, CreditCard } from 'lucide-react';
import './index.css';

// Toast
import { ToastProvider } from './components/Toast';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Appointments } from './pages/Appointments';
import { Settings as SettingsPage } from './pages/Settings';
import { Landing } from './pages/Landing';
import { Register } from './pages/Register';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Reports } from './pages/Reports';
import { Pricing } from './pages/Pricing';
import { NotFound } from './pages/NotFound';
import { Billing } from './pages/Billing';

// Master Pages
import { MasterLogin } from './pages/master/MasterLogin';
import { MasterLayout } from './pages/master/MasterLayout';
import { MasterDashboard } from './pages/master/MasterDashboard';
import { MasterTenants } from './pages/master/MasterTenants';
import { MasterTenantDetail } from './pages/master/MasterTenantDetail';
import { MasterRevenue } from './pages/master/MasterRevenue';
import { MasterLogs } from './pages/master/MasterLogs';

// ==========================================
// Protected Route (Clinic users)
// ==========================================
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('jwt_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ==========================================
// Master Protected Route
// ==========================================
const MasterProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('master_token');
  if (!token) return <Navigate to="/master/login" replace />;
  return <>{children}</>;
};

// ==========================================
// Sidebar Navigation
// ==========================================
const Navigation = () => {
  const location = useLocation();

  const publicPaths = ['/login', '/register', '/terms', '/privacy', '/pricing', '/landing'];
  if (publicPaths.includes(location.pathname) || location.pathname === '/' || location.pathname.startsWith('/master')) return null;

  const isActive = (path: string) => (location.pathname === path ? 'active' : '');

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
        <Boxes size={24} style={{ color: 'var(--linear-accent)' }} />
        <span>Omni</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
          <Activity size={18} /> Dashboard
        </Link>
        <Link to="/appointments" className={`nav-link ${isActive('/appointments')}`}>
          <Calendar size={18} /> Agendamentos
        </Link>
        <Link to="/patients" className={`nav-link ${isActive('/patients')}`}>
          <Users size={18} /> Pacientes
        </Link>
        <Link to="/reports" className={`nav-link ${isActive('/reports')}`}>
          <BarChart3 size={18} /> Relatórios
        </Link>
        <Link to="/settings/billing" className={`nav-link ${isActive('/settings/billing')}`}>
          <CreditCard size={18} /> Pagamento
        </Link>
        <Link to="/settings" className={`nav-link ${isActive('/settings')}`}>
          <Settings size={18} /> Configurações
        </Link>
      </nav>

      <button
        className="nav-link"
        onClick={handleLogout}
        style={{
          marginTop: 'auto', background: 'transparent', border: 'none',
          color: 'var(--linear-text-secondary)', textAlign: 'left',
          cursor: 'pointer', outline: 'none', width: '100%',
        }}
        title="Sair do sistema"
      >
        <LogOut size={18} /> Sair
      </button>
    </aside>
  );
};

// ==========================================
// App
// ==========================================
function App() {
  const [offline, setOffline] = React.useState(false);

  React.useEffect(() => {
    const handleOffline = () => setOffline(true);
    window.addEventListener('api-offline', handleOffline);
    return () => window.removeEventListener('api-offline', handleOffline);
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="app-container" style={{ position: 'relative' }}>
          {offline && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              backgroundColor: '#ff453a', color: 'white',
              textAlign: 'center', padding: '8px', zIndex: 9999,
              fontWeight: 500, fontSize: '13px',
            }}>
              Sistema temporariamente indisponível. Verifique sua conexão.
              <button
                onClick={() => setOffline(false)}
                style={{ marginLeft: 16, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}
              >
                Ok
              </button>
            </div>
          )}
          <Navigation />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/settings/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

            {/* Master Routes */}
            <Route path="/master/login" element={<MasterLogin />} />
            <Route path="/master" element={<MasterProtectedRoute><MasterLayout /></MasterProtectedRoute>}>
              <Route path="dashboard" element={<MasterDashboard />} />
              <Route path="tenants" element={<MasterTenants />} />
              <Route path="tenants/:id" element={<MasterTenantDetail />} />
              <Route path="revenue" element={<MasterRevenue />} />
              <Route path="logs" element={<MasterLogs />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;