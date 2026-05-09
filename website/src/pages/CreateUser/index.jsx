import React, { useState, useRef } from 'react';
import { Typography, Layout } from 'antd';

import CreateUserForm from '../../components/CreateUserForm';

const { Content } = Layout;
const { Title } = Typography;

export default function CreateUser() {

  return (
    <Layout>
      <Content>
        <div className="content-title">
          <Title>Criar Usuário</Title>
        </div>
        <div className="content-body">
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
