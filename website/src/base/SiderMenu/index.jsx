import _auth from "@netuno/auth-client";
import { MenuOutlined, HomeOutlined, EnvironmentOutlined, BellOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { CgProfile } from "react-icons/cg";
import { RiCommunityLine } from "react-icons/ri";
import { RxPeople } from "react-icons/rx";
import { IoChatbubblesOutline } from "react-icons/io5";
import { LuUserCheck } from "react-icons/lu";

import { Menu, Layout } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

import "./index.less";

import usePeople from "../../common/usePeople";

const { Sider } = Layout;

const menuItems = [
  {
    key: "posts",
    label: "Postagens",
    icon: <HomeOutlined />,
    link: "/posts"
  },
  {
    key: "profile-view",
    label: "Meu perfil",
    icon: <CgProfile />,
    link: "/profile/view"
  },
  {
    key: "institutions",
    label: "Instituições",
    icon: <RiCommunityLine />,
    link: "/institutions"
  },
  {
    key: "people",
    label: "Pessoas",
    icon: <RxPeople />,
    link: "/people"
  },
  {
    key: "locations",
    label: "Localizações",
    icon: <EnvironmentOutlined />,
    link: "/locations"
  },
  {
    key: "messages",
    label: "Mensagens",
    icon: <IoChatbubblesOutline />,
    link: "/messages"
  }
  , {
    key: "notifications",
    label: "Notificações",
    icon: <BellOutlined />,
    link: "/notifications"
  }
  , {
    key: "friends",
    label: "Amigos",
    icon: <LuUserCheck />,
    link: "/friends"
  }
];

function SiderMenu({ collapsed, onCollapse }) {
  const [selectedMenuKeys, setSelectedMenuKeys] = useState(["posts"]);
  const [sideMenuMobileMode, setSideMenuMobileMode] = useState(false);
  const loggedUser = usePeople();
  const location = useLocation();
  const navigate = useNavigate();
  
  const loggedUserGroupCode = loggedUser.data?.group?.code;

  useEffect(() => {
    const menuItem = menuItems.find((i) => location.pathname === i.link);
    if (menuItem) {
      setSelectedMenuKeys([menuItem.key]);
    } else {
      setSelectedMenuKeys([]);
    }
  }, [location]);

  function onMenuClick(e) {
    const menuItem = menuItems.find((i) => i.key === e.key);
    if (menuItem) {
      setSelectedMenuKeys([menuItem.key]);
      navigate(menuItem.link);
      if (sideMenuMobileMode && !collapsed) {
        onCollapse(true);
      }
    }
  }

  return (
    <>
      {_auth.isLogged() &&
        <Sider
          onBreakpoint={mobile => {
            setSideMenuMobileMode(mobile);
          }}
          collapsedWidth={sideMenuMobileMode ? '0' : '80'}
          breakpoint={"md"}
          collapsible
          collapsed={collapsed}
          onCollapse={onCollapse}
          trigger={<MenuOutlined />}
          className="sider-menu"
        >
          <div className="logo-container"><img alt="logo" src="/images/logo.svg" /></div>
          <Menu
            onClick={onMenuClick}
            selectedKeys={selectedMenuKeys}
            mode="inline"
            items={
              menuItems.filter((item) => {
                const restrictedKeys = ['locations'];

                if (restrictedKeys.includes(item.key)) {
                  return loggedUser.canManageInstitution();
                }

                return true;
              })
            }
          />
        </Sider>
      }
    </>
  );
}

export default SiderMenu;
