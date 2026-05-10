import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Typography, Layout, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import ProfileForm from '../../components/ProfileForm';

import './index.less';

const { Content } = Layout;
const { Title } = Typography;

export default function CreateUser() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <Content>
        <div className="content-title">
          <Button className="go-back-btn" type="link" onClick={() => navigate(-1)}><ArrowLeftOutlined />Voltar atrás</Button>
        </div>
        <div className="content-CreateUser">
          <Title>Criar Usuário</Title>
        </div>
        <div className="content-body">
          <ProfileForm
            operation={"create"}
            people={null} 
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
