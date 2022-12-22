import React, { useEffect, useState } from "react";
import {
  Routes as Switch,
  Route,
  useLocation,
  useNavigate,
  Link,
  Navigate,
} from "react-router-dom";
import { ConfigProvider, Layout, Menu, Button, Row, Col } from "antd";
import {
  PlusCircleOutlined,
  DeploymentUnitOutlined,
  LogoutOutlined,
  MenuOutlined,
  EditOutlined,
} from "@ant-design/icons";
import antLocale_ptPT from "antd/lib/locale/pt_PT";
import { Provider } from "react-redux";

import classNames from "classnames";

import _auth from "@netuno/auth-client";
import { FiInstagram } from "react-icons/fi";

import momentjs from "moment";

import "./common/Config";

import { Store } from "./redux/store";

import HeaderUserInfo from "./components/HeaderUserInfo";

import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import ReservedArea from "./pages/ReservedArea";
import Posts from "./pages/Posts";
import RecoveryPage from "./pages/Recovery";
import Profile from "./pages/Profile";
import NotFoundPage from "./pages/NotFound";

import "moment/locale/pt-br";

import "./styles/App.less";

momentjs.locale("pt-br");

const { Header, Content, Sider, Footer } = Layout;
const { SubMenu } = Menu;

const NavWithAuthCheck = () => {
  if (_auth.isLogged()) {
    return <Navigate to="/reserved-area" />;
  } else {
    return <Navigate to="/login" />;
  }
};

export default function App(props) {
  const location = useLocation();
  const navigate = useNavigate();

  const [headerButtonMode, setHeaderButtonMode] = useState("login");
  const [collapsed, setCollapsed] = useState(false);
  const [sideMenuMobileMode, setSideMenuMobileMode] = useState(false);

  useEffect(() => {
    _auth.config({
      onLogout: () => {
        navigate("/login");
      },
    });
  }, []);

  useEffect(() => {
    setHeaderButtonMode(location.pathname);
  }, [location]);

  function onLogout() {
    _auth.logout();
  }

  function onCollapse() {
    setCollapsed(!collapsed);
  }

  return (
    <ConfigProvider locale={antLocale_ptPT}>
      <Provider store={Store}>
        <Layout
          className={
            "page " +
            classNames({ "auth ": _auth.isLogged() }) +
            classNames({ "collapsed ": collapsed })
          }
        >
          {_auth.isLogged() && (
            <Sider
              onBreakpoint={(mobile) => {
                setSideMenuMobileMode(mobile);
              }}
              collapsedWidth={sideMenuMobileMode ? "0" : "80"}
              breakpoint={"md"}
              collapsible
              collapsed={collapsed}
              onCollapse={onCollapse}
              trigger={<MenuOutlined />}
              theme="light"
            >
              <div className="logo-container">
                <img alt="logo" src="/images/logo.svg" />
              </div>
              <Menu defaultSelectedKeys={["1"]} mode="inline">
                <Menu.Item key="1" icon={<DeploymentUnitOutlined />}>
                  <Link to="/reserved-area">Principal</Link>
                </Menu.Item>
                <Menu.Item key="2" icon={<PlusCircleOutlined />}>
                  <Link to="/posts">Posts</Link>
                </Menu.Item>
              </Menu>
            </Sider>
          )}
          <Layout>
            <Header
              className={
                classNames({ "auth ": _auth.isLogged() }) +
                classNames({ "collapsed ": collapsed })
              }
            >
              {!_auth.isLogged() && (
                <Link to="/" className="logo-container">
                  <img alt="logo" src="/images/logo.svg" />
                </Link>
              )}
              <Menu mode="horizontal">
                {headerButtonMode === "/login" ? (
                  <Link to="/register">
                    <Button type="primary">Criar conta</Button>
                  </Link>
                ) : headerButtonMode === "/register" ? (
                  <Link to="/login">
                    <Button type="primary">Iniciar sessão</Button>
                  </Link>
                ) : (
                  _auth.isLogged() && (
                    <>
                      <SubMenu
                        key={"profile"}
                        className="profile-menu"
                        popupClassName="profile-menu-popup"
                        title={<HeaderUserInfo />}
                      >
                        <Menu.Item key="1">
                          <Link to="/profile">
                            <EditOutlined />
                            &nbsp;&nbsp;&nbsp;Editar Perfil
                          </Link>
                        </Menu.Item>
                        <Menu.Item key="2">
                          <Button type="link" onClick={onLogout} danger>
                            <LogoutOutlined /> Terminar Sessão
                          </Button>
                        </Menu.Item>
                      </SubMenu>
                    </>
                  )
                )}
              </Menu>
            </Header>
            <Content className={classNames({ "auth ": _auth.isLogged() })}>
              <Switch>
                <Route exact path="/" element={<NavWithAuthCheck />} />
                <Route path="/reserved-area" element={<ReservedArea />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/recovery" element={<RecoveryPage />} />
                <Route element={<NotFoundPage />} />
              </Switch>
            </Content>
            <Footer>
              <Row align="middle">
                <Col className="info-copyright" span={12}>© diversa21.org {new Date().getFullYear()}</Col>
                <Col className="social-icons" span={12} >
                  <a
                    target="_blank"
                    href="https://www.instagram.com/institutodiversa21/"
                  >
                    <FiInstagram />
                  </a>
                </Col>
              </Row>
            </Footer>
          </Layout>
        </Layout>
      </Provider>
    </ConfigProvider>
  );
}
