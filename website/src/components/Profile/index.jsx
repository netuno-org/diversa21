import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Row, Col, Card, Typography, Avatar, Button, Divider, Space, Spin, Popover } from 'antd';
import {
  EditOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { RiCommunityLine } from "react-icons/ri";
import { BsFillHouseGearFill } from "react-icons/bs";
import { RiFileEditLine } from "react-icons/ri";

import dayjs from 'dayjs';
import _service from '@netuno/service-client';

import PostList from '../Post/List';
import usePeople from "../../common/usePeople.js";
import './index.less';

const { Title, Text, Paragraph } = Typography;

function Profile({ user }) {
  const loggedUser = usePeople();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");

  useEffect(() => {
    if (user && user.avatar) {
      setAvatarUrl(_service.url(`/people/avatar?uid=${user.uid}`));
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

  return (
    <section className="profile-view">
      <div className="cover-image">
        <div className="cover-placeholder" />
      </div>

      <Row gutter={[32, 24]}>

        <Col xs={24} lg={8}>
          <Card className="sidebar-card">
            <div className="avatar-section">
              <Avatar src={avatarUrl} size={140} />
            </div>

            <Title level={2} className="user-name">
              {user.name}
            </Title>
            <Text type="secondary" className="user-username">
              @{user.username}
            </Text>

            <div className="badge-container">
              {renderGroupInfo()}
            </div>

            <Space direction="vertical" size={12} className="user-info-list">
              {(user.city?.name || user.country?.name) && (
                <div className="info-item">
                  <EnvironmentOutlined />
                  <Text type="secondary">
                    {user.city?.name}{user.city?.name && user.state?.name && ', '}{user.state?.name}
                  </Text>
                </div>
              )}

              {user.birthDate && (
                <div className="info-item">
                  <CalendarOutlined />
                  <Text type="secondary">{dayjs(user.birthDate).format('LL')}</Text>
                </div>
              )}

              {user.institution && (
                <Popover
                  content={<div className="institution-text-popover">Visitar página da instituição</div>}
                  placement="bottom"
                  trigger="hover"
                >
                  <Link to={`/institutions/${user.institution.uid}`} className="info-item institution-link">
                    <RiCommunityLine />
                    <span>{user.institution.name}</span>
                  </Link>
                </Popover>
              )}
            </Space>

            {loggedUser.canManageUser(user) && (
              <>
                <Divider />
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  size="large"
                  block
                  onClick={handleEdit}
                >
                  Editar Perfil
                </Button>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card className="details-card">
            <Title level={3}>Sobre</Title>
            <Paragraph>
              {user.description && user.description !== "-"
                ? user.description
                : 'Este utilizador ainda não adicionou uma descrição.'}
            </Paragraph>
          </Card>

          <div className="posts-section">
            <Title level={3} className="posts-title">Atividade</Title>
            <PostList author={user.uid} />
          </div>
        </Col>

      </Row>
    </section>
  );
}

export default Profile;