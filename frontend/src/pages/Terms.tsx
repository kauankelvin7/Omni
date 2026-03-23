import { Link } from 'react-router-dom';
import { Boxes } from 'lucide-react';

export const Terms = () => (
  <div style={{ background: '#000', color: '#EDEDED', fontFamily: "'Inter', sans-serif", minHeight: '100vh', padding: '80px 24px 60px' }}>
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#5E6AD2', textDecoration: 'none', marginBottom: 40, fontSize: 14 }}>
        <Boxes size={20} /> Voltar ao início
      </Link>

      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Termos de Uso</h1>
      <p style={{ color: '#71717A', fontSize: 14, marginBottom: 40 }}>Última atualização: 22 de março de 2026</p>

      {[
        { title: '1. Aceitação dos Termos', body: 'Ao acessar e utilizar o Omni B2B ("Plataforma"), você concorda com estes Termos de Uso. Se você não concordar com algum destes termos, não utilize a Plataforma.' },
        { title: '2. Descrição do Serviço', body: 'O Omni B2B é uma plataforma SaaS de gestão e automação para clínicas de saúde e estética, que inclui painel administrativo, bot de confirmação de consultas via Telegram e ferramentas de relatórios.' },
        { title: '3. Cadastro e Conta', body: 'Ao criar uma conta, você declara que as informações fornecidas são verdadeiras e se compromete a mantê-las atualizadas. Você é responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas em sua conta.' },
        { title: '4. Período de Avaliação', body: 'Novas contas recebem um período de teste gratuito de 30 dias. Após esse período, é necessário assinar um dos planos disponíveis para continuar utilizando a plataforma.' },
        { title: '5. Proteção de Dados (LGPD)', body: 'O Omni B2B está em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Todos os dados pessoais de pacientes são armazenados de forma segura, com isolamento multi-tenant, criptografia em trânsito e acesso restrito por autenticação JWT.' },
        { title: '6. Responsabilidades do Usuário', body: 'O usuário se compromete a: (a) utilizar a plataforma apenas para fins lícitos; (b) não compartilhar credenciais de acesso; (c) garantir o consentimento dos pacientes para envio de mensagens via Telegram; (d) manter dados de pacientes atualizados e precisos.' },
        { title: '7. Limitação de Responsabilidade', body: 'O Omni B2B não se responsabiliza por: (a) falhas de terceiros (Telegram, provedor de internet); (b) dados incorretos inseridos pelo usuário; (c) prejuízos indiretos decorrentes do uso da plataforma.' },
        { title: '8. Cancelamento', body: 'O usuário pode cancelar sua assinatura a qualquer momento através das configurações da conta. Após o cancelamento, os dados serão mantidos por 90 dias e então removidos permanentemente.' },
        { title: '9. Alterações nos Termos', body: 'Podemos atualizar estes Termos periodicamente. Alterações significativas serão comunicadas por email. O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.' },
        { title: '10. Contato', body: 'Para dúvidas sobre estes Termos, entre em contato pelo email: suporte@omnib2b.com.br' },
      ].map((s) => (
        <div key={s.title} style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#EDEDED' }}>{s.title}</h3>
          <p style={{ fontSize: 14, color: '#A1A1AA', lineHeight: 1.8 }}>{s.body}</p>
        </div>
      ))}
    </div>
  </div>
);
