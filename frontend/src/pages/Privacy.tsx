import { Link } from 'react-router-dom';
import { Boxes } from 'lucide-react';

export const Privacy = () => (
  <div style={{ background: '#000', color: '#EDEDED', fontFamily: "'Inter', sans-serif", minHeight: '100vh', padding: '80px 24px 60px' }}>
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#5E6AD2', textDecoration: 'none', marginBottom: 40, fontSize: 14 }}>
        <Boxes size={20} /> Voltar ao início
      </Link>

      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Política de Privacidade</h1>
      <p style={{ color: '#71717A', fontSize: 14, marginBottom: 40 }}>Última atualização: 22 de março de 2026</p>

      {[
        { title: '1. Dados Coletados', body: 'Coletamos os seguintes dados pessoais: nome, email, telefone, informações de agendamento e identificador Telegram (chat_id). Dados de pacientes são fornecidos exclusivamente pelo responsável da clínica.' },
        { title: '2. Finalidade do Tratamento', body: 'Os dados são utilizados para: (a) gerenciamento de agendamentos; (b) envio de lembretes de consultas via Telegram; (c) geração de relatórios para a clínica; (d) comunicação sobre o serviço.' },
        { title: '3. Base Legal (LGPD)', body: 'O tratamento de dados é baseado em: (a) execução de contrato (Art. 7º, V da LGPD) para funcionalidades essenciais; (b) consentimento do titular (Art. 7º, I) para envio de mensagens; (c) legítimo interesse (Art. 7º, IX) para melhorias do serviço.' },
        { title: '4. Compartilhamento', body: 'Não vendemos nem compartilhamos dados pessoais com terceiros. Os dados são acessados exclusivamente pela clínica responsável pelo cadastro, dentro do isolamento multi-tenant do sistema.' },
        { title: '5. Segurança', body: 'Implementamos medidas de segurança que incluem: criptografia TLS/SSL em todas as comunicações, autenticação JWT com refresh token, isolamento de dados por tenant (UUID), senhas armazenadas com hash BCrypt e logs de acesso.' },
        { title: '6. Retenção', body: 'Os dados são mantidos enquanto a conta estiver ativa. Após o cancelamento, mantemos os dados por 90 dias para fins de backup e cumprimento de obrigações legais, sendo então eliminados definitivamente.' },
        { title: '7. Direitos do Titular', body: 'Conforme a LGPD, os titulares dos dados têm direito a: (a) confirmação da existência do tratamento; (b) acesso aos dados; (c) correção de dados incorretos; (d) eliminação de dados desnecessários; (e) portabilidade; (f) revogação do consentimento. Solicitações podem ser feitas via email: privacidade@omnib2b.com.br' },
        { title: '8. Cookies', body: 'Utilizamos apenas cookies essenciais para funcionamento da autenticação (JWT token armazenado em localStorage). Não utilizamos cookies de rastreamento ou análise comportamental.' },
        { title: '9. Transferência Internacional', body: 'Os dados são armazenados em servidores localizados no Brasil. Caso haja necessidade de transferência internacional, será realizada conforme as garantias exigidas pela LGPD.' },
        { title: '10. Encarregado (DPO)', body: 'Para exercer seus direitos ou dúvidas sobre privacidade, contate nosso Encarregado de Proteção de Dados pelo email: dpo@omnib2b.com.br' },
      ].map((s) => (
        <div key={s.title} style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#EDEDED' }}>{s.title}</h3>
          <p style={{ fontSize: 14, color: '#A1A1AA', lineHeight: 1.8 }}>{s.body}</p>
        </div>
      ))}
    </div>
  </div>
);
