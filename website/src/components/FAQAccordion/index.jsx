import React from 'react';
import { Collapse, Typography } from 'antd';
import './index.less';

const { Paragraph } = Typography;

const DEFAULT_FAQS = [
  {
    q: 'Como faço para publicar um serviço?',
    a: 'Atualmente apenas administradores podem criar categorias. Depois de criada a categoria, vamos adicionar a funcionalidade de criação de serviço na área reservada.'
  },
  {
    q: 'Como filtro serviços por localização?',
    a: 'Na página de serviços utilize o seletor de localização no topo para filtrar por país/estado/cidade.'
  },
  {
    q: 'Como contacto o autor do serviço?',
    a: 'Abra a modal do serviço e verá telefone, website e Instagram quando disponíveis.'
  }
];

function FAQAccordion({ items = DEFAULT_FAQS }) {
  const collapseItems = items.map((it, idx) => ({
    key: String(idx),
    label: it.q,
    children: <Paragraph>{it.a}</Paragraph>,
  }));

  return (
    <div className="faq-accordion">
      <Collapse accordion items={collapseItems} />
    </div>
  );
}

export default FAQAccordion;
