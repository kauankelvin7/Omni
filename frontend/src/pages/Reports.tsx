import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { appointmentService, Appointment } from '../services/appointment';

export const Reports = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentService.getAll().then(setAppointments).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const filterMonth = (m: number, y: number) =>
    appointments.filter((a) => {
      if (!a.appointmentDate) return false;
      const d = new Date(a.appointmentDate);
      return d.getMonth() === m && d.getFullYear() === y;
    });

  const thisMonthApts = filterMonth(thisMonth, thisYear);
  const lastMonthApts = filterMonth(lastMonth, lastMonthYear);

  const confirmed = (arr: Appointment[]) => arr.filter((a) => a.status === 'CONFIRMED').length;
  const cancelled = (arr: Appointment[]) => arr.filter((a) => a.status === 'CANCELLED').length;
  const rate = (arr: Appointment[]) => arr.length === 0 ? 0 : Math.round((confirmed(arr) / arr.length) * 100);

  const delta = (cur: number, prev: number) => prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100);

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--linear-text-muted)' }} />
      </div>
    );
  }

  const metrics = [
    { label: 'Total de agendamentos', value: thisMonthApts.length, prev: lastMonthApts.length, icon: <Calendar size={20} />, color: 'var(--linear-accent)' },
    { label: 'Confirmações', value: confirmed(thisMonthApts), prev: confirmed(lastMonthApts), icon: <CheckCircle2 size={20} />, color: 'var(--linear-success)' },
    { label: 'Cancelamentos', value: cancelled(thisMonthApts), prev: cancelled(lastMonthApts), icon: <XCircle size={20} />, color: 'var(--linear-error)' },
    { label: 'Taxa de confirmação', value: rate(thisMonthApts), prev: rate(lastMonthApts), icon: <BarChart3 size={20} />, color: '#F59E0B', suffix: '%' },
  ];

  return (
    <div className="main-content">
      <div className="header">
        <div>
          <h1 style={{ marginBottom: 4 }}>Relatórios</h1>
          <p style={{ color: 'var(--linear-text-secondary)', fontSize: 14 }}>
            Métricas de {monthNames[thisMonth]} {thisYear} vs {monthNames[lastMonth]} {lastMonthYear}
          </p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: 40 }}>
        {metrics.map((m) => {
          const d = delta(m.value, m.prev);
          const up = d >= 0;
          return (
            <div key={m.label} className="glass-card stat-card dense">
              <div className="stat-icon-wrapper" style={{ color: m.color, borderColor: `${m.color}33` }}>
                {m.icon}
              </div>
              <div className="stat-content">
                <div className="value accent">{m.value}{m.suffix || ''}</div>
                <div className="label">{m.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 12, color: (m.label === 'Cancelamentos' ? !up : up) ? '#10B981' : '#EF4444' }}>
                  {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {d > 0 ? '+' : ''}{d}% vs mês anterior
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simple bar chart */}
      <div className="glass-card" style={{ marginBottom: 40 }}>
        <h3 className="section-title" style={{ marginBottom: 24 }}>Agendamentos este mês por semana</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
          {[1,2,3,4].map((week) => {
            const count = thisMonthApts.filter((a) => {
              const d = new Date(a.appointmentDate);
              return Math.ceil(d.getDate() / 7) === week;
            }).length;
            const max = Math.max(...[1,2,3,4].map((w) => thisMonthApts.filter((a) => Math.ceil(new Date(a.appointmentDate).getDate() / 7) === w).length), 1);
            const h = (count / max) * 120;
            return (
              <div key={week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{count}</span>
                <div style={{ width: '100%', maxWidth: 48, height: h || 4, background: 'linear-gradient(180deg, var(--linear-accent-hover), var(--linear-accent))', borderRadius: 6, transition: 'height 0.5s ease' }} />
                <span style={{ fontSize: 11, color: 'var(--linear-text-muted)' }}>Sem {week}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
