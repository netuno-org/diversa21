import React from 'react';
import { Typography, Card } from 'antd';
import FAQAccordion from '../../../components/FAQAccordion';
import './index.less';

const { Title, Text } = Typography;

function FAQs() {
  return (
    <div className="faqs-page">
      <div className="faqs-page__header">
        <Title level={2} className="faqs-page__title">FAQs</Title>
        <Text type="secondary">
          Encontre aqui as respostas para as perguntas mais frequentes sobre a plataforma.
        </Text>
      </div>
      <Card className="faqs-page__card" bordered={false}>
        <FAQAccordion />
      </Card>
    </div>
  );
}

export default FAQs;