import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import masterApi from '../../services/master';
import { ArrowLeft, Key, Pause, Play, Building2, Users, Calendar, Check, CreditCard } from 'lucide-react';
import { useToast } from '../../components/Toast';

interface TenantDetail {
  id: string; name: string; created_at: string;
  admin_name?: string; admin_email?: string;
  patients_count: number; appointments_total: number;
  subscription?: { plan: string; status: string; price: number; trial_ends_at: string; current_period_end: string };
}

export const MasterTenantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick Activation State
  const [selectedPlan, setSelectedPlan] = useState('STARTER');
  const [expirationDate, setExpirationDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [isActivating, setIsActivating] = useState(false);

  const plans = [
    { id: 'STARTER', name: 'STARTER', price: 197 },
    { id: 'PRO', name: 'PRO', price: 397 },
    { id: 'CLINIC_PLUS', name: 'CLÍNICA+', price: 797 },
  ];

  const loadData = () => {
    masterApi.get(`/tenants/${id}`).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Detalhes da Clínica — Omni B2B Master';
    loadData();
  }, [id]);

  if (loading) return <div style={{ color: '#71717A', textAlign: 'center', paddingTop: 80 }}>Carregando...</div>;
  if (!data) return <div style={{ color: '#F87171', textAlign: 'center', paddingTop: 80 }}>Clínica não encontrada</div>;

  const impersonate = async () => {
    if (!confirm('Entrar como esta clínica?')) return;
    const res = await masterApi.post(`/tenants/${id}/impersonate`);
    localStorage.setItem('jwt_token', res.data.token);
    window.open('/dashboard', '_blank');
  };

  const updateStatus = async (status: string) => {
    if (!confirm(`${status === 'SUSPENDED' ? 'Suspender' : 'Reativar'} esta clínica?`)) return;
    await masterApi.put(`/tenants/${id}/status`, { status });
    loadData();
  };

  const handleQuickActivate = async () => {
    setIsActivating(true);
    try {
      await masterApi.put(`/tenants/${id}/plan`, {
        plan_name: selectedPlan,
        status: 'ACTIVE',
        current_period_end: new Date(expirationDate).toISOString()
      });
      addToast('Clínica ativada com sucesso!', 'success');
      loadData();
    } catch (error) {
      addToast('Erro ao ativar clínica', 'error');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div>
      <button onClick={() => navigate('/master/tenants')} style={{
        background: 'transparent', border: 'none', color: '#71717A', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 24, fontFamily: 'inherit',
      }}>
        <ArrowLeft size={16} /> Voltar para lista
      </button>

      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#EDEDED', marginBottom: 32 }}>{data.name}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
        {/* Info card */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Informações</h3>
          <div style={{ fontSize: 14, color: '#A1A1AA', lineHeight: 2 }}>
            <div><Building2 size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} /> {data.name}</div>
            <div>Admin: {data.admin_name || '-'}</div>
            <div>Email: {data.admin_email || '-'}</div>
            <div>Criada em: {new Date(data.created_at).toLocaleDateString('pt-BR')}</div>
          </div>
        </div>

        {/* Subscription card */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Assinatura Atual</h3>
          {data.subscription ? (
            <div style={{ fontSize: 14, color: '#A1A1AA', lineHeight: 2 }}>
              <div>Plano: <strong style={{ color: '#EDEDED' }}>{data.subscription.plan}</strong></div>
              <div>Status: <strong style={{ color: data.subscription.status === 'ACTIVE' ? '#10B981' : '#F59E0B' }}>{data.subscription.status}</strong></div>
              <div>Vencimento: {data.subscription.current_period_end ? new Date(data.subscription.current_period_end).toLocaleDateString('pt-BR') : '-'}</div>
            </div>
          ) : <p style={{ color: '#71717A', fontSize: 13 }}>Sem assinatura</p>}
        </div>

        {/* Quick Activation Card */}
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.03)', 
          border: '1px solid rgba(16, 185, 129, 0.15)', 
          borderRadius: 12, 
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Confirmar Pagamento</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 11, color: '#71717A', fontWeight: 600 }}>PLANO</label>
            <select 
              value={selectedPlan}
              onChange={e => setSelectedPlan(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '8px 12px', color: '#EDEDED', fontSize: 13, outline: 'none',
                cursor: 'pointer'
              }}
            >
              {plans.map(p => (
                <option key={p.id} value={p.id} style={{ background: '#18181B' }}>{p.name} — R$ {p.price}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 11, color: '#71717A', fontWeight: 600 }}>NOVO VENCIMENTO</label>
            <input 
              type="date"
              value={expirationDate}
              onChange={e => setExpirationDate(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '8px 12px', color: '#EDEDED', fontSize: 13, outline: 'none'
              }}
            />
          </div>

          <button 
            onClick={handleQuickActivate}
            disabled={isActivating}
            style={{
              marginTop: 'auto',
              padding: '12px', background: '#10B981', color: '#111',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s', opacity: isActivating ? 0.7 : 1
            }}
          >
            {isActivating ? 'Ativando...' : <><Check size={18} /> Confirmar pagamento e ativar</>}
          </button>
        </div>
      </div>

      {/* Stats Section (Restored) */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24, marginBottom: 32 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 24 }}>Estatísticas de Uso</h3>
        <div style={{ display: 'flex', gap: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ padding: 12, background: 'rgba(94, 106, 210, 0.1)', borderRadius: 12, color: '#5E6AD2' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#EDEDED' }}>{data.patients_count}</div>
              <div style={{ fontSize: 12, color: '#71717A' }}>Pacientes Totais</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ padding: 12, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 12, color: '#10B981' }}>
              <Calendar size={24} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#EDEDED' }}>{data.appointments_total}</div>
              <div style={{ fontSize: 12, color: '#71717A' }}>Agendamentos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={impersonate} style={{
          padding: '10px 20px', background: 'rgba(94,106,210,0.1)', border: '1px solid rgba(94,106,210,0.3)',
          borderRadius: 8, color: '#7B85E0', cursor: 'pointer', fontWeight: 600, fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
        }}>
          <Key size={16} /> Impersonar esta clínica
        </button>

        {data.subscription?.status !== 'SUSPENDED' ? (
          <button onClick={() => updateStatus('SUSPENDED')} style={{
            padding: '10px 20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 8, color: '#F87171', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
          }}>
            <Pause size={16} /> Suspender acesso
          </button>
        ) : (
          <button onClick={() => updateStatus('ACTIVE')} style={{
            padding: '10px 20px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 8, color: '#10B981', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
          }}>
            <Play size={16} /> Reativar acesso
          </button>
        )}
      </div>
    </div>
  );
};
