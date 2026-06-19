import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Typography, Avatar, Button, Divider, Space, Spin, Popover, Tabs, Empty, Tag } from 'antd';
import {
  EditOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { RiCommunityLine, RiFileEditLine } from "react-icons/ri";
import { BsFillHouseGearFill } from "react-icons/bs";

import dayjs from 'dayjs';
import _service from '@netuno/service-client';

import ActivityList from "../Activity/List";

import PostList from '../Post/List';
import usePeople from "../../common/usePeople.js";
import './index.less';

const { Title, Text, Paragraph } = Typography;

function Profile({ user }) {
  const loggedUser = usePeople();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");
  const [bannerUrl, setBannerUrl] = useState();

  useEffect(() => {
    if (user) {
      user.avatar && setAvatarUrl(_service.url(`/people/avatar?uid=${user.uid}&${new Date().getTime()}`));
      user.coverImage && setBannerUrl(_service.url(`/people/banner?uid=${user.uid}&${new Date().getTime()}`));
    }
  }, [user]);

  const handleEdit = () => {
    navigate(`/e/${user.username}`);
  };

  if (!user) {
    return (
      <div className="profile-view">
        <div className="loading-wrapper">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  const renderGroupInfo = () => {
    if (user.group.code === "member") return null;

    let Icon = RiFileEditLine;
    let color = "#d0990f"; // Review

    if (user.group.code === "super-admin") {
      Icon = SafetyOutlined;
      color = "#8A6AA2";
    } else if (user.group.code === "management") {
      Icon = BsFillHouseGearFill;
      color = "#4e5fa0";
    } else if (user.group.code === "review") {
      color = "#50a063";
    }

    return (
      <div className="group-badge" style={{ color }}>
        <Icon size={16} />
        <span>{user.group.name}</span>
      </div>
    );
  };

  const tabItems = [
    {
      key: 'posts',
      label: 'Publicações',
      children: (
        <div className="profile-tabs__content">
          <PostList author={user.uid} />
        </div>
      ),
    },
    {
      key: 'activity',
      label: 'Atividade',
      children: (
        <div className="profile-tabs__content">
          <ActivityList author={user.uid}/>
        </div>
        // <div className="profile-tabs__content profile-tabs__empty">
        //   <Empty
        //     description="Este utilizador ainda não tem atividade recente."
        //     image={Empty.PRESENTED_IMAGE_SIMPLE}
        //   />
        // </div>
      ),
    },
  ];

  return (
    <section className="profile-view">
      <div className="profile-cover">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Capa de perfil" className="profile-cover__image" />
        ) : (
          <div className="profile-cover__placeholder" />
        )}
      </div>

      <Card className="profile-card">
        <div className="profile-header">
          <div className="profile-header__avatar">
            <Avatar src={avatarUrl} size={120} shape="square"/>
          </div>

          {loggedUser.canManageUser(user) && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
              className="profile-header__btn"
            >
              Editar Perfil
            </Button>
          )}
        </div>

        <div className="profile-info">
          <Title level={2} className="profile-info__name">
            {user.name}
          </Title>

          <div className="profile-info__username-wrapper">
            <Text type="secondary" className="profile-info__username">
              @{user.username}
            </Text>
            {user.active === false && (
              <Tag bordered={false} color="error" className="profile-info__status-tag">
                Conta Inativa
              </Tag>
            )}
          </div>

          <div className="profile-info__badges-wrapper">
            {renderGroupInfo()}
          </div>

          <Space size="large" className="profile-info__details" wrap>
            {(user.city?.name || user.country?.name) && (
              <div className="profile-info__item">
                <EnvironmentOutlined />
                <Text type="secondary">
                  {user.city?.name}{user.city?.name && user.state?.name && ', '}{user.state?.name}
                </Text>
              </div>
            )}

            {user.birthDate && (
              <div className="profile-info__item">
                <CalendarOutlined />
                <Text type="secondary">{dayjs().diff(dayjs(user.birthDate), 'year')} anos</Text>
              </div>
            )}

            {user.institution && (
              <Popover
                content={<div className="profile-info__popover">Visitar página da instituição</div>}
                placement="bottom"
                trigger="hover"
              >
                <Link to={`/institutions/${user.institution.uid}`} className="profile-info__item profile-info__link">
                  <RiCommunityLine />
                  <span>{user.institution.name}</span>
                </Link>
              </Popover>
            )}
          </Space>
        </div>

        <Divider />

        <div className="profile-about">
          <Title level={4}>Sobre</Title>
          <Paragraph className="profile-about__text">
            {user.description && user.description !== "-"
              ? user.description
              : 'Este utilizador ainda não adicionou uma descrição.'}
          </Paragraph>
        </div>
      </Card>

      <div className="profile-tabs">
        <Tabs defaultActiveKey="posts" items={tabItems} size="large" />
      </div>
    </section>
  );
}

export default Profile;
