import { useEffect, useState, useCallback } from 'react';
import { Calendar, Plus, X, AlertCircle } from 'lucide-react';
import {
  appointmentService,
  Appointment,
  AppointmentStatus,
  AppointmentPayload,
} from '../services/appointment';
import { patientService, Patient } from '../services/patient';

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
};

const STATUS_CLASS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'badge-pending',
  CONFIRMED: 'badge-success',
  CANCELLED: 'badge-error',
};

interface ModalProps {
  patients: Patient[];
  onClose: () => void;
  onSave: (payload: AppointmentPayload) => Promise<void>;
}

const AppointmentModal = ({ patients, onClose, onSave }: ModalProps) => {
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fecha o modal ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !date || !time) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Monta a data no formato ISO
      const appointmentDate = new Date(`${date}T${time}:00`).toISOString();
      await onSave({ patient: { id: patientId }, appointmentDate, status: 'SCHEDULED' });
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao criar agendamento. Verifique a conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>Novo Agendamento</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar modal">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="apt-patient">Paciente *</label>
            <select
              id="apt-patient"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              autoFocus
            >
              <option value="">Selecione um paciente…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="apt-date">Data *</label>
            <input
              id="apt-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Impede datas passadas
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="apt-time">Hora *</label>
            <input
              id="apt-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando…' : 'Criar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filter, setFilter] = useState<AppointmentStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const [apts, pts] = await Promise.all([
        appointmentService.getAll(), 
        patientService.getAll()
      ]);
      setAppointments(apts);
      setPatients(pts);
    } catch (err) {
      console.error(err);
      setActionError('Falha ao carregar os dados. Verifique a API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = filter === 'ALL' 
    ? appointments 
    : appointments.filter((a) => a.status === filter);

  // Formatação segura de Data e Hora
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d).replace(',', ' às');
  };

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    setActionError(null);
    try {
      // Opcional: Aqui poderíamos adicionar um estado de loading na linha específica
      await appointmentService.updateStatus(id, status);
      await load();
    } catch (err) {
      console.error(err);
      setActionError('Erro ao atualizar o status do agendamento.');
    }
  };

  const handleSave = async (payload: AppointmentPayload) => {
    await appointmentService.create(payload);
    await load();
  };

  return (
    <div className="main-content">
      <div className="header">
        <div>
          <h1>Agendamentos</h1>
          <p style={{ color: 'var(--linear-text-secondary)', fontSize: 14, marginTop: 4 }}>
            {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} no total
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Novo Agendamento
        </button>
      </div>

      {actionError && (
        <div className="form-error" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      <div className="filter-row">
        {(['ALL', 'SCHEDULED', 'CONFIRMED', 'CANCELLED'] as const).map((s) => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'ALL' ? 'Todos' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state glass-card">
          <p>Carregando dados da clínica…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state glass-card">
          <Calendar size={32} className="empty-icon" />
          <p>Nenhum agendamento encontrado para este filtro.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Data e Hora</th>
                <th>Status</th>
                <th style={{ width: 180 }}>Atualizar Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td className="cell-primary">{a.patient.name}</td>
                  <td>{formatDate(a.appointmentDate)}</td>
                  <td>
                    <span className={`badge ${STATUS_CLASS[a.status as AppointmentStatus] ?? 'badge-pending'}`}>
                      {STATUS_LABELS[a.status as AppointmentStatus] ?? a.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value as AppointmentStatus)}
                    >
                      <option value="SCHEDULED">Agendado</option>
                      <option value="CONFIRMED">Confirmado</option>
                      <option value="CANCELLED">Cancelado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <AppointmentModal
          patients={patients}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};