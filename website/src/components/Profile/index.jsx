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

  const isOwnProfile = user?.username === loggedUser?.data?.username;
  const canEditProfile = isOwnProfile || loggedUser?.canManageUser(user);

  useEffect(() => {
    if (user) {
      user.avatar && setAvatarUrl(_service.url(`/people/avatar?uid=${user.uid}&${new Date().getTime()}`));
      user.coverImage && setBannerUrl(_service.url(`/people/banner?uid=${user.uid}&${new Date().getTime()}`));
    }
  }, [user]);

  const handleEdit = () => {
    if (isOwnProfile) {
      navigate(`/profile/edit`);
    } else {
      navigate(`/e/${user.username}`);
    }
  };

  if (!user) {
    return (
      <div className="profile">
        <div className="profile__loading">
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
      <div className="profile__group-badge" style={{ color }}>
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
        <div className="profile__tabs-content">
          <PostList author={user.uid} />
        </div>
      ),
    },
    {
      key: 'activity',
      label: 'Atividade',
      children: (
        <div className="profile__tabs-content">
          <ActivityList author={user.uid} />
        </div>
      ),
    },
  ];

  return (
    <section className="profile">
      <div className="profile__cover">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Capa de perfil" className="profile__cover-image" />
        ) : (
          <div className="profile__cover-placeholder" />
        )}
      </div>

      <Card className="profile__card">
        <div className="profile__header">
          <div className="profile__avatar">
            <Avatar src={avatarUrl} size={120} shape="square" />
          </div>

          {canEditProfile && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
              className="profile__edit-btn"
            >
              Editar Perfil
            </Button>
          )}
        </div>

        <div className="profile__info">
          <Title level={2} className="profile__name">
            {user.name}
          </Title>

          <div className="profile__username-wrapper">
            <Text type="secondary" className="profile__username">
              @{user.username}
            </Text>
            {user.active === false && (
              <Tag bordered={false} color="error" className="profile__status-tag">
                Conta Inativa
              </Tag>
            )}
          </div>

          <div className="profile__badges-wrapper">
            {renderGroupInfo()}
          </div>

          <Space size="large" className="profile__details" wrap>
            {(user.city?.name || user.country?.name) && (
              <div className="profile__detail-item">
                <EnvironmentOutlined />
                <Text type="secondary">
                  {user.city?.name}{user.city?.name && user.state?.name && ', '}{user.state?.name}
                </Text>
              </div>
            )}

            {user.birthDate && (
              <div className="profile__detail-item">
                <CalendarOutlined />
                <Text type="secondary">{dayjs().diff(dayjs(user.birthDate), 'year')} anos</Text>
              </div>
            )}

            {user.institution && (
              <Popover
                content={<div className="profile__popover">Visitar página da instituição</div>}
                placement="bottom"
                trigger="hover"
              >
                <Link to={`/institutions/${user.institution.slug}`} className="profile__detail-item profile__detail-link">
                  <RiCommunityLine />
                  <span>{user.institution.name}</span>
                </Link>
              </Popover>
            )}
          </Space>
        </div>

        <Divider />

        <div className="profile__about">
          <Title level={4}>Sobre</Title>
          <Paragraph className="profile__about-text">
            {user.description && user.description !== "-"
              ? user.description
              : 'Este utilizador ainda não adicionou uma descrição.'}
          </Paragraph>
        </div>
      </Card>

      <div className="profile__tabs">
        <Tabs defaultActiveKey="posts" items={tabItems} size="large" />
      </div>
    </section>
  );
}

export default Profile;
