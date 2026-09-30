import React from "react";
import { Typography } from "antd";

import "./index.less";

const { Title, Paragraph } = Typography;

export const termsSections = [
  {
    title: "1. Apresentação e Objeto da Plataforma",
    content: [
      "1.1. A Diversa21 é uma rede social comunitária inclusiva, desenvolvida especialmente para conectar pessoas com Trissomia 21 (Síndrome de Down) e TEA (Transtorno do Espectro Autista), seus familiares, cuidadores, profissionais especializados e instituições de apoio.",
      "1.2. O objetivo da plataforma é proporcionar um ambiente digital seguro, colaborativo e acessível para o compartilhamento de vivências, fortalecimento de laços de amizade, troca de orientações e divulgação de iniciativas comunitárias.",
      "1.3. O acesso e a utilização dos recursos da Diversa21 são regidos por estes Termos e Condições de Uso e pela Política de Privacidade integrada."
    ]
  },
  {
    title: "2. Acesso, Cadastro Institucional e Segurança de Credenciais",
    content: [
      <span key="2.1">2.1. <strong className="terms-content__highlight">Origem do Cadastro:</strong> O acesso à Área Reservada da Diversa21 é viabilizado por meio de cadastro prévio realizado por Administradores da plataforma ou por Gestores autorizados das Instituições Parceiras conveniadas, sendo todo usuário vinculado a uma instituição de referência e a uma cidade.</span>,
      <span key="2.2">2.2. <strong className="terms-content__highlight">Conferência e Atualização Cadastral:</strong> Ao realizar o primeiro acesso, o usuário deve conferir seus dados (como nome, data de nascimento e cidade). É facultado ao usuário personalizar e manter atualizadas suas informações de biografia, foto de perfil (avatar), imagem de capa e galeria pessoal no módulo de Perfil.</span>,
      <span key="2.3">2.3. <strong className="terms-content__highlight">Guarda e Sigilo da Senha:</strong> A senha cadastrada é pessoal, intransferível e de responsabilidade exclusiva do usuário (ou de seu representante legal, quando aplicável). Em caso de esquecimento ou suspeita de acesso indevido, o usuário deve utilizar a função de recuperação de senha por e-mail disponibilizada na tela de login ou contatar imediatamente a instituição responsável.</span>,
      <span key="2.4">2.4. <strong className="terms-content__highlight">Uso de Contas:</strong> É terminantemente proibido compartilhar credenciais, permitir o acesso de terceiros não autorizados ou utilizar dados de outra pessoa para acessar o ambiente.</span>
    ]
  },
  {
    title: "3. Condição Obrigatória de Aceite",
    content: [
      <span key="3.1">3.1. <strong className="terms-content__highlight">Momento do Aceite:</strong> No primeiro login na Área Reservada, o usuário visualizará o modal obrigatório de consentimento. O acesso completo aos recursos da plataforma fica condicionado à aceitação expressa e cumulativa destes Termos e Condições de Uso e da Política de Privacidade.</span>,
      <span key="3.2">3.2. <strong className="terms-content__highlight">Registro Eletrônico:</strong> Ao assinalar os termos e clicar em aceitar, o sistema registra formalmente a confirmação digital associada ao perfil do usuário no banco de dados da aplicação.</span>,
      <span key="3.3">3.3. <strong className="terms-content__highlight">Recusa:</strong> Caso o usuário não concorde com qualquer disposição aqui prevista, não deverá confirmar o aceite, ficando impedido de interagir na Área Reservada.</span>
    ]
  },
  {
    title: "4. Regras Específicas por Módulo da Plataforma",
    content: [
      "4.1. Feed de Publicações e Comentários",
      <ul key="ul1" className="terms-content__list">
        <li className="terms-content__list-item">Os usuários podem compartilhar mensagens de texto, fotografias, comentários e manifestar curtidas.</li>
        <li className="terms-content__list-item">O usuário declara e garante que detém a titularidade ou autorização legítima de imagem para toda fotografia ou conteúdo publicado.</li>
        <li className="terms-content__list-item">É proibida a publicação de fotografias de terceiros ou de pessoas vulneráveis sem o devido consentimento familiar ou institucional.</li>
      </ul>,
      "4.2. Mensagens Privadas (Chat em Tempo Real)",
      <ul key="ul2" className="terms-content__list">
        <li className="terms-content__list-item">A plataforma oferece canal de troca de mensagens privadas diretas via conexão em tempo real.</li>
        <li className="terms-content__list-item">O chat privado é restrito exclusivamente a pessoas que possuam vínculo de amizade aceito mutuamente no módulo de conexões.</li>
        <li className="terms-content__list-item">As mensagens privadas devem observar rigorosamente o respeito mútuo. É expressamente vedado o uso do chat para importunação, assédio, solicitações indevidas de cunho financeiro, compartilhamento de links maliciosos ou envio de conteúdo impróprio.</li>
      </ul>,
      "4.3. Fórum de Apoio Comunitário e Publicações Anônimas",
      <ul key="ul3" className="terms-content__list">
        <li className="terms-content__list-item">O fórum disponibiliza salas temáticas para debates, orientações e dúvidas da comunidade.</li>
        <li className="terms-content__list-item">O sistema disponibiliza nativamente o recurso de publicação de tópicos e respostas na modalidade anônima, visando proteger a intimidade de familiares e membros ao debaterem questões sensíveis de saúde, inclusão e desenvolvimento.</li>
        <li className="terms-content__list-item"><strong className="terms-content__highlight">Alcance do Anonimato:</strong> O recurso anônimo oculta a identidade do autor perante os demais membros da comunidade pública. No entanto, para fins de segurança jurídica, cumprimento do Marco Civil da Internet (Lei nº 12.965/2014) e apuração de eventuais ilícitos, os registros técnicos internos permanecem preservados no sistema para atendimento a requisições judiciais ou providências de moderação.</li>
      </ul>,
      "4.4. Catálogo de Prestadores e Serviços Especializados",
      <ul key="ul4" className="terms-content__list">
        <li className="terms-content__list-item">A Diversa21 disponibiliza uma seção informativa com contatos públicos de profissionais, clínicas, terapeutas e serviços de apoio.</li>
        <li className="terms-content__list-item"><strong className="terms-content__highlight">Isenção de Responsabilidade:</strong> A Diversa21 atua estritamente como guia e catálogo indicativo de interesse social. A plataforma <strong className="terms-content__highlight">não</strong> presta os serviços médicos, terapêuticos ou assistenciais indicados, <strong className="terms-content__highlight">não</strong> fiscaliza o exercício profissional, <strong className="terms-content__highlight">não</strong> intermédia agendamentos nem transações financeiras e <strong className="terms-content__highlight">não</strong> assume qualquer responsabilidade direta, solidária ou subsidiária pela qualidade, diagnósticos, condutas, custos ou tratamentos ministrados por esses profissionais independentes.</li>
      </ul>,
      "4.5. Instituições Parceiras e Eventos Comunitários",
      <ul key="ul5" className="terms-content__list">
        <li className="terms-content__list-item">Os perfis institucionais e a agenda de eventos destinam-se à divulgação de encontros, oficinas e ações inclusivas promovidas pelas entidades de apoio.</li>
        <li className="terms-content__list-item">A marcação de presença no sistema serve para controle indicativo de adesão comunitária. A organização, segurança, infraestrutura e realização física de qualquer evento cabem unicamente aos seus organizadores responsáveis.</li>
      </ul>
    ]
  },
  {
    title: "5. Propriedade Intelectual e Licença de Conteúdo",
    content: [
      <span key="5.1">5.1. <strong className="terms-content__highlight">Direitos sobre a Plataforma:</strong> A marca Diversa21, a identidade visual, arquitetura de software, interfaces, banco de dados e marcas comerciais associadas são de titularidade exclusiva dos seus mantenedores e protegidas pelas leis de propriedade intelectual.</span>,
      <span key="5.2">5.2. <strong className="terms-content__highlight">Licença de Conteúdo:</strong> O usuário permanece proprietário dos textos e imagens que publicar na plataforma. Ao postar qualquer conteúdo no Feed, Fórum ou Perfil, o usuário concede à Diversa21 uma licença gratuita, não exclusiva, livre de royalties e válida durante o período de ativação da conta, para armazenar, processar, exibir e distribuir tal conteúdo estritamente dentro das finalidades operacionais da própria rede social.</span>
    ]
  },
  {
    title: "6. Regras de Conduta e Convivência",
    content: [
      "6.1. A Diversa21 é pautada pela empatia, proteção à dignidade humana e inclusão social.",
      "6.2. É estritamente vedado a qualquer usuário:",
      <ul key="ul6" className="terms-content__list">
        <li className="terms-content__list-item">Praticar qualquer conduta de capacitismo, discriminação, preconceito de raça, cor, gênero, religião ou orientação sexual;</li>
        <li className="terms-content__list-item">Veicular manifestações de ódio, ameaças, agressões verbais ou difamação contra membros, familiares ou profissionais;</li>
        <li className="terms-content__list-item">Praticar qualquer ato de assédio, perseguição (cyberbullying) ou importunação sistemática;</li>
        <li className="terms-content__list-item">Divulgar ou solicitar dados pessoais sensíveis, documentos, endereços residenciais ou dados bancários de terceiros sem autorização;</li>
        <li className="terms-content__list-item">Publicar spam, correntes, publicidade comercial não autorizada ou esquemas fraudulentos;</li>
        <li className="terms-content__list-item">Utilizar contas automatizadas (bots), explorar vulnerabilidades do sistema ou tentar violar a segurança da plataforma.</li>
      </ul>
    ]
  },
  {
    title: "7. Sistema de Denúncias e Moderação",
    content: [
      <span key="7.1">7.1. <strong className="terms-content__highlight">Ferramenta de Reporte Integrada:</strong> Qualquer membro pode denunciar infrações diretamente na interface da plataforma, podendo reportar perfis de usuários, publicações no feed, comentários, tópicos de fórum e respostas do fórum.</span>,
      <span key="7.2">7.2. <strong className="terms-content__highlight">Motivos de Denúncia Suportados:</strong> Em conformidade com a plataforma, as denúncias devem ser enquadradas nos seguintes motivos disponíveis:</span>,
      <ul key="ul7" className="terms-content__list">
        <li className="terms-content__list-item"><strong className="terms-content__highlight">Spam / Publicidade:</strong> Mensagens em massa não solicitadas ou propaganda invasiva;</li>
        <li className="terms-content__list-item"><strong className="terms-content__highlight">Discurso de Ódio:</strong> Manifestações discriminatórias, capacitistas ou ofensivas;</li>
        <li className="terms-content__list-item"><strong className="terms-content__highlight">Assédio:</strong> Importunação, ameaça ou perseguição moral/virtual;</li>
        <li className="terms-content__list-item"><strong className="terms-content__highlight">Conteúdo Impróprio:</strong> Material inadequado à comunidade, violento ou degradante;</li>
        <li className="terms-content__list-item"><strong className="terms-content__highlight">Outro:</strong> Demais comportamentos contrários a estes Termos, com justificativa descritiva.</li>
      </ul>,
      <span key="7.3">7.3. <strong className="terms-content__highlight">Atuação da Moderação:</strong> As denúncias registradas são processadas pela equipe de moderação e administração através do painel interno, passando pelos estados de análise pendente, em revisão, resolvida ou rejeitada.</span>,
      <span key="7.4">7.4. <strong className="terms-content__highlight">Medidas Disciplinares:</strong> Diante de violação confirmada, a administração da plataforma poderá, a seu critério e conforme a gravidade:</span>,
      <ul key="ul8" className="terms-content__list">
        <li className="terms-content__list-item">Advertir o usuário envolvido;</li>
        <li className="terms-content__list-item">Remover imediatamente a publicação, comentário ou tópico infracional;</li>
        <li className="terms-content__list-item">Suspender temporariamente ou revogar definitivamente o acesso da conta à plataforma;</li>
        <li className="terms-content__list-item">Notificar a instituição parceira responsável pelo vínculo cadastral do usuário.</li>
      </ul>
    ]
  },
  {
    title: "8. Isenção e Limitação de Responsabilidade",
    content: [
      "8.1. A plataforma é disponibilizada no estado em que se encontra, envidando os melhores esforços para sua disponibilidade contínua, acessibilidade e integridade, não se responsabilizando por interrupções temporárias decorrentes de manutenção, falhas de telecomunicações ou eventos de força maior.",
      "8.2. Cada usuário é civil e criminalmente responsável pelo conteúdo que publica e pelas interações que realiza, respondendo por eventuais danos causados a outros membros ou a terceiros."
    ]
  },
  {
    title: "9. Alterações e Atualizações dos Termos",
    content: [
      "9.1. A Diversa21 poderá atualizar estes Termos e Condições para refletir adequações normativas ou técnicas do serviço.",
      "9.2. Caso ocorram alterações substanciais, o usuário será notificado por meio da plataforma e o modal de consentimento será apresentado novamente para ciência e confirmação."
    ]
  },
  {
    title: "10. Legislação Aplicável e Foro",
    content: [
      "10.1. Estes Termos e Condições de Uso são regidos e interpretados em conformidade com as leis da República Federativa do Brasil, em particular o Marco Civil da Internet (Lei nº 12.965/2014), a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018) e o Estatuto da Pessoa com Deficiência (Lei nº 13.146/2015).",
      "10.2. Para a resolução de quaisquer controvérsias decorrentes destes Termos, fica eleito o foro competente do domicílio do responsável legal pela plataforma no Brasil, com renúncia expressa a qualquer outro, por mais privilegiado que seja."
    ]
  }
];

export default function TermsContent() {
  return (
    <div className="terms-content">
      {termsSections.map((section, index) => (
        <div key={index} className="terms-content__section">
          <Title level={4}>
            {section.title}
          </Title>
          {section.content.map((text, i) => (
            <Paragraph key={i}>
              {text}
            </Paragraph>
          ))}
        </div>
      ))}
    </div>
  );
}