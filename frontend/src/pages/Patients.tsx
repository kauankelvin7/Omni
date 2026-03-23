import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Copy, Check, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { patientService, Patient, PatientPayload } from '../services/patient';

const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME ?? 'omniB2Bbot';
const PAGE_SIZE = 10;

interface ModalProps {
  initial?: Patient | null;
  onClose: () => void;
  onSave: (payload: PatientPayload) => Promise<void>;
}

const PatientModal = ({ initial, onClose, onSave }: ModalProps) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UX: Fechar o modal com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // UX: Formatação básica de telefone (permite +, () e números)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d+()\s-]/g, '');
    setPhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Nome e telefone são obrigatórios.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await onSave({ 
        name: name.trim(), 
        phone: phone.trim(), 
        email: email.trim() || undefined 
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar paciente. Verifique os dados ou a conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{initial ? 'Editar Paciente' : 'Novo Paciente'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
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
            <label htmlFor="pt-name">Nome *</label>
            <input
              id="pt-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="João Silva"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pt-phone">Telefone (WhatsApp) *</label>
            <input
              id="pt-phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+55 11 99999-9999"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pt-email">Email</label>
            <input
              id="pt-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@email.com"
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button className="icon-btn" title="Copiar link de vínculo do Telegram" onClick={copy}>
      {copied ? <Check size={14} color="var(--linear-accent)" /> : <Copy size={14} />}
    </button>
  );
};

export const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const [pts, sub] = await Promise.all([
        patientService.getAll(),
        import('../services/subscription').then(m => m.subscriptionService.getMe().catch(() => null))
      ]);
      setPatients(pts);
      setSubscription(sub);
    } catch (err) {
      console.error(err);
      setActionError('Falha ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      (p.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const sliced = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const isStarter = !subscription || subscription.planName === 'TRIAL' || subscription.planName === 'STARTER';
  const limitReached = isStarter && patients.length >= 100;

  const handleSave = async (payload: PatientPayload) => {
    setActionError(null);
    try {
      if (editing) {
        await patientService.update(editing.id, payload);
      } else {
        await patientService.create(payload);
      }
      await load();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Falha ao salvar paciente.';
      setActionError(msg);
    }
  };

  const handleDelete = async (p: Patient) => {
    if (!window.confirm(`Tem certeza que deseja remover o paciente "${p.name}"?\nEsta ação não poderá ser desfeita.`)) return;
    
    setActionError(null);
    try {
      await patientService.delete(p.id);
      
      // Ajuste de paginação caso remova o último item da página atual
      if (sliced.length === 1 && page > 0) {
        setPage(page - 1);
      }
      
      await load();
    } catch (err) {
      console.error(err);
      setActionError('Não foi possível remover o paciente. Verifique se ele não possui agendamentos vinculados.');
    }
  };

  return (
    <div className="main-content">
      <div className="header">
        <div>
          <h1>Pacientes</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <p style={{ color: 'var(--linear-text-secondary)', fontSize: 14 }}>
              {patients.length} paciente{patients.length !== 1 ? 's' : ''} cadastrado{patients.length !== 1 ? 's' : ''}
            </p>
            {isStarter && (
              <span style={{ 
                fontSize: 12, 
                padding: '2px 8px', 
                borderRadius: 4, 
                background: limitReached ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                color: limitReached ? '#EF4444' : 'var(--linear-text-muted)',
                border: `1px solid ${limitReached ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`
              }}>
                Limite: {patients.length}/100
              </span>
            )}
          </div>
        </div>
        <button
          className="btn btn-primary"
          disabled={limitReached}
          title={limitReached ? "Limite do plano Starter atingido (100 pacientes)" : ""}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} /> Novo Paciente
        </button>
      </div>

      {limitReached && (
        <div className="glass-card" style={{ marginBottom: 24, borderLeft: '4px solid #F59E0B', background: 'rgba(245, 158, 11, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={20} style={{ color: '#F59E0B' }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Limite de pacientes atingido</p>
              <p style={{ fontSize: 13, color: 'var(--linear-text-secondary)' }}>
                Você atingiu o limite de 100 pacientes do seu plano. Para continuar adicionando, faça o upgrade para o plano Pro.
              </p>
            </div>
            <Link to="/settings/billing" className="btn btn-primary" style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: 12 }}>
              Fazer Upgrade
            </Link>
          </div>
        </div>
      )}

      {actionError && (
        <div className="form-error" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input
          className="search-input"
          placeholder="Buscar por nome, telefone ou email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0); // Reseta a paginação ao buscar
          }}
        />
      </div>

      {loading ? (
        <div className="empty-state glass-card">
          <p>Carregando pacientes…</p>
        </div>
      ) : sliced.length === 0 ? (
        <div className="empty-state glass-card">
          <Users size={32} className="empty-icon" />
          <p>{search ? 'Nenhum paciente encontrado para essa busca.' : 'Nenhum paciente cadastrado ainda.'}</p>
          {!search && (
            <button className="btn" style={{ marginTop: 16 }} onClick={() => setModalOpen(true)}>
              <Plus size={16} /> Adicionar primeiro paciente
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Email</th>
                  <th>Telegram</th>
                  <th style={{ width: 100 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sliced.map((p) => (
                  <tr key={p.id}>
                    <td className="cell-primary">{p.name}</td>
                    <td>{p.phone}</td>
                    <td className="cell-muted">{p.email ?? '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {p.telegramChatId ? (
                          <span className="badge badge-success">Vinculado</span>
                        ) : (
                          <span className="badge badge-pending">Pendente</span>
                        )}
                        <CopyButton text={`https://t.me/${BOT_USERNAME}?start=${p.id}`} />
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="icon-btn"
                          title="Editar Paciente"
                          onClick={() => {
                            setEditing(p);
                            setModalOpen(true);
                          }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="icon-btn danger"
                          title="Remover Paciente"
                          onClick={() => handleDelete(p)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button className="btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                ← Anterior
              </button>
              <span className="page-info">
                Página {page + 1} de {totalPages}
              </span>
              <button
                className="btn"
                disabled={page === totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <PatientModal
          initial={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};