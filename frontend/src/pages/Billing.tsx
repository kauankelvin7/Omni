import { useEffect } from 'react';
import { CreditCard, QrCode, Mail, ArrowRight } from 'lucide-react';

export const Billing = () => {
  useEffect(() => { document.title = 'Plano e Pagamento — Omni B2B'; }, []);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#EDEDED', marginBottom: 8 }}>Plano e Pagamento</h1>
      <p style={{ fontSize: 14, color: '#71717A', marginBottom: 32 }}>Gerencie sua assinatura do Omni B2B.</p>

      {/* Current plan */}
      <div style={{
        background: 'rgba(94,106,210,0.06)', border: '1px solid rgba(94,106,210,0.2)',
        borderRadius: 12, padding: 24, marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <CreditCard size={20} style={{ color: '#5E6AD2' }} />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#EDEDED' }}>Plano Atual</h3>
        </div>
        <div style={{ fontSize: 14, color: '#A1A1AA', lineHeight: 2 }}>
          <div>Plano: <strong style={{ color: '#EDEDED' }}>Trial</strong></div>
          <div>Status: <span style={{ color: '#F59E0B' }}>Em período de teste</span></div>
        </div>
      </div>

      {/* How to pay */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12, padding: 24, marginBottom: 24,
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#EDEDED', marginBottom: 16 }}>Como pagar</h3>

        <div style={{ display: 'flex', alignItems: 'start', gap: 12, marginBottom: 20 }}>
          <QrCode size={24} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#EDEDED', marginBottom: 4 }}>PIX</div>
            <div style={{ fontSize: 13, color: '#A1A1AA', lineHeight: 1.6 }}>
              Chave PIX: <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4, color: '#EDEDED' }}>kauan@omnib2b.com</code>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'start', gap: 12, marginBottom: 20 }}>
          <Mail size={24} style={{ color: '#5E6AD2', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#EDEDED', marginBottom: 4 }}>Enviar comprovante</div>
            <div style={{ fontSize: 13, color: '#A1A1AA', lineHeight: 1.6 }}>
              Após o pagamento, envie o comprovante para <strong>kauan@omnib2b.com</strong> ou via WhatsApp do suporte.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
          <ArrowRight size={24} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#EDEDED', marginBottom: 4 }}>Ativação</div>
            <div style={{ fontSize: 13, color: '#A1A1AA', lineHeight: 1.6 }}>
              Após confirmação do pagamento, nosso time ativa sua assinatura em até 2 horas úteis.
            </div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#52525B', textAlign: 'center' }}>
        Pagamento automático via gateway será implementado em breve. Por enquanto, o processo é manual mas seguro.
      </p>
    </div>
  );
};
