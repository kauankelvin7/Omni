import { useEffect, useState } from 'react';
import masterApi from '../../services/master';

interface LogEntry { id: string; event_type?: string; action?: string; email?: string; ip_address?: string; details?: string; success?: boolean; created_at: string; admin_id?: string; target_tenant_id?: string; }

export const MasterLogs = () => {
  const [tab, setTab] = useState<'security' | 'actions'>('security');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'Logs — Omni B2B Master'; }, []);

  useEffect(() => {
    setLoading(true);
    const endpoint = tab === 'security' ? '/security-logs' : '/action-logs';
    masterApi.get(endpoint).then(r => setLogs(r.data.content || [])).catch(() => setLogs([])).finally(() => setLoading(false));
  }, [tab]);

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#EDEDED', marginBottom: 24 }}>Logs do Sistema</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button onClick={() => setTab('security')} className={`filter-btn ${tab === 'security' ? 'active' : ''}`}>Segurança</button>
        <button onClick={() => setTab('actions')} className={`filter-btn ${tab === 'actions' ? 'active' : ''}`}>Ações Master</button>
      </div>

      {loading ? (
        <div style={{ color: '#71717A', textAlign: 'center', paddingTop: 40 }}>Carregando...</div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                {tab === 'security' ? (
                  <><th>Tipo</th><th>Email</th><th>IP</th><th>Resultado</th><th>Data</th></>
                ) : (
                  <><th>Ação</th><th>Admin</th><th>Tenant Alvo</th><th>IP</th><th>Data</th></>
                )}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  {tab === 'security' ? (
                    <>
                      <td className="cell-primary">{log.event_type}</td>
                      <td className="cell-muted">{log.email || '-'}</td>
                      <td className="cell-muted">{log.ip_address || '-'}</td>
                      <td>{log.success ? <span className="badge badge-success">OK</span> : <span className="badge badge-error">FAIL</span>}</td>
                      <td className="cell-muted">{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                    </>
                  ) : (
                    <>
                      <td className="cell-primary">{log.action}</td>
                      <td className="cell-muted">{log.admin_id?.substring(0, 8)}...</td>
                      <td className="cell-muted">{log.target_tenant_id?.substring(0, 8) || '-'}</td>
                      <td className="cell-muted">{log.ip_address || '-'}</td>
                      <td className="cell-muted">{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                    </>
                  )}
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#71717A', padding: 32 }}>Nenhum log registrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
