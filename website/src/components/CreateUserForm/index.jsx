import React, { useEffect } from 'react';
import { Form, Input, DatePicker, Button } from 'antd';
import { PasswordInput } from "antd-password-input-strength";
import _service from '@netuno/service-client';

import {
  FaGoogle, FaWindows, FaFacebook, FaDiscord, FaGithub
} from "react-icons/fa";

import Config from '../../common/Config';

import 'altcha';

function CreateUserForm({
  submitting,
  registerForm,
  onFinish,
  onFinishFailed,
  altcha,
  setAltchaPayload
}) {

  const servicePrefix = _service.config().prefix;

  useEffect(() => {
    if (Config.authAltcha() && altcha && altcha.current) {
      function altchaVerified(ev) {
        console.log('Altcha verified', ev.detail);
        if (ev.detail.state === "verified") {
          setAltchaPayload(ev.detail.payload);
        }
      }
      altcha.current.addEventListener("statechange", altchaVerified, false);
      return () => {
        console.log(ev.detail);
        if (altcha.current != null) {
          altcha.current.removeEventListener("statechange", altchaVerified, false);
        }
      }
    }
  }, []);

  return (
    <div>
      <Form
        ref={registerForm}
        layout="vertical"
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        {Config.authProviders().google &&
          <Form.Item>
            <Button href={`${servicePrefix}/_auth_provider/register/google`} icon={<FaGoogle />}>Registrar com o Google</Button>
          </Form.Item>}
        {Config.authProviders().microsoft &&
          <Form.Item>
            <Button href={`${servicePrefix}/_auth_provider/login/microsoft`} icon={<FaWindows />}>Entrar com o Microsoft</Button>
          </Form.Item>}
        {Config.authProviders().facebook &&
          <Form.Item>
            <Button href={`${servicePrefix}/_auth_provider/register/facebook`} icon={<FaFacebook />}>Registrar com o Facebook</Button>
          </Form.Item>}
        {Config.authProviders().github &&
          <Form.Item>
            <Button href={`${servicePrefix}/_auth_provider/register/github`} icon={<FaGithub />}>Registrar com o GitHub</Button>
          </Form.Item>}
        {Config.authProviders().discord &&
          <Form.Item>
            <Button href={`${servicePrefix}/_auth_provider/register/discord`} icon={<FaDiscord />}>Registrar com o Discord</Button>
          </Form.Item>}
        <Form.Item
          label="Nome"
          name="name"
          rules={[
            { required: true, message: 'Insira o seu nome.' },
            { type: 'string', message: 'Nome inválido, apenas letras minúsculas e maiúsculas.', pattern: "^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$" }
          ]}
        >
          <Input disabled={submitting} maxLength={250} />
        </Form.Item>
        <Form.Item
          label="Utilizador"
          name="username"
          rules={[
            { required: true, message: 'Insira o seu usuário.' },
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
        {Config.authAltcha() && <Form.Item>
          <altcha-widget
            ref={altcha}
            challengeurl={_service.url('/_altcha')}
            delay={1}
            hidelogo={true}
            hidefooter={true}
          ></altcha-widget>
        </Form.Item>}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Criar Conta
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default CreateUserForm;