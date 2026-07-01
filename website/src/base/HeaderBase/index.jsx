import classNames from "classnames";
import _auth from "@netuno/auth-client";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button, Layout, Menu } from "antd";
import HeaderUserInfo from "../../components/HeaderUserInfo/index.jsx";
import { EditOutlined, LogoutOutlined } from "@ant-design/icons";
import { MdLogout } from "react-icons/md";
import React, { useEffect, useState } from "react";

import HeaderNotifications from "../../components/HeaderNotifcations";
import usePeople from "../../common/usePeople.js";

import "./index.less";

const { Header } = Layout;

function HeaderBase({ collapsed }) {
  const [menuKeysSelected, setMenuKeysSelected] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const loggedUser = usePeople();

  useEffect(() => {
    if (location.pathname === '/profile/edit') {
      setMenuKeysSelected(['profileEdit']);
    } else {
      setMenuKeysSelected([]);
    }
  }, [location]);

  function onUserMenuClick({ key }) {
    if (key === "profileEdit") {
      navigate("/profile/edit");
    } else if (key === "logout") {
      loggedUser.unload();
    }
  }

  return (
    <Header className={'header-base ' + classNames({ 'auth ': _auth.isLogged() }) + classNames({ 'collapsed ': collapsed })}>
      {!_auth.isLogged() &&
        <Link to="/" className="logo-container"><img alt="logo" src="/images/logo.svg" /></Link>
      }
      {_auth.isLogged() &&
        <Menu
          mode="horizontal"
          disabledOverflow={true}
          onClick={onUserMenuClick}
          selectedKeys={menuKeysSelected}
          items={[
            {
              key: "notifications",
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
                  key: "logout",
                  icon: <MdLogout />,
                  danger: true,
                  label: 'Terminar Sessão'
                }
              ]
            }
          ]}
        />
      }
    </Header>
  );
}

export default HeaderBase;
