import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useParams } from "react-router-dom";
import { Typography, Layout, Button } from 'antd';

import _auth from '@netuno/auth-client';
import _service from '@netuno/service-client';

import ProfileForm from '../../components/ProfileForm';

const { Content, Sider } = Layout;
const { Title } = Typography;

import {
  FaGoogle, FaWindows, FaFacebook, FaDiscord, FaGithub
} from "react-icons/fa";

import Config from '../../common/Config';

import 'altcha';

export default function RegisterCreateUser(props) {
  const [altchaPayload, setAltchaPayload] = useState(null);
  const altcha = useRef(null);
  const { provider } = useParams(null);

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

  useEffect(() => {
    if (_auth.isLogged()) {
      window.scrollTo(0, 0);
    }
  }, []);

  if (_auth.isLogged()) {
    return <Navigate to="/profile/view" />;
  }

  return (
    <Layout>
      <Content className="register-container">
        <div className="content-title">
          <Title>Criar Conta</Title>
        </div>
        <div className="content-body">
          <p>Crie uma conta para poder aceder à sua área reservada.</p>
          <ProfileForm
            operation={"create"}
            people={null}
            redirectTo={"/login"}
            configProvider={<>
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
            </>}
            altchaPayload={altchaPayload}
            configAltcha={Config.authAltcha() &&
              <Form.Item>
                <altcha-widget
                  ref={altcha}
                  challengeurl={_service.url('/_altcha')}
                  delay={1}
                  hidelogo={true}
                  hidefooter={true}
                >
                </altcha-widget>
              </Form.Item>
            }
          />
        </div>
      </Content>
      <Sider width={'50%'}>
        <span className="helper" /><img alt="sider-register" src={"/images/sider-register.png"} />
      </Sider>
    </Layout>
  );
}
