import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Typography, Layout, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import ProfileForm from '../../components/ProfileForm';

const { Content } = Layout;

export default function CreateUser() {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <Content>
        <ProfileForm
          textTitle="Criar Usuário"
          textTitle2="Informações gerais"
          operation={"create"}
          people={null} 
          redirectTo={"/people"}
        />
      </Content>
    </Layout>
  );
}
