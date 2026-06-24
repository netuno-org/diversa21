import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Typography, Avatar, Button, Divider, Space, Spin, Popover, Tabs, Empty, Tag, notification, Popconfirm } from 'antd';
import {
  EditOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { RiCommunityLine, RiFileEditLine } from "react-icons/ri";
import { BsFillHouseGearFill } from "react-icons/bs";
import { FaUserPlus } from "react-icons/fa";
import { LuUserCheck } from "react-icons/lu";

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
  const [isLoading, setIsLoading] = useState(false);
  const [friendStatus, setFriendStatus] = useState(null);
  const [canRequestFriend, setCanRequestFriend] = useState(false);
  const isOwnProfile = user?.username === loggedUser?.data?.username;
  const canEditProfile = isOwnProfile || loggedUser?.canManageUser(user);
  const showAddFriendButton = !canEditProfile && canRequestFriend;

  const friendshipStatus = {
    none: { label: "Adicionar amigo", action: "request" },
    pending: { label: "Cancelar pedido", action: "cancel", title: "Deseja cancelar o pedido de amizade?" },
    received: { label: "Confirmar", action: "accept", title: "Deseja aceitar o pedido de amizade?" },
    friends: { label: "Amigos", action: "remove", title: "Deseja desfazer a amizade?" }
  };
  const currentFriendship = friendshipStatus[friendStatus];
  let buttonIcon = undefined;

  if (canEditProfile) {
    buttonIcon = <EditOutlined />;
  } else if (friendStatus === null) {
    buttonIcon = undefined;
  } else if (friendStatus === "none") {
    buttonIcon = <FaUserPlus size={19} />;
  } else if (friendStatus === "pending") {
    buttonIcon = <ClockCircleOutlined />;
  } else if (friendStatus === "received") {
    buttonIcon = <CheckOutlined />;
  } else {
    buttonIcon = <LuUserCheck size={19} />;
  }

  useEffect(() => {
    if (user) {
      user.avatar && setAvatarUrl(_service.url(`/asset?uid=${user.uid}&type=avatar&entity=people&${new Date().getTime()}`));
      user.banner && setBannerUrl(_service.url(`/asset?uid=${user.uid}&type=banner&entity=people&${new Date().getTime()}`));
    }
  }, [user]);


  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    if (isOwnProfile) {
      setCanRequestFriend(false);
      return;
    }

    setCanRequestFriend(false);

    _service({
      method: "GET",
      url: "/friend/status",
      data: {
        uid: user.uid
      },
      success: ({ json }) => {
        setCanRequestFriend(json.canRequest);
        setFriendStatus(json.status);
      },
      fail: (error) => {
        console.error(error);
        setCanRequestFriend(false);
        setFriendStatus("none");
      }
    });
  }, [user, isOwnProfile]);

  const handleEdit = () => {
    if (isOwnProfile) {
      navigate(`/profile/edit`);
    } else {
      navigate(`/e/${user.username}`);
    }
  };

  const requestFriendAction = ({
    method,
    status,
    successMessage,
    successDescription,
    errorMessage,
    errorDescription
  }) => {

    setIsLoading(true);

    _service({
      method,
      url: "/friend",
      data: {
        uid: user.uid
      },
      success: () => {
        setFriendStatus(status);
        setIsLoading(false);
        notification.success({
          title: successMessage,
          description: successDescription
        });
      },
      fail: (error) => {
        setIsLoading(false);
        console.error(error);
        notification.error({
          title: errorMessage,
          description: errorDescription
        });
      }
    });
  };

  const handleSendFriendRequest = () => {
    requestFriendAction({
      method: "POST",
      status: "pending",
      successMessage: "Solicitação enviada",
      successDescription: "A solicitação de amizade foi enviada com sucesso.",
      errorMessage: "Erro ao enviar solicitação",
      errorDescription: "Não foi possível enviar a solicitação de amizade."
    });
  };

  const handleCancelFriendRequest = () => {
    requestFriendAction({
      method: "DELETE",
      status: "none",
      successMessage: "Solicitação cancelada",
      successDescription: "A solicitação de amizade foi cancelada com sucesso.",
      errorMessage: "Erro ao cancelar solicitação",
      errorDescription: "Não foi possível cancelar a solicitação de amizade."
    });
  };

  const handleAcceptFriendRequest = () => {
    requestFriendAction({
      method: "PUT",
      status: "friends",
      successMessage: "Pedido aceito",
      successDescription: "O pedido de amizade foi aceito com sucesso.",
      errorMessage: "Erro ao aceitar pedido",
      errorDescription: "Não foi possível aceitar o pedido de amizade."
    });
  };

  const handleRejectFriendRequest = () => {
    requestFriendAction({
      method: "DELETE",
      status: "none",
      successMessage: "Pedido recusado",
      successDescription: "O pedido de amizade foi recusado com sucesso.",
      errorMessage: "Erro ao recusar pedido",
      errorDescription: "Não foi possível recusar o pedido de amizade."
    });
  };

  const handleRemoveFriend = () => {
    requestFriendAction({
      method: "DELETE",
      status: "none",
      successMessage: "Amizade desfeita",
      successDescription: "Você não está mais conectado com este usuário.",
      errorMessage: "Erro ao desfazer amizade",
      errorDescription: "Não foi possível desfazer a amizade."
    });
  };

  const handleFriendAction = () => {
    if (!currentFriendship?.action) {
      return;
    }

    switch (currentFriendship.action) {
      case "request":
        handleSendFriendRequest();
        break;
      case "cancel":
        handleCancelFriendRequest();
        break;
      case "accept":
        handleAcceptFriendRequest();
        break;
      case "remove":
        handleRemoveFriend();
        break;
      default:
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
    if (user.group.code === "member") {
      return null
    };

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
          <div className="profile__actions">
            <div className="profile__action-buttons">
              {(canEditProfile || showAddFriendButton) && (
                friendStatus === "none" || canEditProfile ? (
                  <Button
                    type="primary"
                    className={`profile__edit-btn ${friendStatus === "friends" ||
                      friendStatus === "pending" ? "profile__secondary-btn" : ""}`}
                    icon={buttonIcon}
                    onClick={canEditProfile ? handleEdit : handleFriendAction}
                    loading={isLoading}
                  >
                    {canEditProfile ? "Editar Perfil" : currentFriendship.label}
                  </Button>
                ) : (
                  <Popconfirm
                    title={currentFriendship.title}
                    onConfirm={handleFriendAction}
                    okText="Sim"
                    cancelText="Não"
                  >
                    <Button
                      type="primary"
                      className={`profile__edit-btn ${friendStatus === "friends" ||
                        friendStatus === "pending" ? "profile__secondary-btn" : ""}`}
                      icon={buttonIcon}
                      loading={isLoading}
                    >
                      {canEditProfile ? "Editar Perfil" : currentFriendship.label}
                    </Button>
                  </Popconfirm>
                )
              )}
              {showAddFriendButton && friendStatus === "received" && (
                <Popconfirm
                  title="Deseja recusar o pedido de amizade?"
                  onConfirm={handleRejectFriendRequest}
                  okText="Sim"
                  cancelText="Não"
                >
                  <Button
                    className="profile__secondary-btn"
                    loading={isLoading}
                  >
                    <CloseOutlined />Recusar
                  </Button>
                </Popconfirm>
              )}
            </div>
            {showAddFriendButton && friendStatus === "received" && (
              <div className="profile__friend-request-text">
                Deseja aceitar o pedido de amizade de
                <span className="profile__friend-request-text__name">
                  {" " + user.name}
                </span>
                ?
              </div>
            )}
          </div>
        </div>
        <div className="profile__info">
          <Title level={2} className="profile__name">
            {user.name}
          </Title>
          <div className="profile__username-wrapper">
            <Text type="secondary" className="profile__username">
              @{user.username}
            </Text>
            {renderGroupInfo()}
            {user.active === false && (
              <Tag bordered={false} color="error" className="profile__status-tag">
                Conta Inativa
              </Tag>
            )}
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
