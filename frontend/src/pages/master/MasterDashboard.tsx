import { useEffect, useState } from 'react';
import masterApi from '../../services/master';
import {
  Building2, Users, TrendingUp, DollarSign, AlertTriangle, Clock
} from 'lucide-react';

interface DashboardData {
  total_tenants: number;
  active_tenants: number;
  trial_tenants: number;
  suspended_tenants: number;
  cancelled_tenants: number;
  mrr: number;
  new_this_month: number;
  growth_chart: { month: string; count: number }[];
  revenue_chart: { month: string; revenue: number }[];
}

export const MasterDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Master Dashboard — Omni B2B';
    masterApi.get('/dashboard').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#71717A', textAlign: 'center', paddingTop: 80 }}>Carregando...</div>;
  if (!data) return <div style={{ color: '#F87171', textAlign: 'center', paddingTop: 80 }}>Erro ao carregar dados</div>;

  const metrics = [
    { label: 'Total de Clínicas', value: data.total_tenants, icon: <Building2 size={20} />, color: '#5E6AD2' },
    { label: 'Ativas', value: data.active_tenants, icon: <Users size={20} />, color: '#10B981' },
    { label: 'Em Trial', value: data.trial_tenants, icon: <Clock size={20} />, color: '#F59E0B' },
    { label: 'Suspensas', value: data.suspended_tenants, icon: <AlertTriangle size={20} />, color: '#EF4444' },
    { label: 'MRR', value: `R$ ${Number(data.mrr).toLocaleString('pt-BR')}`, icon: <DollarSign size={20} />, color: '#10B981' },
    { label: 'Novas este mês', value: data.new_this_month, icon: <TrendingUp size={20} />, color: '#8B5CF6' },
  ];

  const maxGrowth = Math.max(...(data.growth_chart.map(g => g.count)), 1);
  const maxRevenue = Math.max(...(data.revenue_chart.map(r => r.revenue)), 1);

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#EDEDED', marginBottom: 32 }}>Dashboard Master</h1>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: 20,
          }}>
            <div style={{ color: m.color, marginBottom: 12 }}>{m.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#EDEDED', letterSpacing: '-0.02em' }}>{m.value}</div>
            <div style={{ fontSize: 13, color: '#71717A', marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Growth Chart */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#A1A1AA', marginBottom: 20 }}>Crescimento de Clínicas (6 meses)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {data.growth_chart.map((g, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: `${Math.max((g.count / maxGrowth) * 100, 4)}%`,
                  background: 'linear-gradient(180deg, #5E6AD2, #3B3F8C)', borderRadius: '4px 4px 0 0',
                  minHeight: 4, transition: 'height 0.3s',
                }} />
                <div style={{ fontSize: 10, color: '#71717A', marginTop: 4 }}>{g.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#A1A1AA', marginBottom: 20 }}>Receita Mensal (6 meses)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {data.revenue_chart.map((r, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: `${Math.max((r.revenue / maxRevenue) * 100, 4)}%`,
                  background: 'linear-gradient(180deg, #10B981, #065F46)', borderRadius: '4px 4px 0 0',
                  minHeight: 4, transition: 'height 0.3s',
                }} />
                <div style={{ fontSize: 10, color: '#71717A', marginTop: 4 }}>R${Math.round(r.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
