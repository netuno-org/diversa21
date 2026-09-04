import _auth from "@netuno/auth-client";
import { Layout, Typography, Divider } from "antd";
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
      <div className="footer-base__container">
        <Text className="footer-base__text">
          © diversa21.org {currentYear}
        </Text>

        {!isLoginPage && (
          <>
            <Divider orientation="vertical" className="footer-base__divider" />
            <Link to="/terms" className="footer-base__link">
              Termos e Condições
            </Link>

            <Divider orientation="vertical" className="footer-base__divider" />
            <Link to="/privacy" className="footer-base__link">
              Privacidade
            </Link>

            <Divider orientation="vertical" className="footer-base__divider" />
            <Link to="/faqs" className="footer-base__link">
              FAQS
            </Link>
          </>
        )}

        <Divider orientation="vertical" className="footer-base__divider" />

        <AntLink
          href="https://github.com/netuno-org/diversa21"
          target="_blank"
          className="footer-base__link footer-base__github"
        >
          <GithubOutlined />
          <span>Open Source</span>
        </AntLink>
      </div>
    </Footer>
  );
}

export default FooterBase;