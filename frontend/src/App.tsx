import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Calendar, Users, Settings, Activity, LogOut, Boxes, BarChart3, CreditCard } from 'lucide-react';
import './index.css';

// Toast
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingProvider, loadingBus } from './components/LoadingContext';
import { ColdStartBanner } from './components/layout/ColdStartBanner';
import api from './services/api';

// Wire loadingBus → LoadingContext
let _loadingIncrement: (() => void) | null = null;
let _loadingDecrement: (() => void) | null = null;
loadingBus.listeners.add((delta: number) => {
  if (delta > 0) _loadingIncrement?.();
  else _loadingDecrement?.();
});

// Lazy-loaded pages (reduces initial bundle ~80KB)
const Login = React.lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Patients = React.lazy(() => import('./pages/Patients').then((m) => ({ default: m.Patients })));
const Appointments = React.lazy(() => import('./pages/Appointments').then((m) => ({ default: m.Appointments })));
const SettingsPage = React.lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const Landing = React.lazy(() => import('./pages/Landing').then((m) => ({ default: m.Landing })));
const Register = React.lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));
const Terms = React.lazy(() => import('./pages/Terms').then((m) => ({ default: m.Terms })));
const Privacy = React.lazy(() => import('./pages/Privacy').then((m) => ({ default: m.Privacy })));
const Reports = React.lazy(() => import('./pages/Reports').then((m) => ({ default: m.Reports })));
const Pricing = React.lazy(() => import('./pages/Pricing').then((m) => ({ default: m.Pricing })));
const NotFound = React.lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));
const Billing = React.lazy(() => import('./pages/Billing').then((m) => ({ default: m.Billing })));

// Master pages
const MasterLogin = React.lazy(() => import('./pages/master/MasterLogin').then((m) => ({ default: m.MasterLogin })));
const MasterLayout = React.lazy(() => import('./pages/master/MasterLayout').then((m) => ({ default: m.MasterLayout })));
const MasterDashboard = React.lazy(() => import('./pages/master/MasterDashboard').then((m) => ({ default: m.MasterDashboard })));
const MasterTenants = React.lazy(() => import('./pages/master/MasterTenants').then((m) => ({ default: m.MasterTenants })));
const MasterTenantDetail = React.lazy(() => import('./pages/master/MasterTenantDetail').then((m) => ({ default: m.MasterTenantDetail })));
const MasterRevenue = React.lazy(() => import('./pages/master/MasterRevenue').then((m) => ({ default: m.MasterRevenue })));
const MasterLogs = React.lazy(() => import('./pages/master/MasterLogs').then((m) => ({ default: m.MasterLogs })));

// Page loading fallback
const PageSpinner = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: 'var(--linear-bg, #0d0d0d)',
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      border: '3px solid rgba(94,106,210,0.3)',
      borderTop: '3px solid #5E6AD2',
      animation: 'spin 0.8s linear infinite',
    }} />
  </div>
);

// ==========================================
// Protected Route (Clinic users)
// ==========================================
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('jwt_token');
  if (!token) {
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    return <Navigate to="/login" replace />;
  }
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
// LoadingConnector — wires bus to context
// ==========================================
const LoadingConnector = ({ children }: { children: React.ReactNode }) => {
  const { increment, decrement } = React.useContext(
    React.createContext({ increment: () => {}, decrement: () => {} })
  );
  
  React.useEffect(() => {
    // Import here to avoid circular
    import('./components/LoadingContext').then(({ useLoading }) => {
      // Already wired via loadingBus at module level
    });
  }, []);

  return <>{children}</>;
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
    <ErrorBoundary>
      <ToastProvider>
        <LoadingProvider>
          <BrowserRouter>
            <div className="app-container" style={{ position: 'relative' }}>
              {offline && (
                <div style={{
                  position: 'fixed', top: 0, left: 0, right: 0,
                  backgroundColor: '#ff453a', color: 'white',
                  textAlign: 'center', padding: '8px', zIndex: 9999,
                  fontWeight: 500, fontSize: '13px',
                }}>
                  ⚠️ Sem conexão com o servidor. Verifique sua internet.
                  <button
                    onClick={() => setOffline(false)}
                    style={{ marginLeft: 16, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}
                  >
                    Ok
                  </button>
                </div>
              )}
              <Navigation />
              <ColdStartBanner />
              <Suspense fallback={<PageSpinner />}>
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
              </Suspense>
            </div>
          </BrowserRouter>
        </LoadingProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;