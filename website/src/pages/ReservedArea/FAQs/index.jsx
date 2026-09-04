import React from 'react';
import { Typography, Card } from 'antd';
import FAQAccordion from '../../../components/FAQAccordion';
import './index.less';

function FAQs() {
  return (
    <div className="faqs-page">
      <div className="faqs-page__header">
        <Typography.Title level={2}>FAQS</Typography.Title>
      </div>
      <Card className="faqs-page__card">
        <FAQAccordion />
      </Card>
    </div>
  );
}

export default FAQs;
