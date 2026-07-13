import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from '@ant-design/icons';

import './index.less';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <Result
        title="404"
        subTitle="A página que procuras não foi encontrada."
        icon={
          // test
          <img
            src="/images/logo.png"
            alt="Página não encontrada"
            style={{ width: 250, margin: '0 auto' }}
          />
        }
        extra={
          <Button
            type="primary"
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/posts")}
          >
            Voltar para o início
          </Button>
        }
      />
    </div>
  );
}