import React from "react";
import { Typography } from "antd";

import "./index.less"; 

const { Title, Paragraph } = Typography;

export const sections = [
  {
    title: "1. Compromisso com a Privacidade e Princípios",
    content: [
      "1.1. A Diversa21 é uma rede social comunitária inclusiva desenvolvida especificamente para acolher, conectar e fortalecer pessoas com Trissomia 21 (Síndrome de Down), suas famílias, cuidadores, profissionais especializados e instituições de apoio.",
      "1.2. O respeito à dignidade humana, a proteção da intimidade, a transparência e a segurança no tratamento de dados pessoais são pilares inegociáveis do projeto.",
      <span key="1.3">1.3. Esta Política de Privacidade explica de forma clara, transparente e acessível quais dados são tratados, para quais finalidades operacionais eles são utilizados, as bases legais que legitimam o tratamento e os mecanismos de segurança e garantia de direitos dos titulares, em estrita observância à Lei Geral de Proteção de Dados Pessoais (<strong className="legal-content__highlight">LGPD</strong> — Lei nº 13.709/2018), ao <strong className="legal-content__highlight">Marco Civil da Internet</strong> (Lei nº 12.965/2014) e ao <strong className="legal-content__highlight">Estatuto da Pessoa com Deficiência</strong> (Lei nº 13.146/2015).</span>
    ]
  },
  {
    title: "2. Agentes de Tratamento",
    content: [
      <span key="2.1">2.1. <strong className="legal-content__highlight">Controladora dos Dados:</strong> A Plataforma Diversa21 atua como Controladora dos dados pessoais tratados no âmbito dos seus serviços e banco de dados.</span>,
      <span key="2.2">2.2. <strong className="legal-content__highlight">Instituições Parceiras Conveniadas:</strong> As entidades de assistência e apoio à Trissomia 21 conveniadas atuam na intermediação do cadastro e gestão local dos membros que a elas se vinculam, operando sob dever de confidencialidade e zelo no manuseio das credenciais de seus associados.</span>
    ]
  },
  {
    title: "3. Dados Pessoais Coletados e Tratados",
    content: [
      "Em conformidade com a arquitetura de software implementada, a plataforma trata estritamente as seguintes categorias de dados:",
      "3.1. Dados Cadastrais Obrigatórios (Identificação e Vínculo)",
      <ul key="ul1" className="legal-content__list">
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Nome completo:</strong> Para identificação civil do usuário perante a comunidade e a instituição.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Endereço de e-mail:</strong> Para login, comunicações institucionais de segurança e redefinição de senhas.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Data de nascimento:</strong> Para validação da faixa etária, verificação de maioridade civil e aplicação das diretrizes de proteção a dependentes, crianças e adolescentes.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Cidade e Estado:</strong> Para vinculação geográfica e integração às iniciativas comunitárias da sua região.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Instituição de Apoio:</strong> Associação ou entidade conveniada de referência na qual o usuário é atendido ou associado.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Nome de usuário e Senha criptografada:</strong> Para autenticação segura e controle de acesso restrito à Área Reservada.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Carimbo de Aceite dos Termos:</strong> Registro digital exato de data e horário em que o usuário manifestou o consentimento legal.</li>
      </ul>,
      "3.2. Dados Cadastrais Facultativos de Perfil",
      <ul key="ul2" className="legal-content__list">
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Biografia / Apresentação:</strong> Texto livre cadastrado no perfil para descrever afinidades, interesses e vivências.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Fotografia de Perfil (Avatar) e Capa:</strong> Imagens voluntariamente carregadas pelo usuário para representação visual de sua conta.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Galeria de Fotos Pessoais:</strong> Registros fotográficos incluídos pelo usuário em sua galeria individual.</li>
      </ul>,
      "3.3. Dados Pessoais Sensíveis e Proteção de Crianças e Adolescentes",
      <ul key="ul3" className="legal-content__list">
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Contexto de Saúde e Trissomia 21:</strong> Em razão da vocação e finalidade inclusiva da plataforma, os relatos, postagens e o próprio ingresso na comunidade envolvem dados sobre saúde e condição genética de desenvolvimento (Art. 5º, II e Art. 11 da LGPD). O tratamento é legitimado pelo consentimento expresso do titular ou de seu representante legal, adotando-se medidas reforçadas de segurança técnica e proibição absoluta de exploração econômica ou discriminatória desses dados.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Menores de Idade:</strong> Nos termos do Art. 14 da LGPD e do Estatuto da Criança e do Adolescente (ECA), o cadastro e a utilização da plataforma por crianças e adolescentes dependem de consentimento e supervisão contínua de ao menos um dos pais ou do responsável legal, intermediados pela instituição parceira.</li>
      </ul>,
      "3.4. Conteúdo e Interações na Rede",
      <ul key="ul4" className="legal-content__list">
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Publicações no Feed e Comentários:</strong> Mensagens de texto (de até 2.000 caracteres), imagens, comentários e manifestações de curtidas.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Mensagens Privadas Diretas (Chat):</strong> Conversas 1-a-1 via canal em tempo real, exclusivamente entre membros com conexão de amizade mútua aceita, incluindo reações, edição e carimbos de envio, leitura e exclusão.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Fórum Comunitário e Publicações Anônimas:</strong> Tópicos e respostas em debates públicos de apoio. Na opção de postagem anônima, os dados de identificação são suprimidos visualmente perante a comunidade, permanecendo a vinculação técnica interna preservada na base de dados para segurança jurídica e cumprimento de dever legal (Marco Civil da Internet).</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Guia de Serviços Favoritados:</strong> Relação dos contatos de serviços de apoio e profissionais que o usuário opta por marcar como favoritos.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Participação em Eventos:</strong> Confirmação indicativa de presença em encontros e oficinas comunitárias promovidas por instituições.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Preferências de Notificações:</strong> Registro de categorias de alertas que o usuário escolheu expressamente silenciar ou desativar.</li>
      </ul>,
      "3.5. Dados de Denúncias e Moderação",
      <ul key="ul5" className="legal-content__list">
        <li className="legal-content__list-item">Registros de denúncias formuladas pelo usuário contra postagens, comentários ou perfis, contendo justificativa e enquadramento nos motivos implementados (<span className="legal-content__code">spam</span>, <span className="legal-content__code">hate_speech</span>, <span className="legal-content__code">harassment</span>, <span className="legal-content__code">inappropriate</span>, <span className="legal-content__code">other</span>), bem como o histórico de auditoria e resolução da moderação.</li>
      </ul>,
      "3.6. Registros de Conexão e Tecnologias de Sessão",
      <ul key="ul6" className="legal-content__list">
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Cookies e Sessões de Autenticação:</strong> Cookies essenciais necessários para manter o usuário conectado durante a navegação.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Armazenamento Local do Navegador:</strong> Dados de sessão da funcionalidade opcional de "Lembrar-me" na tela de login.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Proteção Altcha:</strong> Verificação de segurança computada localmente no navegador contra robôs invasores, sem coleta de dados pessoais e sem rastreamento de navegação externa.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Logs de Acesso a Aplicações:</strong> Endereço IP, data, hora, porta lógica e agente de usuário, coletados e armazenados em observância ao Artigo 15 da Lei nº 12.965/2014.</li>
      </ul>
    ]
  },
  {
    title: "4. Finalidades e Bases Legais do Tratamento",
    content: [
      "Todo tratamento de dados pessoais realizado na Diversa21 possui finalidade legítima e respaldo expresso na LGPD e no Marco Civil da Internet:",
      <table key="table1" className="legal-content__table">
        <thead>
          <tr>
            <th>Finalidade do Tratamento</th>
            <th>Categoria de Dados Envolvida</th>
            <th>Base Legal (LGPD)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong className="legal-content__highlight">Criação de conta e autenticação na Área Reservada</strong></td>
            <td>Nome, e-mail, senha criptografada, instituição, cidade, data de nascimento</td>
            <td><strong className="legal-content__highlight">Execução de Contrato</strong> (Art. 7º, V) e <strong className="legal-content__highlight">Consentimento</strong> (Art. 14 para menores)</td>
          </tr>
          <tr>
            <td><strong className="legal-content__highlight">Disponibilização do Perfil, Feed, Chat e Fórum</strong></td>
            <td>Textos, imagens, comentários, mensagens privadas e curtidas</td>
            <td><strong className="legal-content__highlight">Execução de Contrato</strong> (Art. 7º, V)</td>
          </tr>
          <tr>
            <td><strong className="legal-content__highlight">Compartilhamento comunitário sobre Trissomia 21</strong></td>
            <td>Vivências, relatos no fórum, mensagens e condição inclusiva</td>
            <td><strong className="legal-content__highlight">Consentimento Específico</strong> (Art. 11, I) para dados sensíveis</td>
          </tr>
          <tr>
            <td><strong className="legal-content__highlight">Gestão de denúncias, apuração de abusos e segurança</strong></td>
            <td>Dados da denúncia, registros de histórico e itens reportados</td>
            <td><strong className="legal-content__highlight">Exercício Regular de Direitos</strong> (Art. 7º, VI e Art. 11, II, "d") e <strong className="legal-content__highlight">Legítimo Interesse</strong> (Art. 7º, IX)</td>
          </tr>
          <tr>
            <td><strong className="legal-content__highlight">Guarda obrigatória de registros de conexão</strong></td>
            <td>Endereço IP, data/hora e metadados de acesso</td>
            <td><strong className="legal-content__highlight">Cumprimento de Obrigação Legal</strong> (Art. 7º, II c/c Art. 15 do Marco Civil da Internet)</td>
          </tr>
          <tr>
            <td><strong className="legal-content__highlight">Atendimento a solicitações de redefinição de senha</strong></td>
            <td>E-mail e chave temporária com limite de expiração</td>
            <td><strong className="legal-content__highlight">Execução de Contrato</strong> e <strong className="legal-content__highlight">Legítimo Interesse de Segurança</strong> (Art. 7º, V e IX)</td>
          </tr>
        </tbody>
      </table>
    ]
  },
  {
    title: "5. Compartilhamento e Não Comercialização de Dados",
    content: [
      <span key="5.1">5.1. <strong className="legal-content__highlight">Inexistência de Comercialização:</strong> A Diversa21 <strong className="legal-content__highlight">não</strong> comercializa, não aluga, não monetiza e não repassa os dados pessoais de seus membros a corretores de dados, parceiros comerciais ou redes de publicidade direcionada.</span>,
      "5.2. Hipóteses Específicas de Compartilhamento:",
      <ul key="ul7" className="legal-content__list">
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Com a Instituição Parceira Vinculada:</strong> Os gestores autorizados da instituição de referência do usuário têm acesso aos cadastros dos membros a ela atrelados para acompanhamento e suporte institucional.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Com outros Membros da Rede:</strong> Os dados de perfil público (nome, foto, biografia, cidade, instituição) e publicações no Feed e Fórum são visíveis para outros usuários autenticados na Área Reservada. Mensagens privadas são restritas aos interlocutores com amizade mútua. No Fórum, postagens com a opção anônima ativada ocultam o nome e foto do autor perante a comunidade.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Com Prestadores de Infraestrutura Tecnológica:</strong> Provedores de hospedagem de servidores e banco de dados que atuam como operadores e sob rigorosos acordos de sigilo e padrões técnicos de segurança da informação.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Com Autoridades Públicas e Judiciais:</strong> Mediante requisição formal devidamente fundamentada ou ordem judicial emanada nos termos da legislação processual brasileira e do Marco Civil da Internet.</li>
      </ul>
    ]
  },
  {
    title: "6. Armazenamento, Segurança e Retenção de Dados",
    content: [
      <span key="6.1">6.1. <strong className="legal-content__highlight">Medidas Técnicas de Segurança:</strong> A plataforma implementa salvaguardas rigorosas contra acessos não autorizados, destruição ou vazamentos, incluindo criptografia de senhas no banco de dados, validação de grupos de acesso restritos, conexões seguras e proteção contra bots.</span>,
      "6.2. Prazos de Retenção:",
      <ul key="ul8" className="legal-content__list">
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Dados de Perfil e Conta:</strong> Armazenados enquanto a conta permanecer ativa. Em caso de desligamento ou revogação de acesso solicitada pelo titular ou por sua instituição, a conta é desativada da navegação ativa.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Mensagens Privadas:</strong> Ao serem excluídas pelo usuário, as mensagens recebem carimbo de exclusão lógica e tornam-se inativas no sistema, preservando a higidez técnica e probatória para apuração de ilícitos ou denúncias.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Publicações no Feed:</strong> A exclusão pelo autor remove o post e desencadeia a eliminação recursiva de suas curtidas e notificações no banco de dados.</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Registros de Conexão:</strong> Mantidos em ambiente estritamente sigiloso e controlado pelo prazo legal de 6 (seis) meses, após o qual são descartados, ressalvada ordem judicial em contrário.</li>
      </ul>
    ]
  },
  {
    title: "7. Direitos dos Titulares de Dados",
    content: [
      "Em conformidade com o Artigo 18 da LGPD, o usuário (ou seu responsável legal) tem o direito de requerer, a qualquer momento e de forma gratuita:",
      <ol key="ol1" className="legal-content__list legal-content__list--numbered">
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Confirmação e Acesso:</strong> Saber se seus dados pessoais são tratados pela Diversa21 e obter cópia das informações cadastrais existentes;</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Correção:</strong> Retificar dados incompletos, desatualizados ou incorretos diretamente no seu painel de Perfil ou solicitando à instituição parceira responsável pelo cadastro;</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Anonimização ou Bloqueio:</strong> Solicitar a restrição de dados excessivos ou tratados em desacordo com a lei;</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Eliminação:</strong> Requerer a exclusão dos dados pessoais tratados com base no seu consentimento, ressalvadas as hipóteses legais de guarda obrigatória;</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Gerenciamento de Comunicações:</strong> Configurar e desativar alertas específicos no painel de Notificações;</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Revogação do Consentimento:</strong> Revogar o consentimento previamente manifestado, ciente de que a revogação impedirá a continuidade da utilização dos recursos interativos da Área Reservada;</li>
        <li className="legal-content__list-item"><strong className="legal-content__highlight">Petição perante a Autoridade Nacional:</strong> Apresentar manifestação à Autoridade Nacional de Proteção de Dados (ANPD) caso entenda violado algum de seus direitos fundamentais.</li>
      </ol>
    ]
  },
  {
    title: "8. Encarregado pelo Tratamento de Dados (DPO) e Canal de Contato",
    content: [
      "8.1. Para esclarecer dúvidas sobre esta Política de Privacidade, solicitar o exercício de qualquer direito previsto na LGPD ou reportar incidentes de segurança da informação, o usuário ou seu responsável legal poderá acionar a administração da plataforma ou a gestão de sua instituição parceira de vínculo.",
      "8.2. O canal de atendimento responderá às solicitações dentro dos prazos razoáveis e conforme os parâmetros estabelecidos pela regulamentação da ANPD."
    ]
  },
  {
    title: "9. Atualizações desta Política",
    content: [
      "9.1. Esta Política de Privacidade poderá ser revisada periodicamente para acompanhar evoluções técnicas da plataforma ou novas disposições legais e regulatórias.",
      "9.2. Caso sejam efetuadas alterações substanciais na forma como os dados são tratados, o usuário será notificado na Área Reservada e um novo modal obrigatório de consentimento será apresentado para ciência e renovação de aceite."
    ]
  }
];

export default function PrivacyContent() {
  return (
    <div className="legal-content">
      {sections.map((section, index) => (
        <div key={index} className="legal-content__section">
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