import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Users, FileText, Plus, AlertCircle, Loader2,
  TrendingUp, CheckCircle2, Clock, BarChart3,
} from 'lucide-react';
import { patientService, Patient } from '../services/patient';
import { appointmentService, Appointment } from '../services/appointment';

export const Dashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clinicName = 'Minha Clínica';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [patientsData, appointmentsData] = await Promise.all([
          patientService.getAll(),
          appointmentService.getAll(),
        ]);
        setPatients(patientsData);
        setAppointments(appointmentsData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setError('Falha ao carregar os dados do painel. Verifique a conexão com o servidor.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const todaysAppointments = appointments.filter((a) => {
    if (!a.appointmentDate) return false;
    return a.appointmentDate.split('T')[0] === today && a.status !== 'CANCELLED';
  });

  // Weekly appointments
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekAppointments = appointments.filter((a) => {
    if (!a.appointmentDate) return false;
    const d = new Date(a.appointmentDate);
    return d >= weekStart && d <= weekEnd;
  });

  // Confirmation rate
  const total = appointments.length;
  const confirmed = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const confirmRate = total === 0 ? 0 : Math.round((confirmed / total) * 100);

  // Missed appointments avoided (confirmed this month)
  const thisMonth = now.getMonth();
  const missedAvoided = appointments.filter((a) => {
    if (!a.appointmentDate) return false;
    const d = new Date(a.appointmentDate);
    return d.getMonth() === thisMonth && a.status === 'CONFIRMED';
  }).length;

  // Last 7 days chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const count = appointments.filter((a) => a.appointmentDate?.split('T')[0] === key).length;
    const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    return { key, count, dayName };
  });
  const maxCount = Math.max(...last7.map((d) => d.count), 1);

  return (
    <div className="main-content">
      <div className="header">
        <div>
          <h1 style={{ marginBottom: 4 }}>{clinicName}</h1>
          <p style={{ color: 'var(--linear-text-secondary)', fontSize: 14 }}>
            Visão geral do seu dia
          </p>
        </div>
        <Link
          to="/appointments"
          className="btn btn-primary"
          style={{ textDecoration: 'none' }}
        >
          <Plus size={16} /> Novo Agendamento
        </Link>
      </div>

      {error && (
        <div className="form-error" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="empty-state glass-card" style={{ minHeight: 300 }}>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <Loader2 size={32} className="empty-icon" style={{ animation: 'spin 1s linear infinite' }} />
          <p>Carregando painel...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="dashboard-grid">
            <div className="glass-card stat-card dense">
              <div className="stat-icon-wrapper" style={{ color: 'var(--linear-accent)', borderColor: 'rgba(94,106,210,0.2)' }}>
                <Calendar size={20} />
              </div>
              <div className="stat-content">
                <div className="value accent">{todaysAppointments.length}</div>
                <div className="label">Agendamentos Hoje</div>
              </div>
            </div>

            <div className="glass-card stat-card dense">
              <div className="stat-icon-wrapper" style={{ color: 'var(--linear-success)', borderColor: 'rgba(16,185,129,0.2)' }}>
                <Users size={20} />
              </div>
              <div className="stat-content">
                <div className="value accent">{patients.length}</div>
                <div className="label">Pacientes Ativos</div>
              </div>
            </div>

            <div className="glass-card stat-card dense">
              <div className="stat-icon-wrapper" style={{ color: '#F59E0B', borderColor: 'rgba(245,158,11,0.2)' }}>
                <Clock size={20} />
              </div>
              <div className="stat-content">
                <div className="value accent">{weekAppointments.length}</div>
                <div className="label">Agendamentos Semana</div>
              </div>
            </div>

            <div className="glass-card stat-card dense">
              <div className="stat-icon-wrapper" style={{ color: '#10B981', borderColor: 'rgba(16,185,129,0.2)' }}>
                <TrendingUp size={20} />
              </div>
              <div className="stat-content">
                <div className="value accent">{confirmRate}%</div>
                <div className="label">Taxa de Confirmação</div>
              </div>
            </div>
          </div>

          {/* 7-day chart */}
          <div className="glass-card" style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 className="section-title" style={{ marginBottom: 0 }}>
                <BarChart3 size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                Últimos 7 dias
              </h3>
              <span style={{ fontSize: 12, color: 'var(--linear-text-muted)' }}>
                <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                {missedAvoided} faltas evitadas este mês
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
              {last7.map((d) => {
                const h = (d.count / maxCount) * 110;
                return (
                  <div key={d.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{d.count}</span>
                    <div style={{
                      width: '100%', maxWidth: 36, height: h || 4,
                      background: d.key === today
                        ? 'linear-gradient(180deg, var(--linear-accent-hover), var(--linear-accent))'
                        : 'rgba(255,255,255,0.08)',
                      borderRadius: 5, transition: 'height 0.5s ease',
                    }} />
                    <span style={{ fontSize: 10, color: 'var(--linear-text-muted)', textTransform: 'capitalize' }}>{d.dayName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's appointments list */}
          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="section-title" style={{ marginBottom: 0 }}>Consultas de hoje</h3>
              <Link to="/appointments" className="btn" style={{ fontSize: 12, padding: '4px 10px', textDecoration: 'none' }}>
                Ver todos
              </Link>
            </div>

            {todaysAppointments.length === 0 ? (
              <div className="empty-state glass-card">
                <Calendar size={32} className="empty-icon" />
                <p>Nenhuma consulta agendada para hoje</p>
                <Link to="/appointments" className="btn" style={{ marginTop: 16, textDecoration: 'none' }}>
                  <Plus size={16} /> Novo agendamento
                </Link>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {todaysAppointments.map((a) => (
                  <div key={a.id} className="patient-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="patient-info">
                      <div className="patient-name">{a.patientName || 'Paciente'}</div>
                      <div className="patient-contact">
                        {a.appointmentDate?.split('T')[1]?.substring(0, 5) || '--:--'}
                      </div>
                    </div>
                    <span className={`badge ${a.status === 'CONFIRMED' ? 'badge-success' : a.status === 'CANCELLED' ? 'badge-error' : 'badge-pending'}`}>
                      {a.status === 'CONFIRMED' ? 'Confirmado' : a.status === 'CANCELLED' ? 'Cancelado' : 'Agendado'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent patients */}
          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="section-title" style={{ marginBottom: 0 }}>Últimos Pacientes</h3>
              <Link to="/patients" className="btn" style={{ fontSize: 12, padding: '4px 10px', textDecoration: 'none' }}>
                Ver todos
              </Link>
            </div>

            {patients.length === 0 ? (
              <div className="empty-state glass-card">
                <FileText size={32} className="empty-icon" />
                <p>Nenhum paciente cadastrado ainda</p>
                <Link to="/patients" className="btn" style={{ marginTop: 16, textDecoration: 'none' }}>
                  <Plus size={16} /> Adicionar primeiro paciente
                </Link>
              </div>
            ) : (
              <div className="patient-list glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {patients.slice(0, 5).map((p) => (
                  <div key={p.id} className="patient-list-item">
                    <div className="patient-info">
                      <div className="patient-name">{p.name}</div>
                      <div className="patient-contact">
                        {p.email} {p.email && p.phone && '•'} {p.phone}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};