import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from "react-router-dom";
import { Form, Input, DatePicker, Button, Select, notification } from 'antd';
import { PasswordInput } from "antd-password-input-strength";
import _service from '@netuno/service-client';

import isNetworkError from "is-network-error";

function CreateUserForm({
  redirectTo,
  configProvider,
  configAltcha,
  altchaPayload
}) {

  const userForm = useRef(null);
  const [api, contextHolder] = notification.useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityOptions, setCityOptions] = useState([])
  const [ready, setReady] = useState(false);

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
    const { name, username, password, email, birthDate } = values;
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
        ...(configAltcha && { altcha: altchaPayload })
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
    return <Navigate to={redirectTo} />;
  }

  return (
    <div>
      {contextHolder}
      <Form
        ref={userForm}
        layout="vertical"
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        {configProvider}
        <Form.Item
          label="Nome"
          name="name"
          rules={[
            { required: true, message: 'Insira o nome.' },
            { type: 'string', message: 'Nome inválido, apenas letras minúsculas e maiúsculas.', pattern: "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$" }
          ]}
        >
          <Input disabled={submitting} maxLength={250} />
        </Form.Item>
        <Form.Item
          label="Utilizador"
          name="username"
          rules={[
            { required: true, message: 'Insira o usuário.' },
            { type: 'string', message: 'Usuário inválido, apenas letras minúsculas e maiúsculas.', pattern: "^[a-z]+[a-z0-9]{1,24}$" }
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
          label="Data de Nascimento"
          name="birthDate"
          rules={[
            { type: 'date', message: 'A data inserida não é válida.' },
            { required: true, message: 'Insira a data de nascimento.' }
          ]}
        >
          <DatePicker placeholder="DD/MM/AAAA" format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item
          label="Cidade"
          name="city"
          rules={[
            { type: 'city', message: 'A cidade inserida não é válida.' },
            { required: true, message: 'Insira a cidade.' }
          ]}
        >
          <Select
            showSearch
            notFoundContent={null}
            filterOption={false}
            placeholder="Cidade"
            options={cityOptions}
            allowClear
            onClear={handleCityClear}
            onChange={handleCityChange}
            onSearch={handleCitySearch}
          />
        </Form.Item>
        <Form.Item
          label="Palavra-passe"
          name="password"
          rules={[
            { required: true, message: 'Insira a palavra-passe.' },
            { type: 'string', message: 'Palavra-Passe deverá ter entre 8 a 25 caracteres.', min: 8, max: 25 },
          ]}
        >
          <PasswordInput disabled={submitting} maxLength={25} />
        </Form.Item>
        <Form.Item
          label="Confirmar a Palavra-passe"
          name="password_confirm"
          rules={[
            { required: true, message: 'Insira a confirmação da palavra-passe.' },
            { type: 'string', message: 'Palavra-Passe deverá ter entre 8 a 25 caracteres.', min: 8, max: 25 },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('As palavras-passes não são iguais.');
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
        {configAltcha}
    </Form>
    </div>
  );
}

export default CreateUserForm;
