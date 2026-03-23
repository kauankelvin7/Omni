import { useState, useEffect } from 'react';
import { Save, Check, Loader2, AlertCircle } from 'lucide-react';
import { ClinicSettings, settingsService } from '../services/settings';

const DAYS = ['1', '2', '3', '4', '5', '6', '7'];
const FULL_DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export const Settings = () => {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    settingsService
      .getSettings()
      .then((data) => {
        setSettings(data);
        setLoadError(null);
      })
      .catch((err) => {
        console.error('Failed to load settings', err);
        setLoadError('Não foi possível carregar as configurações. Verifique sua conexão.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const set = <K extends keyof ClinicSettings>(key: K, value: ClinicSettings[K]) =>
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

  const toggleDay = (day: string) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const isActive = prev.workDays.includes(day);
      return {
        ...prev,
        workDays: isActive
          ? prev.workDays.filter((d) => d !== day)
          : [...prev.workDays, day],
      };
    });
  };

  // UX: Formatação básica de telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d+()\s-]/g, '');
    set('phone', value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSaveError(null);
    
    try {
      await settingsService.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save settings', err);
      setSaveError('Erro ao salvar as configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--linear-text-muted)' }} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="main-content">
        <div className="empty-state glass-card">
          <AlertCircle size={32} className="empty-icon" style={{ color: 'var(--linear-error)' }} />
          <p>{loadError}</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => window.location.reload()}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="main-content">
      <div className="header">
        <div>
          <h1>Configurações</h1>
          <p style={{ color: 'var(--linear-text-secondary)', fontSize: 14, marginTop: 4 }}>
            Informações da clínica e horários de funcionamento
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ maxWidth: 540 }}>
        
        {saveError && (
          <div className="form-error" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{saveError}</span>
          </div>
        )}

        <div className="glass-card settings-section" style={{ marginBottom: '24px' }}>
          <h3 className="section-title">Dados da Clínica</h3>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="cfg-name">Nome da Clínica</label>
            <input
              id="cfg-name"
              value={settings.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Clínica Saúde Plus"
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="cfg-email">Email de Contato</label>
            <input
              id="cfg-email"
              type="email"
              value={settings.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="contato@clinica.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="cfg-phone">Telefone / WhatsApp</label>
            <input
              id="cfg-phone"
              type="tel"
              value={settings.phone}
              onChange={handlePhoneChange}
              placeholder="+55 11 3000-0000"
            />
          </div>
        </div>

        <div className="glass-card settings-section" style={{ marginBottom: '24px' }}>
          <h3 className="section-title">Horários de Funcionamento</h3>

          <div style={{ display: 'flex', gap: 16, marginBottom: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="cfg-open">Horário de Abertura</label>
              <input
                id="cfg-open"
                type="time"
                value={settings.openTime}
                onChange={(e) => set('openTime', e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="cfg-close">Horário de Fechamento</label>
              <input
                id="cfg-close"
                type="time"
                value={settings.closeTime}
                onChange={(e) => set('closeTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Dias de Atendimento</label>
            <div className="day-picker" style={{ marginTop: '8px' }}>
              {DAYS.map((day, i) => {
                const isActive = settings.workDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    title={FULL_DAYS[i]}
                    className={`day-btn ${isActive ? 'active' : ''}`}
                    onClick={() => toggleDay(day)}
                    aria-pressed={isActive}
                  >
                    {FULL_DAYS[i].substring(0, 3)}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--linear-text-muted)', marginTop: '8px' }}>
              O robô de agendamento respeitará os dias e horários marcados acima.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '14px' }}
        >
          {saving ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> 
              Salvando...
            </>
          ) : saved ? (
            <>
              <Check size={16} /> Salvo com sucesso!
            </>
          ) : (
            <>
              <Save size={16} /> Salvar Configurações
            </>
          )}
        </button>
      </form>
    </div>
  );
};