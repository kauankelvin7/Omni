import { useState } from 'react';
import { Boxes, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    clinicName: '',
    specialty: '',
    phone: '',
    adminName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const validateStep1 = () => {
    if (!form.clinicName.trim()) { setError('Nome da clínica é obrigatório'); return false; }
    if (!form.phone.trim()) { setError('Telefone é obrigatório'); return false; }
    setError(''); return true;
  };

  const validateStep2 = () => {
    if (!form.email.trim() || !form.email.includes('@')) { setError('Email válido é obrigatório'); return false; }
    if (form.password.length < 8) { setError('Senha deve ter pelo menos 8 caracteres'); return false; }
    if (form.password !== form.confirmPassword) { setError('As senhas não coincidem'); return false; }
    setError(''); return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/tenants/register', {
        clinicName: form.clinicName,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-layout">
        <div className="auth-bg-glow" />
        <div className="auth-card glass-card" style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#10B981' }}>
            <Check size={32} />
          </div>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Conta criada com sucesso! 🎉</h2>
          <p style={{ color: 'var(--linear-text-secondary)', fontSize: 14, marginBottom: 8 }}>
            Seu trial de 30 dias foi ativado.
          </p>
          <p style={{ color: 'var(--linear-text-muted)', fontSize: 13 }}>Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <div className="auth-bg-glow" />
      <div className="auth-card glass-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Boxes size={32} style={{ color: 'var(--linear-accent)', marginBottom: 12 }} />
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Crie sua conta</h2>
          <p style={{ color: 'var(--linear-text-secondary)', fontSize: 13 }}>Passo {step} de 3</p>
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
            {[1,2,3].map((s) => (
              <div key={s} style={{
                width: 40, height: 4, borderRadius: 2,
                background: s <= step ? 'var(--linear-accent)' : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>
        )}

        {step === 1 && (
          <div>
            <div className="form-group">
              <label>Nome da Clínica *</label>
              <input value={form.clinicName} onChange={(e) => set('clinicName', e.target.value)} placeholder="Clínica Saúde Plus" />
            </div>
            <div className="form-group">
              <label>Especialidade</label>
              <select value={form.specialty} onChange={(e) => set('specialty', e.target.value)}>
                <option value="">Selecione...</option>
                <option value="odontologia">Odontologia</option>
                <option value="psicologia">Psicologia</option>
                <option value="estetica">Estética</option>
                <option value="medicina">Medicina Geral</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div className="form-group">
              <label>Telefone *</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(61) 99999-0000" type="tel" />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: 12, marginTop: 8 }} onClick={() => validateStep1() && setStep(2)}>
              Próximo <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="form-group">
              <label>Seu Nome</label>
              <input value={form.adminName} onChange={(e) => set('adminName', e.target.value)} placeholder="João da Silva" />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="joao@clinica.com" type="email" />
            </div>
            <div className="form-group">
              <label>Senha * (mín. 8 caracteres)</label>
              <input value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••" type="password" />
            </div>
            <div className="form-group">
              <label>Confirmar Senha *</label>
              <input value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} placeholder="••••••••" type="password" />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" style={{ flex: 1, padding: 12 }} onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Voltar
              </button>
              <button className="btn btn-primary" style={{ flex: 2, padding: 12 }} onClick={() => validateStep2() && setStep(3)}>
                Próximo <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, marginBottom: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Resumo do cadastro</h4>
              <div style={{ fontSize: 13, color: 'var(--linear-text-secondary)', lineHeight: 2 }}>
                <div><strong>Clínica:</strong> {form.clinicName}</div>
                <div><strong>Especialidade:</strong> {form.specialty || '(nenhuma)'}</div>
                <div><strong>Telefone:</strong> {form.phone}</div>
                <div><strong>Email:</strong> {form.email}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(94,106,210,0.08)', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid rgba(94,106,210,0.15)', fontSize: 13, color: '#A1A1FF' }}>
              🎉 Trial de 30 dias será ativado automaticamente. Sem cartão de crédito.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" style={{ flex: 1, padding: 12 }} onClick={() => setStep(2)}>
                <ArrowLeft size={16} /> Voltar
              </button>
              <button className="btn btn-primary" style={{ flex: 2, padding: 12 }} onClick={handleSubmit} disabled={loading}>
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Criando...</> : <>Criar conta <Check size={16} /></>}
              </button>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--linear-text-muted)' }}>
          Já tem conta? <Link to="/login" style={{ color: 'var(--linear-accent)', textDecoration: 'none' }}>Fazer login</Link>
        </p>
      </div>
    </div>
  );
};
