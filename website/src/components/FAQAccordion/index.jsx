import React from 'react';
import { Collapse, Typography } from 'antd';
import './index.less';

const { Paragraph } = Typography;

const DEFAULT_FAQS = [
  {
    q: 'Como faço para publicar um serviço?',
    a: 'Atualmente apenas administradores podem criar Serviços. '
  },
  {
    q: 'Como filtro serviços por localização?',
    a: 'Na página de serviços utilize o seletor de localização no topo para filtrar por país/estado/cidade.'
  },
  {
    q: 'Como contacto o autor do serviço?',
    a: 'Abra a modal do serviço e verá telefone, website e Instagram quando disponíveis.'
  },
  {
    q: 'Onde posso consultar os eventos em que me inscrevi?',
    a: 'Na página de Eventos, basta selecionar a aba "Participação" para ver a lista de todos os eventos futuros onde confirmou a sua presença. Os eventos passados ficam guardados na aba "Histórico".'
  },
  {
    q: 'O que devo fazer se encontrar conteúdo inadequado?',
    a: 'O nosso objetivo é manter a plataforma um espaço seguro. Utilize a funcionalidade de denúncia (ícone de opções) disponível em serviços, eventos ou publicações para que a nossa equipa de gestão possa analisar a situação.'
  },
  {
    q: 'Como funciona o Fórum / Rede de Apoio?',
    a: 'É um espaço seguro para partilhar experiências e esclarecer dúvidas. Pode criar novos tópicos dentro das categorias disponíveis ou responder e interagir com as publicações de outros utilizadores.'
  },
  {
    q: 'A utilização da plataforma tem algum custo?',
    a: 'Não. O registo e a utilização das funcionalidades base da Diversa21, como interagir no fórum, procurar serviços ou confirmar presença em eventos, são totalmente gratuitos.'
  }
];

function FAQAccordion({ items = DEFAULT_FAQS }) {
  const collapseItems = items.map((it, idx) => ({
    key: String(idx),
    label: it.q,
    children: <Paragraph className="faq-accordion__answer">{it.a}</Paragraph>,
  }));

  return (
    <div className="faq-accordion">
      <Collapse accordion items={collapseItems} bordered={false} />
    </div>
  );
}

export default FAQAccordion;