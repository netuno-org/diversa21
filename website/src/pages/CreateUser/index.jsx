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

export default function CreateUser() {
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [altchaPayload, setAltchaPayload] = useState(null);
  const registerForm = useRef(null);
  const altcha = useRef(null);
  const [api, contextHolder] = notification.useNotification();
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityOptions, setCityOptions] = useState([])


  useEffect(() => {
    if (_auth.isLogged()) {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleCitySearch = value => {
    _service({
      url: `location/city/search?name=${value}`,
      success: (response) => {
        const options = response.json.data.map(city => ({
          value: city.label,
          label: city.label,
          uid: city.uid,
        }))
        setCityOptions(options);
      },
      fail: () => {
        setCityOptions([]);
      }
    })
  };

  const handleCityChange = (value, option) => {
    setSelectedCity(option);
  };

  const handleCityClear = () => {
    setCityOptions([]);
    setSelectedCity('');
  }

  function onFinish(values) {
    setSubmitting(true);
    const { name, username, password, email, birthDate, city } = values;
    _service({
      method: 'POST',
      url: 'people',
      data: {
        name,
        username,
        password,
        email,
        birthDate: birthDate?.format('YYYY-MM-DD') ?? '',
        city: selectedCity.uid,
        // TODO: usuário selecionar a instituição
        institution: 'fbe8724d-1184-49f6-a700-c06ce3f8a338',
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
  if (ready) {
    return <Navigate to="/people" />;
  }
  return (
    <Layout>
      <Content className="register-container">
        {contextHolder}
        <div className="content-title">
          <Title>Criar conta.</Title>
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
            selectedCity={selectedCity}
            cityOptions={cityOptions}
            onCityClear={handleCityClear}
            onCityChange={handleCityChange}
            onCitySearch={handleCitySearch}
          />
        </div>
      </Content>
    </Layout>
  );
}
