import _auth from "@netuno/auth-client";
import { MenuOutlined, HomeOutlined, EnvironmentOutlined, BellOutlined, MessageOutlined, CloseOutlined } from "@ant-design/icons";
import { CgProfile } from "react-icons/cg";
import { RiCommunityLine } from "react-icons/ri";
import { RxPeople } from "react-icons/rx";
import { LuUserCheck } from "react-icons/lu";

import { Menu, Layout, Drawer, Button, Grid } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

import "./index.less";

import usePeople from "../../common/usePeople";

const { Sider } = Layout;
const { useBreakpoint } = Grid;

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
    icon: <MessageOutlined />,
    link: "/messages"
  },
  {
    key: "notifications",
    label: "Notificações",
    icon: <BellOutlined />,
    link: "/notifications"
  },
  {
    key: "friends",
    label: "Amigos",
    icon: <LuUserCheck />,
    link: "/friends"
  },
];

const RESTRICTED_KEYS = ['locations'];

function SiderMenu() {
  const [selectedMenuKeys, setSelectedMenuKeys] = useState(["posts"]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loggedUser = usePeople();
  const location = useLocation();
  const navigate = useNavigate();

  const screens = useBreakpoint();
  const isMobile = screens.md === false;

  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const menuItem = menuItems.find((i) => location.pathname === i.link);
    setSelectedMenuKeys(menuItem ? [menuItem.key] : []);
  }, [location]);

  function onMenuClick(e) {
    const menuItem = menuItems.find((i) => i.key === e.key);
    if (!menuItem) {
      return;
    }

    setSelectedMenuKeys([menuItem.key]);
    navigate(menuItem.link);

    if (isMobile) {
      setDrawerOpen(false);
    }
  }

  if (!_auth.isLogged()) {
    return null;
  }

  const filteredItems = menuItems.filter((item) => {
    if (RESTRICTED_KEYS.includes(item.key)) {
      return loggedUser.canManageInstitution();
    }
    return true;
  });

  const menuContent = (
    <Menu
      onClick={onMenuClick}
      selectedKeys={selectedMenuKeys}
      mode="inline"
      items={filteredItems}
    />
  );

  if (isMobile) {
    return (
      <>
        {!drawerOpen && (
          <Button
            className="sider-menu__mobile-toggle"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
          />
        )}

        <Drawer
          placement="left"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          size={260}
          styles={{ body: { padding: 0 }, header: { display: 'none' } }}
        >
          <div className="logo-container logo-container--drawer">
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setDrawerOpen(false)}
              className="drawer-close-btn"
            />
            <img alt="logo" src="/images/logo.svg" />
          </div>
          {menuContent}
        </Drawer>
      </>
    );
  }

  return (
    <Sider className="sider-menu">
      <div className="logo-container">
        <img alt="logo" src="/images/logo.svg" />
      </div>
      {menuContent}
    </Sider>
  );
}

export default SiderMenu;
