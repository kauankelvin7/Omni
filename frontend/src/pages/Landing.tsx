import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes, ArrowRight, CheckCircle2, Clock,
  MessageSquare, LayoutDashboard, Shield, Bot, BarChart3,
  ChevronRight, Star, Zap, Users
} from 'lucide-react';

/* ─── Intersection Observer Hook ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Fade-in Section Wrapper ─── */
const Section = ({ children, className = '', id = '' }: { children: React.ReactNode; className?: string; id?: string }) => {
  const { ref, visible } = useInView();
  return (
    <section
      ref={ref}
      id={id}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {children}
    </section>
  );
};

/* ═══════════════════════════════════ */
/*           LANDING PAGE             */
/* ═══════════════════════════════════ */
export const Landing = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ flex: 1, width: '100%', height: '100vh', overflowY: 'auto', overflowX: 'hidden', background: '#000', color: '#EDEDED', fontFamily: "'Inter', sans-serif" }}>
      {/* ═══ HEADER ═══ */}
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? 'rgba(0,0,0,0.8)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'all 0.3s ease',
          padding: '0 24px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 18 }}>
            <Boxes size={24} style={{ color: '#5E6AD2' }} />
            Omni B2B
          </div>
          <nav className="header-nav" style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 14, color: '#A1A1AA' }}>
            <a href="#funcionalidades" className="desktop-only" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Funcionalidades</a>
            <a href="#precos" className="desktop-only" style={{ color: 'inherit', textDecoration: 'none' }}>Preços</a>
            <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Entrar</Link>
            <Link
              to="/register"
              style={{
                background: 'linear-gradient(180deg, #7B85E0 0%, #5E6AD2 100%)',
                color: '#fff', padding: '8px 20px', borderRadius: 8, textDecoration: 'none',
                fontWeight: 600, fontSize: 13, border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 2px 8px rgba(94,106,210,0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              Começar grátis
            </Link>
          </nav>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 80px', position: 'relative',
      }}>
        {/* BG Glow */}
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(94,106,210,0.15) 0%, transparent 70%)',
          top: '20%', left: '50%', transform: 'translateX(-50%)', filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(94,106,210,0.1)', border: '1px solid rgba(94,106,210,0.2)',
          borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 500, color: '#A1A1FF',
          marginBottom: 32,
        }}>
          <Zap size={14} /> Confirmação automática de consultas
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', maxWidth: 700, marginBottom: 24 }}>
          Sua clínica nunca mais vai perder paciente por falta
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#A1A1AA', maxWidth: 560, lineHeight: 1.6, marginBottom: 40 }}>
          O Omni confirma consultas pelo Telegram automaticamente. Seus pacientes lembram, sua agenda fica cheia.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register" style={{
            background: 'linear-gradient(180deg, #7B85E0 0%, #5E6AD2 100%)',
            color: '#fff', padding: '14px 28px', borderRadius: 10, textDecoration: 'none',
            fontWeight: 600, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8,
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 4px 16px rgba(94,106,210,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
            transition: 'transform 0.2s',
          }}>
            Começar grátis por 30 dias <ArrowRight size={18} />
          </Link>
          <a href="#como-funciona" style={{
            background: 'rgba(255,255,255,0.05)', color: '#EDEDED', padding: '14px 28px', borderRadius: 10,
            textDecoration: 'none', fontWeight: 500, fontSize: 15, border: '1px solid rgba(255,255,255,0.1)',
            transition: 'background 0.2s',
          }}>
            Ver como funciona
          </a>
        </div>
      </section>

      {/* ═══ NÚMEROS ═══ */}
      <Section>
        <div style={{
          maxWidth: 900, margin: '0 auto', padding: '0 24px 80px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, textAlign: 'center',
        }}>
          {[
            { value: '87%', label: 'menos faltas' },
            { value: '30 min', label: 'economizados por dia' },
            { value: 'R$ 300', label: 'recuperados por consulta' },
          ].map((s) => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: '32px 24px',
            }}>
              <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', color: '#5E6AD2' }}>{s.value}</div>
              <div style={{ fontSize: 14, color: '#A1A1AA', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ PROBLEMA ═══ */}
      <Section>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Sua recepcionista não deveria passar o dia ligando para pacientes
          </h2>
          <p style={{ color: '#71717A', fontSize: 16, marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
            Clínicas perdem em média 30% da receita mensal por faltas de pacientes não avisadas.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              { icon: <Clock size={24} />, title: 'Pacientes que esquecem e não avisam', desc: 'A maioria das faltas acontece simplesmente porque o paciente esqueceu.' },
              { icon: <BarChart3 size={24} />, title: 'Agenda cheia no papel, vazia na prática', desc: 'Horários bloqueados que poderiam ser preenchidos por outros pacientes.' },
              { icon: <MessageSquare size={24} />, title: 'Tempo perdido em ligações não atendidas', desc: 'Sua equipe gasta horas ligando para números que não atendem.' },
            ].map((c) => (
              <div key={c.title} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: 32, textAlign: 'left',
                transition: 'border-color 0.3s, transform 0.3s',
              }}>
                <div style={{ color: '#EF4444', marginBottom: 16 }}>{c.icon}</div>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{c.title}</h4>
                <p style={{ fontSize: 14, color: '#71717A', lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ COMO FUNCIONA ═══ */}
      <Section id="como-funciona">
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 48 }}>
            Simples para você. Mágico para o paciente.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            {[
              { step: '01', title: 'Cadastre o paciente e agende', desc: 'Use o painel para registrar pacientes e criar agendamentos.', icon: <Users size={28} /> },
              { step: '02', title: 'Omni envia lembrete 24h antes', desc: 'Automaticamente pelo Telegram. Sem intervenção humana.', icon: <Bot size={28} /> },
              { step: '03', title: 'Paciente confirma com um clique', desc: 'Rápido, simples e sem ligações. Agenda confirmada.', icon: <CheckCircle2 size={28} /> },
            ].map((s) => (
              <div key={s.step} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'rgba(94,106,210,0.1)', border: '1px solid rgba(94,106,210,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7B85E0',
                }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 12, color: '#5E6AD2', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>PASSO {s.step}</div>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{s.title}</h4>
                <p style={{ fontSize: 14, color: '#71717A', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ FUNCIONALIDADES ═══ */}
      <Section id="funcionalidades">
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 48 }}>
            Tudo o que sua clínica precisa
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { icon: <MessageSquare size={22} />, title: 'Confirmação automática via Telegram', desc: 'Lembretes e confirmações 24h antes sem intervenção.' },
              { icon: <LayoutDashboard size={22} />, title: 'Painel de gestão completo', desc: 'Pacientes, agendamentos, métricas e relatórios.' },
              { icon: <Users size={22} />, title: 'Multi-tenant (várias unidades)', desc: 'Cada clínica tem seus dados isolados e seguros.' },
              { icon: <BarChart3 size={22} />, title: 'Relatórios de faltas e confirmações', desc: 'Métricas em tempo real para acompanhar resultados.' },
              { icon: <Bot size={22} />, title: 'Bot 24h sem intervenção humana', desc: 'Funciona automaticamente, mesmo nos feriados.' },
              { icon: <Shield size={22} />, title: 'Dados protegidos (LGPD)', desc: 'Conformidade total com a Lei Geral de Proteção de Dados.' },
            ].map((f) => (
              <div key={f.title} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: 28, textAlign: 'left',
                transition: 'border-color 0.3s',
              }}>
                <div style={{ color: '#5E6AD2', marginBottom: 14 }}>{f.icon}</div>
                <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{f.title}</h4>
                <p style={{ fontSize: 13, color: '#71717A', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ PREÇOS ═══ */}
      <Section id="precos">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Planos simples. Sem surpresas.
          </h2>
          <p style={{ color: '#71717A', fontSize: 16, marginBottom: 48 }}>30 dias grátis. Cancele quando quiser.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'stretch' }}>
            {/* Starter */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '40px 32px', textAlign: 'left', display: 'flex', flexDirection: 'column',
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#EDEDED' }}>Starter</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 700 }}>R$ 197</span>
                <span style={{ color: '#71717A', fontSize: 14 }}>/mês</span>
              </div>
              {['Até 100 pacientes', 'Bot de confirmação', 'Painel de gestão', 'Suporte por email'].map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#A1A1AA', marginBottom: 12 }}>
                  <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} /> {f}
                </div>
              ))}
              <div style={{ flex: 1 }} />
              <Link to="/register" style={{
                display: 'block', textAlign: 'center', marginTop: 24,
                background: 'rgba(255,255,255,0.06)', color: '#EDEDED', padding: '12px 24px',
                borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 14,
                border: '1px solid rgba(255,255,255,0.1)', transition: 'background 0.2s',
              }}>
                Começar grátis
              </Link>
            </div>

            {/* Pro (Destaque) */}
            <div style={{
              background: 'rgba(94,106,210,0.06)', border: '2px solid rgba(94,106,210,0.3)',
              borderRadius: 20, padding: '40px 32px', textAlign: 'left', position: 'relative',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 0 60px rgba(94,106,210,0.1)',
            }}>
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(180deg, #7B85E0, #5E6AD2)', color: '#fff',
                padding: '4px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Star size={12} /> Mais popular
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#EDEDED' }}>Pro</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 700 }}>R$ 397</span>
                <span style={{ color: '#71717A', fontSize: 14 }}>/mês</span>
              </div>
              {['Pacientes ilimitados', 'Tudo do Starter', 'Relatórios avançados', 'Múltiplos usuários', 'Suporte prioritário'].map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#A1A1AA', marginBottom: 12 }}>
                  <CheckCircle2 size={16} style={{ color: '#5E6AD2', flexShrink: 0 }} /> {f}
                </div>
              ))}
              <div style={{ flex: 1 }} />
              <Link to="/register" style={{
                display: 'block', textAlign: 'center', marginTop: 24,
                background: 'linear-gradient(180deg, #7B85E0 0%, #5E6AD2 100%)',
                color: '#fff', padding: '12px 24px', borderRadius: 10, textDecoration: 'none',
                fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 4px 16px rgba(94,106,210,0.3)',
              }}>
                Começar grátis
              </Link>
            </div>

            {/* Clínica+ */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '40px 32px', textAlign: 'left', display: 'flex', flexDirection: 'column',
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#EDEDED' }}>Clínica+</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 700 }}>R$ 797</span>
                <span style={{ color: '#71717A', fontSize: 14 }}>/mês</span>
              </div>
              {['Múltiplas unidades', 'Tudo do Pro', 'API personalizada', 'Gerente dedicado'].map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#A1A1AA', marginBottom: 12 }}>
                  <CheckCircle2 size={16} style={{ color: '#F59E0B', flexShrink: 0 }} /> {f}
                </div>
              ))}
              <div style={{ flex: 1 }} />
              <Link to="/register" style={{
                display: 'block', textAlign: 'center', marginTop: 24,
                background: 'rgba(255,255,255,0.06)', color: '#EDEDED', padding: '12px 24px',
                borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 14,
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                Falar com vendas
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ DEPOIMENTOS ═══ */}
      <Section>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 48 }}>
            O que dizem nossos clientes
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              { quote: 'Reduzi as faltas em 80% no primeiro mês.', name: 'Dra. Ana Paula', role: 'Odontologista, Brasília' },
              { quote: 'Os pacientes adoraram. Simples e eficiente.', name: 'Dr. Carlos Mendes', role: 'Psicólogo, Taguatinga' },
              { quote: 'Recuperei o investimento na primeira semana.', name: 'Clínica Bella', role: 'Estética, Águas Claras' },
            ].map((t) => (
              <div key={t.name} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: 28,
              }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {[1,2,3,4,5].map((s) => <Star key={s} size={16} style={{ color: '#F59E0B', fill: '#F59E0B' }} />)}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 20, fontStyle: 'italic', color: '#D4D4D8' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: '#71717A' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ CTA FINAL ═══ */}
      <Section>
        <div style={{
          maxWidth: 800, margin: '0 auto', padding: '80px 24px', textAlign: 'center',
        }}>
          <div style={{
            background: 'rgba(94,106,210,0.05)', border: '1px solid rgba(94,106,210,0.15)',
            borderRadius: 24, padding: '64px 40px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', width: 400, height: 400, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(94,106,210,0.1) 0%, transparent 70%)',
              top: '-40%', right: '-10%', pointerEvents: 'none',
            }} />
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Comece hoje. Sua agenda agradece.
            </h2>
            <p style={{ color: '#71717A', fontSize: 16, marginBottom: 32 }}>
              30 dias grátis. Sem cartão de crédito.
            </p>
            <Link to="/register" style={{
              background: 'linear-gradient(180deg, #7B85E0 0%, #5E6AD2 100%)',
              color: '#fff', padding: '14px 32px', borderRadius: 10, textDecoration: 'none',
              fontWeight: 600, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 4px 20px rgba(94,106,210,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}>
              Criar conta grátis <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </Section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        maxWidth: 1200, margin: '0 auto', padding: '40px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
        fontSize: 13, color: '#71717A',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Boxes size={18} style={{ color: '#5E6AD2' }} />
          <span>Omni B2B — Gestão inteligente para clínicas</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="#funcionalidades" style={{ color: 'inherit', textDecoration: 'none' }}>Funcionalidades</a>
          <a href="#precos" style={{ color: 'inherit', textDecoration: 'none' }}>Preços</a>
          <Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Termos</Link>
          <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacidade</Link>
        </div>
        <div>© 2026 Omni B2B — Desenvolvido por Kauan Kelvin</div>
      </footer>
    </div>
  );
};
