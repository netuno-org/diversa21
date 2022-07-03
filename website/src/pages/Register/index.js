import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from "react-router-dom";
import { Layout, Typography, Form, Input, Button, notification } from 'antd';
import { PasswordInput } from "antd-password-input-strength";
import _auth from '@netuno/auth-client';
import _service from '@netuno/service-client';

import './index.less';

const { Title } = Typography;
const { Content, Sider } = Layout;

export default function Register(props) {

  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const registerForm = useRef(null);

  useEffect(() => {
    if (_auth.isLogged()) {
      window.scrollTo(0, 0);
    }
    window.scrollTo(0, 0);
  });

  function onFinish(values) {
    setSubmitting(true);
    const { username, password, email, name } = values;
    _service({
      method: 'POST',
      url: 'people',
      data: {
        name,
        username,
        password,
        email
      },
      success: (response) => {
        if (response.json.result) {
          notification["success"]({
            message: 'Conta Criada',
            description: 'A conta foi criada com sucesso, pode iniciar sessão.',
          });
          setSubmitting(false);
          setReady(true);
        }
      },
      fail: (e) => {
        setSubmitting(false);
        if (e && e.status == 409 && e.json && e.json.error) {
          if (e.json.error == 'email-already-exists') {
            return notification["warning"]({
              message: 'E-mail Existente',
              description: 'Este e-mail já existe, faça a recuperação do acesso na tela de login ou escolha outro.',
            });
          }
          if (e.json.error == 'user-already-exists') {
            return notification["warning"]({
              message: 'Usuário Existente',
              description: 'Este usuário já existe, faça a recuperação do acesso na tela de login ou escolha outro.',
            });
          }
        }
        return notification["error"]({
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
    return <Navigate to="/reserved-area" />;
  }
  else if (ready) {
    return <Navigate to="/login" />;
  } else {
    return (
      <Layout>
        <Content className="register-container">
          <div className="content-title">
            <Title>Criar conta.</Title>
          </div>
          <div className="content-body">
            <p>Crie uma conta para poder aceder à sua área reservada.</p>
            <Form
              ref={registerForm}
              layout="vertical"
              name="basic"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                label="Nome"
                name="name"
                rules={[
                  { required: true, message: 'Insira o seu nome.' },
                  { type: 'string', message: 'Nome inválido, apenas letras minúsculas e maiúsculas.', pattern: "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$" }
                ]}
              >
                <Input disabled={submitting} maxLength={25} />
              </Form.Item>
              <Form.Item
                label="Usuário"
                name="username"
                rules={[
                  { required: true, message: 'Insira o seu usuário.' },
                  { type: 'string', message: 'Usuário inválido, apenas letras minúsculas e números.', pattern: '^[a-z0-9]{1,25}$' }
                ]}
              >
                <Input disabled={submitting} maxLength={25} />
              </Form.Item>
              <Form.Item
                label="E-mail"
                name="email"
                rules={[
                  { type: 'email', message: 'O e-mail inserido não é válido.' },
                  { required: true, message: 'Insira o e-mail.' }
                ]}
              >
                <Input disabled={submitting} maxLength={250} />
              </Form.Item>
              <Form.Item
                label="Senha"
                name="password"
                rules={[
                  { required: true, message: 'Insira a senha.' },
                  { type: 'string', message: 'A senha deve ter entre 8 a 25 caracteres.', min: 8, max: 25 },
                ]}
              >
                <PasswordInput disabled={submitting} maxLength={25} />
              </Form.Item>
              <Form.Item
                label="Confirmar a Palavra-passe"
                name="password_confirm"
                rules={[
                  { required: true, message: 'Insira a confirmação da senha.' },
                  { type: 'string', message: 'A senha deve ter entre 8 a 25 caracteres.', min: 8, max: 25 },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject('As senhas não são iguais.');
                    },
                  })
                ]}
              >
                <Input.Password disabled={submitting} maxLength={25} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Criar Conta
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Content>
        <Sider width={'50%'}>
          <span className="helper" /><img alt="sider-register" src={"/images/sider-register.png"} />
        </Sider>
      </Layout>
    );
  }
}
