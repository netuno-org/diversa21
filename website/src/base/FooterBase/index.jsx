import _auth from "@netuno/auth-client";
import { Layout, Typography, Space, Divider } from "antd";
import { GithubOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

import './index.less';

const { Footer } = Layout;
const { Text, Link: AntLink } = Typography; 

function FooterBase() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  
  const isLoginPage = location.pathname === '/login';

  return (
    <Footer className="footer-base">
      <Space separator={<Divider orientation="vertical" className="footer-base__divider" />}>

        <Text className="footer-base__text">
          © diversa21.org {currentYear}
        </Text>

        {!isLoginPage && (
          <>
            <Link to="/terms" className="footer-base__link">
              Termos e Condições
            </Link>

            <Link to="/privacy" className="footer-base__link">
              Privacidade
            </Link>
          </>
        )}

        <AntLink
          href="https://github.com/netuno-org/diversa21"
          target="_blank"
          className="footer-base__link"
        >
          <Space size={6}>
            <GithubOutlined />
            <span>Open Source</span>
          </Space>
        </AntLink>

      </Space>
    </Footer>
  );
}

export default FooterBase;