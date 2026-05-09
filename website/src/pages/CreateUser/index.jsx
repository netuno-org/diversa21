import React, { useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { Typography, Layout, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import CreateUserForm from '../../components/CreateUserForm';
import './index.less';

const { Content } = Layout;
const { Title } = Typography;

export default function CreateUser() {

  const navigate = useNavigate();

  return (
    <Layout>
      <Content>
        <div className="content-title">
          <Button className="go-back-btn" type="link" onClick={() => navigate(-1)}><ArrowLeftOutlined />Voltar atrás</Button>
          <Title>Criar Usuário</Title>
        </div>
        <div className="content-CreateUser">
          <CreateUserForm
            redirectTo={"/people"}
            configProvider={null}
            configAltcha={null}
            altchaPayload={null}
          />
        </div>
      </Content>
    </Layout>
  );
}
