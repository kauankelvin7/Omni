import { Link } from 'react-router-dom';
import { CheckCircle2, Star, Boxes } from 'lucide-react';

export const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: 'R$ 197',
      features: ['Até 100 pacientes', 'Bot de confirmação', 'Painel de gestão', 'Suporte por email'],
      highlight: false,
      checkColor: '#10B981',
    },
    {
      name: 'Pro',
      price: 'R$ 397',
      features: ['Pacientes ilimitados', 'Tudo do Starter', 'Relatórios avançados', 'Múltiplos usuários', 'Suporte prioritário'],
      highlight: true,
      checkColor: '#5E6AD2',
    },
    {
      name: 'Clínica+',
      price: 'R$ 797',
      features: ['Múltiplas unidades', 'Tudo do Pro', 'API personalizada', 'Gerente dedicado'],
      highlight: false,
      checkColor: '#F59E0B',
    },
  ];

  return (
    <div style={{ background: '#000', color: '#EDEDED', fontFamily: "'Inter', sans-serif", minHeight: '100vh', padding: '80px 24px 60px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#5E6AD2', textDecoration: 'none', marginBottom: 40, fontSize: 14 }}>
          <Boxes size={20} /> Voltar ao início
        </Link>

        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Planos simples. Sem surpresas.
        </h1>
        <p style={{ color: '#71717A', fontSize: 16, marginBottom: 56 }}>30 dias grátis. Cancele quando quiser.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'stretch' }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{
              background: plan.highlight ? 'rgba(94,106,210,0.06)' : 'rgba(255,255,255,0.02)',
              border: plan.highlight ? '2px solid rgba(94,106,210,0.3)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '40px 32px', textAlign: 'left',
              display: 'flex', flexDirection: 'column', position: 'relative',
              boxShadow: plan.highlight ? '0 0 60px rgba(94,106,210,0.1)' : 'none',
            }}>
              {plan.highlight && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(180deg, #7B85E0, #5E6AD2)', color: '#fff',
                  padding: '4px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Star size={12} /> Mais popular
                </div>
              )}
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#EDEDED' }}>{plan.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 700 }}>{plan.price}</span>
                <span style={{ color: '#71717A', fontSize: 14 }}>/mês</span>
              </div>
              {plan.features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#A1A1AA', marginBottom: 12 }}>
                  <CheckCircle2 size={16} style={{ color: plan.checkColor, flexShrink: 0 }} /> {f}
                </div>
              ))}
              <div style={{ flex: 1 }} />
              <Link to="/register" style={{
                display: 'block', textAlign: 'center', marginTop: 24,
                background: plan.highlight ? 'linear-gradient(180deg, #7B85E0 0%, #5E6AD2 100%)' : 'rgba(255,255,255,0.06)',
                color: plan.highlight ? '#fff' : '#EDEDED',
                padding: '12px 24px', borderRadius: 10, textDecoration: 'none',
                fontWeight: 600, fontSize: 14,
                border: plan.highlight ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: plan.highlight ? '0 4px 16px rgba(94,106,210,0.3)' : 'none',
              }}>
                Começar grátis
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
