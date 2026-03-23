import { useEffect, useState } from 'react';
import masterApi from '../../services/master';
import { DollarSign, TrendingUp, Building2 } from 'lucide-react';

interface RevenueData {
  mrr: number;
  total_revenue: number;
  avg_per_clinic: number;
  active_subscriptions: { tenant_name: string; plan: string; price: number; next_payment: string }[];
  pending_payments: { tenant_name: string; trial_ended: string }[];
}

export const MasterRevenue = () => {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Financeiro — Omni B2B Master';
    masterApi.get('/revenue').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#71717A', textAlign: 'center', paddingTop: 80 }}>Carregando...</div>;
  if (!data) return <div style={{ color: '#F87171', textAlign: 'center', paddingTop: 80 }}>Erro ao carregar</div>;

  const fmt = (v: number) => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const fmtDate = (d: string) => {
    if (!d || d === 'null') return '-';
    try {
      return new Date(d).toLocaleDateString('pt-BR');
    } catch {
      return d;
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#EDEDED', marginBottom: 32 }}>Financeiro</h1>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'MRR', value: fmt(data.mrr), icon: <DollarSign size={20} />, color: '#10B981' },
          { label: 'Receita Total', value: fmt(data.total_revenue), icon: <TrendingUp size={20} />, color: '#5E6AD2' },
          { label: 'Média por Clínica', value: fmt(data.avg_per_clinic), icon: <Building2 size={20} />, color: '#F59E0B' },
        ].map(m => (
          <div key={m.label} style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: 20,
          }}>
            <div style={{ color: m.color, marginBottom: 12 }}>{m.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#EDEDED' }}>{m.value}</div>
            <div style={{ fontSize: 13, color: '#71717A', marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Active subscriptions */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#A1A1AA', marginBottom: 16 }}>Assinaturas Ativas</h3>
        {data.active_subscriptions.length > 0 ? (
          <table className="data-table" style={{ width: '100%' }}>
            <thead><tr><th>Clínica</th><th>Plano</th><th>Valor</th><th>Próximo Vencimento</th></tr></thead>
            <tbody>
              {data.active_subscriptions.map((s, i) => (
                <tr key={i}>
                  <td className="cell-primary">{s.tenant_name}</td>
                  <td>{s.plan}</td>
                  <td>{fmt(s.price)}</td>
                  <td className="cell-muted">{fmtDate(s.next_payment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: '#71717A', fontSize: 13 }}>Nenhuma assinatura ativa</p>}
      </div>

      {/* Pending payments */}
      {data.pending_payments.length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: 12, padding: 24,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#F87171', marginBottom: 16 }}>⚠ Pagamentos Pendentes</h3>
          {data.pending_payments.map((p, i) => (
            <div key={i} style={{ fontSize: 14, color: '#FCA5A5', marginBottom: 8 }}>
              {p.tenant_name} — trial expirou em {fmtDate(p.trial_ended)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
