import React from 'react';
import { Collapse, Typography } from 'antd';
import './index.less';

const { Title } = Typography;

const FAQ_SECTIONS = [
  {
    title: "1. Visão Geral e Acesso à Plataforma",
    faqs: [
      {
        q: "Q1: O que é o Diversa21 e qual é o objetivo da plataforma?",
        a: <>O Diversa21 é uma rede social e espaço de apoio digital desenvolvido especificamente para pessoas com Trissomia 21 (Síndrome de Down), suas famílias, cuidadores, especialistas e instituições. A plataforma oferece um ambiente acolhedor e seguro para publicação de relatos do cotidiano, troca de mensagens diretas, debates temáticos em fóruns comunitários, localização de profissionais e serviços de apoio por região e participação em eventos inclusivos.</>
      },
      {
        q: "Q2: O uso da plataforma é gratuito?",
        a: <>Sim. O cadastro e o uso das funcionalidades voltadas aos membros — como criar perfil, publicar no feed, adicionar amigos, conversar por chat, participar de fóruns de apoio, consultar o catálogo de serviços e confirmar presença em eventos — são totalmente gratuitos mediante a vinculação de instituições de saúde ou com o Instituto Diversa 21.</>
      },
      {
        q: "Q3: Quais opções tenho para criar conta e fazer login?",
        a: <>Você pode se autenticar utilizando seu nome de usuário e senha cadastrados diretamente na plataforma.</>
      },
      {
        q: "Q4: O que é a verificação anti-robô que vejo na tela de login?",
        a: <>Para proteger a comunidade contra acessos automatizados e ataques de spam sem criar barreiras difíceis de acessibilidade, o Diversa21 utiliza o <strong>Altcha</strong>. Diferente dos testes tradicionais (que exigem reconhecer letras distorcidas ou selecionar imagens em quebra-cabeças visuais complexos), o Altcha realiza uma validação automática e silenciosa em segundo plano, respeitando a privacidade e a usabilidade de pessoas com diferentes níveis de habilidade digital.</>
      },
      {
        q: "Q5: O que devo fazer caso esqueça a minha senha?",
        a: <>Na tela de login, clique no link <em>"Esqueceu-se da palavra passe?"</em>. Uma janela será aberta solicitando o e-mail cadastrado na sua conta. O sistema enviará automaticamente uma mensagem com um link seguro e temporário para que você possa redefinir sua senha com facilidade.</>
      }
    ]
  },
  {
    title: "2. Perfil, Conexões e Amizades",
    faqs: [
      {
        q: "Q6: O que posso personalizar no meu perfil?",
        a: (
          <>
            Ao acessar a área <em>"Meu perfil"</em>, você pode:
            <ul className="faq-accordion__list">
              <li className="faq-accordion__list-item">Personalizar sua foto de perfil (avatar) e imagem de capa;</li>
              <li className="faq-accordion__list-item">Informar seus dados gerais, biografia e interesses;</li>
              <li className="faq-accordion__list-item">Visualizar suas postagens realizadas;</li>
              <li className="faq-accordion__list-item">Acessar sua galeria com fotos compartilhadas em publicações;</li>
              <li className="faq-accordion__list-item">Acompanhar a aba de atividades recentes e consultar sua lista de amigos conectados.</li>
            </ul>
          </>
        )
      },
      {
        q: "Q7: Como encontro outras pessoas e me conecto com elas?",
        a: <>No menu lateral, acesse a seção <em>"Pessoas"</em> para visualizar os membros da rede. Você pode buscar pessoas pelo nome e enviar um pedido de amizade. Quando a outra pessoa aceitar a solicitação, ela aparecerá na sua lista de <em>"Amigos"</em>, habilitando a troca de mensagens diretas e notificações de novas publicações.</>
      }
    ]
  },
  {
    title: "3. Feed Social e Interações",
    faqs: [
      {
        q: "Q8: O que posso publicar na página de Postagens?",
        a: <>Na seção <em>"Postagens"</em>, você pode escrever textos sobre o seu dia a dia, conquistas ou dúvidas e anexar imagens. As publicações ficam visíveis na linha do tempo para a comunidade e também são exibidas na aba de posts do seu perfil pessoal.</>
      },
      {
        q: "Q9: Posso editar ou apagar uma postagem que já fiz?",
        a: <>Sim. Nas postagens de sua própria autoria, você tem acesso ao menu de opções da publicação para editar o texto ou excluí-la definitivamente a qualquer momento.</>
      },
      {
        q: "Q10: Como posso interagir com as publicações de outras pessoas?",
        a: <>Você pode demonstrar apoio clicando no botão de <strong>Curtir</strong> e participar das conversas deixando comentários. A plataforma suporta respostas encadeadas (comentários em árvore), permitindo responder diretamente ao comentário de outro membro de forma organizada.</>
      }
    ]
  },
  {
    title: "4. Mensagens Privadas (Chat em Tempo Real)",
    faqs: [
      {
        q: "Q11: Como funciona o envio de mensagens privadas?",
        a: <>Na seção <em>"Mensagens"</em>, você encontra um chat em tempo real alimentado por WebSockets. A comunicação é rápida e síncrona: você pode visualizar quando as mensagens foram entregues e lidas, garantindo uma conversa fluida e confortável.</>
      },
      {
        q: "Q12: Qualquer pessoa da rede pode me enviar mensagens diretas?",
        a: <>Não. Para assegurar a integridade e evitar abordagens indesejadas, a troca de mensagens privadas ocorre exclusivamente entre usuários que possuem conexão mútua de amizade confirmada. Ao clicar em <em>"Nova conversa"</em>, o sistema lista os contatos da sua lista de amigos.</>
      },
      {
        q: "Q13: Posso editar, excluir ou reagir às mensagens no chat?",
        a: <>Sim. O chat do Diversa21 permite que você adicione reações com emojis às mensagens recebidas para expressar sentimentos de forma visual, além de possibilitar a edição ou exclusão lógica de mensagens enviadas por você.</>
      }
    ]
  },
  {
    title: "5. Rede de Apoio (Fóruns Comunitários)",
    faqs: [
      {
        q: "Q14: O que é a \"Rede de Apoio\" e como ela está organizada?",
        a: <>A Rede de Apoio é o fórum de discussões do Diversa21, organizado em categorias temáticas (como desenvolvimento, saúde, rotina, convivência e direitos). Dentro de cada categoria, os membros podem criar tópicos de discussão ou responder a perguntas existentes, com contadores de respostas, última atividade e opção de curtir respostas úteis.</>
      },
      {
        q: "Q15: É possível postar ou responder de forma anônima no fórum?",
        a: <>Sim. Ao redigir um novo tópico ou resposta na Rede de Apoio, você pode marcar a opção <em>"Modo Anônimo"</em>. Quando essa opção está ativa, seu nome, avatar e dados de identificação pública não são exibidos aos demais usuários na interface. Esse recurso garante total discrição para que familiares e membros compartilhem momentos delicados, dúvidas médicas ou desabafos sem medo de exposição indesejada.</>
      }
    ]
  },
  {
    title: "6. Serviços Especializados e Instituições",
    faqs: [
      {
        q: "Q16: Como encontro profissionais e serviços especializados de saúde ou educação?",
        a: (
          <>
            Na seção <em>"Serviços"</em>, você tem acesso a um catálogo estruturado por áreas de atuação (como Fonoaudiologia, Terapia Ocupacional, Fisioterapia, Apoio Pedagógico, etc.). Você pode:
            <ul className="faq-accordion__list">
              <li className="faq-accordion__list-item">Filtrar serviços por <strong>Localização</strong> (selecionando País, Estado e Cidade);</li>
              <li className="faq-accordion__list-item">Filtrar por categorias de especialidade;</li>
              <li className="faq-accordion__list-item">Pesquisar por palavras-chave;</li>
              <li className="faq-accordion__list-item">Abrir os detalhes do serviço para consultar telefone, e-mail, website, perfil no Instagram e endereço.</li>
            </ul>
          </>
        )
      },
      {
        q: "Q17: Como funciona o recurso de favoritar serviços?",
        a: <>No card de qualquer serviço, você pode clicar no ícone de marcador/favorito para salvá-lo. Na tela de Serviços, basta ativar o filtro de favoritos para exibir instantaneamente a sua lista personalizada de profissionais e clínicas de referência.</>
      },
      {
        q: "Q18: Qualquer usuário pode cadastrar um novo serviço na plataforma?",
        a: <>Não. No estágio atual do sistema, o cadastro e a edição de serviços no catálogo público são restritos à equipe de gestão e moderação da plataforma. Essa regra existe para assegurar a curadoria, a autenticidade e a segurança das referências profissionais disponibilizadas à comunidade.</>
      },
      {
        q: "Q19: O que encontro na seção de \"Instituições\"?",
        a: <>A área de <em>"Instituições"</em> apresenta uma listagem de entidades sem fins lucrativos, associações de apoio à Trissomia 21 e instituições de saúde, com informações de contato institucional, canais de atendimento à comunidade.</>
      }
    ]
  },
  {
    title: "7. Eventos Inclusivos",
    faqs: [
      {
        q: "Q20: Como descubro eventos e confirmo minha presença?",
        a: <>Na seção <em>"Eventos"</em>, você encontra uma agenda de encontros, palestras, oficinas e atividades culturais/esportivas. Em cada evento, você pode visualizar data, horário, modalidade (presencial ou online), endereço, detalhes e clicar em <em>"Confirmar Presença"</em> (<em>"Vou"</em> ou <em>"Não vou"</em>).</>
      },
      {
        q: "Q21: Onde posso consultar os eventos em que já me inscrevi?",
        a: (
          <>
            Na própria página de Eventos, você dispõe de três abas organizadoras:
            <ol className="faq-accordion__list faq-accordion__list--numbered">
              <li className="faq-accordion__list-item"><strong>Geral</strong>: Todos os eventos disponíveis na rede;</li>
              <li className="faq-accordion__list-item"><strong>Participação</strong>: Eventos futuros em que você confirmou presença;</li>
              <li className="faq-accordion__list-item"><strong>Histórico</strong>: Eventos passados em que você participou.</li>
            </ol>
          </>
        )
      },
      {
        q: "Q22: Quem tem permissão para criar novos eventos na plataforma?",
        a: <>Assim como no catálogo de serviços, a criação e gestão de eventos na agenda pública do sistema é restrita aos perfis com privilégios de gestão e administração, garantindo conformidade e veracidade dos eventos promovidos.</>
      }
    ]
  },
  {
    title: "8. Segurança, Moderação e Notificações",
    faqs: [
      {
        q: "Q23: O que devo fazer se encontrar conteúdo impróprio, ofensivo ou capacitista?",
        a: (
          <>
            <p>A plataforma possui um sistema integrado de denúncias para manter a comunidade protegida. Ao clicar no menu de opções (ícone de três pontos ou bandeira) presente em <strong>Postagens</strong>, <strong>Comentários</strong>, <strong>Tópicos do Fórum</strong>, <strong>Respostas</strong>, <strong>Perfis de Usuários</strong> ou <strong>Serviços</strong>, selecione a opção <em>"Denunciar"</em>.</p>
            <p>Você poderá selecionar o motivo correspondente e incluir uma breve descrição. A denúncia é enviada diretamente para a auditoria da equipe de moderação.</p>
          </>
        )
      },
      {
        q: "Q24: Como posso gerenciar os avisos e notificações que recebo?",
        a: (
          <>
            Ao acessar <em>"Configurações de Notificação"</em>, você tem controle granular sobre quais alertas deseja receber ou silenciar. É possível ativar ou desativar de forma independente notificações sobre:
            <ul className="faq-accordion__list">
              <li className="faq-accordion__list-item"><strong>Pedidos de amizade</strong> (novos pedidos e solicitações aceitas);</li>
              <li className="faq-accordion__list-item"><strong>Postagens</strong> (publicações de amigos e de instituições);</li>
              <li className="faq-accordion__list-item"><strong>Comentários</strong> (comentários em suas postagens e respostas em tópicos do fórum);</li>
              <li className="faq-accordion__list-item"><strong>Curtidas</strong> (curtidas em suas postagens e respostas);</li>
              <li className="faq-accordion__list-item"><strong>Mensagens</strong> (avisos de novas mensagens privadas no chat).</li>
            </ul>
          </>
        )
      },
      {
        q: "Q25: Onde posso consultar os Termos de Uso e a Política de Privacidade?",
        a: <>Links fixos para as páginas de <strong>Termos e Condições</strong> e <strong>Privacidade</strong> estão permanentemente disponíveis no rodapé de todas as telas da plataforma, detalhando o compromisso do Diversa21 com a segurança da informação e a proteção de dados pessoais.</>
      }
    ]
  }
];

function FAQAccordion({ sections = FAQ_SECTIONS }) {
  return (
    <div className="faq-accordion">
      {sections.map((section, idx) => (
        <div key={idx} className="faq-accordion__section">
          <Title level={4} className="faq-accordion__title">
            {section.title}
          </Title>
          <Collapse
            accordion
            bordered={false}
            items={section.faqs.map((faq, fIdx) => ({
              key: `${idx}-${fIdx}`,
              label: faq.q,
              children: <div className="faq-accordion__answer">{faq.a}</div>,
            }))}
          />
        </div>
      ))}
    </div>
  );
}

export default FAQAccordion;