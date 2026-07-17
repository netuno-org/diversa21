import classNames from "classnames";
import _auth from "@netuno/auth-client";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Grid } from "antd";

import { EditOutlined, SettingOutlined } from "@ant-design/icons";
import { MdLogout } from "react-icons/md";
import React, { useEffect, useState } from "react";

import HeaderUserInfo from "../../components/HeaderUserInfo";
import HeaderNotifications from "../../components/HeaderNotifcations";
import HeaderMessages from "../../components/HeaderMessages";

import usePeople from "../../common/usePeople.js";

import "./index.less";

const { Header } = Layout;
const { useBreakpoint } = Grid;

function HeaderBase() {
  const [menuKeysSelected, setMenuKeysSelected] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const loggedUser = usePeople();

  const screens = useBreakpoint();
  const isMobile = screens.md === false;

  useEffect(() => {
    if (location.pathname === '/profile/edit') {
      setMenuKeysSelected(['profileEdit']);
    } else if (location.pathname === '/notification-settings') {
      setMenuKeysSelected(['notificationSettings']);
    } else {
      setMenuKeysSelected([]);
    }
  }, [location]);

  function onUserMenuClick({ key }) {
    if (key === "profileEdit") {
      navigate("/profile/edit");
    } else if (key === "notificationSettings") {
      navigate("/notification-settings");
    } else if (key === "logout") {
      loggedUser.unload();
    }
  }

  const isLogged = _auth.isLogged();

  return (
    <Header
      className={classNames('header-base', {
        auth: isLogged,
        mobile: isMobile,
      })}
    >
      {!isLogged && (
        <Link to="/" className="logo-container">
          <img alt="logo" src="/images/logo.svg" />
        </Link>
      )}
      {isLogged && (
        <Menu
          mode="horizontal"
          disabledOverflow={true}
          onClick={onUserMenuClick}
          selectedKeys={menuKeysSelected}
          items={[
            {
              key: "messages",
              label: <HeaderMessages />,
              className: "notifications-menu",
              popupClassName: "notifications-menu-popup",
              style: { padding: 0 }
            },
            {
              key: "generalNotifications",
              label: <HeaderNotifications />,
              className: "notifications-menu",
              popupClassName: "notifications-menu-popup",
              style: { padding: 0 }
            },
            {
              key: "profile",
              label: <HeaderUserInfo />,
              className: "profile-menu",
              popupClassName: "profile-menu-popup",
              children: [
                {
                  key: "profileEdit",
                  icon: <EditOutlined />,
                  label: 'Editar Perfil'
                },
                {
                  key: "notificationSettings",
                  icon: <SettingOutlined />,
                  label: 'Gerir Notificações'
                },
                {
                  key: "logout",
                  icon: <MdLogout />,
                  danger: true,
                  label: 'Terminar Sessão'
                }
              ]
            }
          ]}
        />
      )}
    </Header>
  );
}

export default HeaderBase;