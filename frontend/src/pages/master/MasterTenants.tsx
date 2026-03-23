import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import masterApi from '../../services/master';
import { Search, Eye, Pause, Play, Key } from 'lucide-react';

interface Tenant {
  id: string; name: string; email: string; plan: string;
  status: string; trial_ends_at: string; current_period_end: string;
  patients_count: number; appointments_month: number; created_at: string;
}

const statusBadge = (s: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    ACTIVE: { bg: 'rgba(16,185,129,0.1)', color: '#10B981' },
    TRIAL: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' },
    SUSPENDED: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' },
    CANCELLED: { bg: 'rgba(113,113,122,0.1)', color: '#71717A' },
  };
  const style = map[s] || map.CANCELLED;
  return <span style={{ ...style, padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500 }}>{s}</span>;
};

const planBadge = (plan: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    TRIAL: { bg: 'rgba(113,113,122,0.1)', color: '#71717A' }, // Cinza
    STARTER: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' }, // Azul
    PRO: { bg: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }, // Roxo
    CLINIC_PLUS: { bg: 'rgba(234,179,8,0.1)', color: '#EAB308' }, // Dourado
  };
  const style = map[plan] || map.TRIAL;
  return <span style={{ ...style, padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500 }}>{plan}</span>;
};

const formatVencimento = (t: Tenant) => {
  const targetDateStr = t.trial_ends_at || t.current_period_end || null;
  if (!targetDateStr) return <span style={{ color: '#71717A' }}>-</span>;

  const targetDate = new Date(targetDateStr);
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isWarning = diffDays <= 7;
  const formatted = targetDate.toLocaleDateString('pt-BR');

  return (
    <span style={{ color: isWarning ? '#EF4444' : '#EDEDED', fontWeight: isWarning ? 600 : 400 }}>
      {formatted}
    </span>
  );
};

export const MasterTenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'Clínicas — Omni B2B Master'; }, []);

  const loadTenants = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    masterApi.get('/tenants', { params }).then(r => setTenants(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadTenants(); }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    if (!confirm(`${status === 'SUSPENDED' ? 'Suspender' : 'Reativar'} esta clínica?`)) return;
    await masterApi.put(`/tenants/${id}/status`, { status });
    loadTenants();
  };

  const impersonate = async (id: string) => {
    if (!confirm('Entrar como esta clínica? Você será autenticado com um token temporário de 1h.')) return;
    const res = await masterApi.post(`/tenants/${id}/impersonate`);
    localStorage.setItem('jwt_token', res.data.token);
    window.open('/dashboard', '_blank');
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#EDEDED', marginBottom: 24 }}>Clínicas</h1>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#71717A' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadTenants()}
            placeholder="Buscar por nome ou email..."
            style={{
              width: '100%', padding: '10px 12px 10px 36px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#EDEDED',
              fontSize: 13, outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>
        {['', 'ACTIVE', 'TRIAL', 'SUSPENDED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
          >{s || 'Todos'}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#71717A', textAlign: 'center', paddingTop: 40 }}>Carregando...</div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Clínica</th><th>Email</th><th>Plano</th><th>Status</th>
                <th>Vencimento</th><th>Pacientes</th><th>Agend./mês</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id}>
                  <td className="cell-primary">{t.name}</td>
                  <td className="cell-muted">{t.email || '-'}</td>
                  <td>{planBadge(t.plan)}</td>
                  <td>{statusBadge(t.status)}</td>
                  <td>{formatVencimento(t)}</td>
                  <td>{t.patients_count}</td>
                  <td>{t.appointments_month}</td>
                  <td style={{ display: 'flex', gap: 4 }}>
                    <Link to={`/master/tenants/${t.id}`} className="icon-btn" title="Ver detalhes"><Eye size={16} /></Link>
                    {t.status !== 'SUSPENDED' ? (
                      <button onClick={() => updateStatus(t.id, 'SUSPENDED')} className="icon-btn danger" title="Suspender"><Pause size={16} /></button>
                    ) : (
                      <button onClick={() => updateStatus(t.id, 'ACTIVE')} className="icon-btn" title="Reativar"><Play size={16} /></button>
                    )}
                    <button onClick={() => impersonate(t.id)} className="icon-btn" title="Impersonar"><Key size={16} /></button>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#71717A', padding: 32 }}>Nenhuma clínica encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
