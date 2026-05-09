import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useParams } from "react-router-dom";
import { Layout, Typography, notification } from 'antd';
import _auth from '@netuno/auth-client';
import _service from '@netuno/service-client';

import Config from '../../common/Config';
import CreateUserForm from '../../components/CreateUserForm';

import isNetworkError from "is-network-error";

const { Title } = Typography;
const { Content, Sider } = Layout;

import 'altcha';

export default function RegisterCreateUser(props) {
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [altchaPayload, setAltchaPayload] = useState(null);
  const registerForm = useRef(null);
  const altcha = useRef(null);
  const { provider } = useParams(null);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (_auth.isLogged()) {
      window.scrollTo(0, 0);
    }
  }, []);

  function onFinish(values) {
    setSubmitting(true);
    const { name, username, password, email, birthDate, city, state, country } = values;
    _service({
      method: 'POST',
      url: 'people',
      data: {
        name,
        username,
        password,
        email,
        birthDate: birthDate?.format('YYYY-MM-DD') ?? '',
        city,
        state,
        country,
        ...(Config.authAltcha() && { altcha: altchaPayload })
      },
      success: (response) => {
        if (response.json.result) {
          api.success({
            message: 'Conta Criada',
            description: 'A conta foi criada com sucesso, pode iniciar sessão.',
          });
          setSubmitting(false);
          setReady(true);
        }
      },
      fail: (e) => {
        setSubmitting(false);
        if (e.error && isNetworkError(e.error)) {
          return api.error({
            message: 'Conexão',
            description:
              'Há problemas de conexão com o servidor, tente novamente mais tarde.',
          });
        }
        if (e && e.status === 409 && e.json && e.json.error) {
          if (e.json.error === 'email-already-exists') {
            return api.warning({
              message: 'E-mail Existente',
              description: 'Este e-mail já existe, faça a recuperação do acesso no ecrã de login ou escolha outro.',
            });
          }
          if (e.json.error === 'user-already-exists') {
            return api.warning({
              message: 'Utilizador Existente',
              description: 'Este utilizador já existe, faça a recuperação do acesso no ecrã de login ou escolha outro.',
            });
          }
        }
        return api.error({
          message: 'Erro na Criação de Conta',
          description: 'Não foi possível criar a conta, contacte-nos através do chat de suporte.',
        });
      }
    });
  }

  function onFinishFailed(errorInfo) {
    console.log('Failed:', errorInfo);
  }
  if (_auth.isLogged()) {
    return <Navigate to="/profile/view" />;
  }
  if (ready) {
    return <Navigate to="/login" />;
  }
  return (
    <Layout>
      <Content className="register-container">
        {contextHolder}
        <div className="content-title">
          <Title>Criar Conta</Title>
        </div>
        <div className="content-body">
          <p>Crie uma conta para poder aceder à sua área reservada.</p>
          <CreateUserForm
            submitting={submitting}
            registerForm={registerForm}
            onFinish={onFinish}
            onSubmitFailed={onFinishFailed}
            altcha={altcha}
            setAltchaPayload={setAltchaPayload}
          />
        </div>
      </Content>
      <Sider width={'50%'}>
        <span className="helper" /><img alt="sider-register" src={"/images/sider-register.png"} />
      </Sider>
    </Layout>
  );
}
