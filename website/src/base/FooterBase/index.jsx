import _auth from "@netuno/auth-client";
import { Layout, Typography, Space, Divider } from "antd";
import { GithubOutlined } from '@ant-design/icons';

import './index.less';

const { Footer } = Layout;
const { Link, Text } = Typography;

function FooterBase() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {!_auth.isLogged() && (
        <Footer className="footer-base">
          <Space separator={<Divider orientation="vertical" className="footer-base__divider" />}>

            <Text className="footer-base__text">
              © diversa21.org {currentYear}
            </Text>

            <Link
              href="https://github.com/netuno-org/diversa21"
              target="_blank"
              className="footer-base__link"
            >
              <Space size={6}>
                <GithubOutlined />
                <span>Open Source</span>
              </Space>
            </Link>

          </Space>
        </Footer>
      )}
    </>
  );
}

export default FooterBase;