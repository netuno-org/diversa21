import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Typography, Form, Input, DatePicker, Button, Divider } from 'antd';
import { PasswordInput } from "antd-password-input-strength";
import dayjs from 'dayjs';

import _service from '@netuno/service-client';

import globalNotification from "../../../../common/globalNotification.js";

import usePeople from "../../../../common/usePeople.js";

import Avatar from './Avatar';

const { Title } = Typography;

function ProfileEdit() {
  const [submitting, setSubmitting] = useState(false);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [avatarImageURL, setAvatarImageURL] = useState('/images/profile-default.png');
  const profileAvatar = useRef(null);
  const profileForm = useRef(null);
  const navigate = useNavigate();

  const people = usePeople();

  const layout = {
    wrapperCol: { xs: { span: 24 }, sm: { span: 24 }, md: { span: 24 }, lg: { span: 12 } }
  };

  useEffect(() => {
    if (people.data.avatar) {
      setAvatarImageURL(_service.url(`/people/avatar?uid=${people.data.uid}`));
    }
  }, []);

  function onFinish(values) {
    setSubmitting(true);
    const { name, username, password, email, birthDate, city, state, country } = values;
    _service({
      method: 'PUT',
      url: 'people',
      data: {
        name,
        username,
        password,
        email,
        avatar: profileAvatar?.current?.getImage(),
        birthDate: birthDate?.format('YYYY-MM-DD') ?? '',
        city,
        state,
        country
      },
      success: (response) => {
        if (response.json.result) {
          globalNotification.success({
            message: 'Edição do Perfil',
            description: 'Os dados do seu perfil foram alterados com sucesso.',
          });
          setSubmitting(false);
          profileForm.current.setFieldsValue({
            password: "",
            password_confirm: ""
          });
          people.reload();
        } else {
          globalNotification.warning({
            message: 'Utilizador existente',
            description: response.json.error,
          });
          setSubmitting(false);
          profileForm.current.setFieldsValue({
            password: "",
            password_confirm: ""
          });
        }
      },
      fail: () => {
        setSubmitting(false);
        globalNotification.serviceFail({
          message: 'Erro na Edição do Perfil',
          description: 'Ocorreu um erro na edição do seu perfil, por favor contacte-nos através do chat de suporte.',
        });
      }
    });
  }

  function onValuesChange(changedValues, allValues) {
    if (allValues.password && allValues.password.length > 0) {
      setPasswordRequired(true);
    } else {
      setPasswordRequired(false);
    }
  }

  function onFinishFailed(errorInfo) {
    console.log('Failed:', errorInfo);
  }

  return (
    <div>
      <div className="content-title">
        <Button className="go-back-btn" type="link" onClick={() => navigate(-1)}><ArrowLeftOutlined /> Voltar atrás</Button>
      </div>
      <div className="content-title">
        <Title level={2}>Editar Perfil</Title>
      </div>
      <div className="content-body">
        <Avatar ref={profileAvatar} currentImage={avatarImageURL}/>
        <Divider orientation="left" plain>Informações Gerais</Divider>
        <Form
          {...layout}
          onValuesChange={onValuesChange}
          ref={profileForm}
          layout="vertical"
          name="basic"
          initialValues={{
            name: people.data.name,
            username: people.data.username,
            email: people.data.email,
            birthDate: dayjs(people.data.birthDate),
            city: people.data.city,
            state: people.data.state,
            country: people.data.country,
          }}
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
            label="Nome de utilizador"
            name="username"
            rules={[
              { required: true, message: 'Insira o seu nome.' },
              { type: 'string', message: 'Nome inválido, apenas letras minúsculas e maiúsculas.', pattern: "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$" }
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
              { required: true, message: 'Insira a sua data de nascimento.' }
            ]}
          >
            <DatePicker placeholder="DD/MM/AAAA" format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item
            label="Cidade"
            name="city"
            rules={[
              { type: 'city', message: 'A cidade inserida não é válida.' },
              { required: true, message: 'Insira a sua cidade.' }
            ]}
          >
            <Input disabled={submitting} maxLength={250} />
          </Form.Item>
          <Form.Item
            label="Estado"
            name="state"
            rules={[
              { type: 'state', message: 'O estado inserido não é válido.' },
              { required: true, message: 'Insira o seu estado.' }
            ]}
          >
            <Input disabled={submitting} maxLength={250} />
          </Form.Item>
          <Form.Item
            label="País"
            name="country"
            rules={[
              { type: 'country', message: 'O país inserido não é válido.' },
              { required: true, message: 'Insira o seu país.' }
            ]}
          >
            <Input disabled={submitting} maxLength={250} />
          </Form.Item>
          <Form.Item
            label="Nova Palavra-passe"
            name="password"
            rules={[
              { type: 'string', message: 'Palavra-Passe deverá ter entre 8 a 25 caracteres.', min: 8, max: 25 },
            ]}
          >
            <PasswordInput />
          </Form.Item>
          <Form.Item
            label="Confirmar nova Palavra-passe"
            name="password_confirm"
            rules={[
              { required: passwordRequired, message: 'Insira a confirmação da nova palavra-passe.' },
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
            <Input.Password maxLength={25} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Atualizar Perfil
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default ProfileEdit;
