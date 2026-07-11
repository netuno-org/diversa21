import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Typography, Avatar, Button, Divider, Space, Spin, Popover, Tabs, Tag, Popconfirm } from 'antd';
import {
  EditOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { RiCommunityLine, RiFileEditLine } from "react-icons/ri";
import { BsFillHouseGearFill } from "react-icons/bs";
import { FaUserPlus } from "react-icons/fa";
import { LuUserCheck } from "react-icons/lu";

import dayjs from 'dayjs';
import _service from '@netuno/service-client';

import ActivityList from "../Activity/List";
import FriendList from "../Friend/List";
import usePeople from "../../common/usePeople.js";
import useFriendActions from "../../common/useFriendActions.js";

import './index.less';

const { Title, Text, Paragraph } = Typography;

function Profile({ user }) {
  const loggedUser = usePeople();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");
  const [coverUrl, setCoverUrl] = useState();
  const [friendStatus, setFriendStatus] = useState(null);
  const [canRequestFriend, setCanRequestFriend] = useState(false);

  const { run, isProcessing } = useFriendActions();

  const isOwnProfile = user?.username === loggedUser?.data?.username;
  const canEditProfile = isOwnProfile || loggedUser?.canManageUser(user);

  const friendshipStatus = {
    none: { label: "Adicionar amigo", action: "request" },
    pending: { label: "Cancelar pedido", action: "cancel", title: "Deseja cancelar o pedido de amizade?" },
    received: { label: "Aceitar", action: "accept", title: "Deseja aceitar o pedido de amizade?" },
    friends: { label: "Amigos", action: "remove", title: "Deseja desfazer a amizade?" },
  };
  const currentFriendship = friendshipStatus[friendStatus];

  const isLoading = user?.uid ? isProcessing(user.uid) : false;

  let buttonIcon = undefined;
  if (isOwnProfile) {
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
      user.cover_image && setCoverUrl(_service.url(`/asset?uid=${user.uid}&type=cover_image&entity=people&${new Date().getTime()}`));
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
      data: { uid: user.uid },
      success: ({ json }) => {
        setCanRequestFriend(json.canRequest);
        setFriendStatus(json.status);
      },
      fail: (error) => {
        console.error(error);
        setCanRequestFriend(false);
        setFriendStatus("none");
      },
    });
  }, [user, isOwnProfile]);

  const handleEdit = () => {
    if (isOwnProfile) {
      navigate(`/profile/edit`);
    } else {
      navigate(`/e/${user.username}`);
    }
  };

  const doFriendAction = (action, nextStatus) => {
    if (!user?.uid) {
      return;
    }
    run(action, user.uid, {
      onSuccess: () => setFriendStatus(nextStatus),
    });
  };

  const handleFriendAction = () => {
    if (!currentFriendship?.action) {
      return;
    }
    switch (currentFriendship.action) {
      case "request":
        doFriendAction("send", "pending");
        break;
      case "cancel":
        doFriendAction("cancel", "none");
        break;
      case "accept":
        doFriendAction("accept", "friends");
        break;
      case "remove":
        doFriendAction("remove", "none");
        break;
      default:
    }
  };

  const handleRejectFriendRequest = () => {
    doFriendAction("reject", "none");
  };

  const handleOpenMessages = (u) => {
    if (!u?.uid) {
      return;
    }
    navigate('/messages', {
      state: {
        autoOpenFriend: {
          uid: u.uid,
          name: u.name,
          username: u.username,
          avatar: u.avatar,
        },
      },
    });
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
      return null;
    }

    let Icon = RiFileEditLine;
    let color = "#d0990f";

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
          <ActivityList url="activity/post/list" author={user.uid} />
        </div>
      ),
    },
    {
      key: 'comments',
      label: 'Comentários',
      children: (
        <div className="profile__tabs-content">
          <ActivityList url="activity/comment/list" author={user.uid} />
        </div>
      ),
    },
    {
      key: 'likes',
      label: 'Curtidas',
      children: (
        <div className="profile__tabs-content">
          <ActivityList url="activity/like/list" author={user.uid} />
        </div>
      ),
    },
  ];

  if (loggedUser?.data?.group?.code) {
    tabItems.push({
      key: 'friends',
      label: 'Amigos',
      children: (
        <div className="profile__tabs-content">
          <FriendList userUid={user.uid} />
        </div>
      ),
    });
  }

  return (
    <section className="profile">
      <div className="profile__cover">
        {coverUrl ? (
          <img src={coverUrl} alt="Capa de perfil" className="profile__cover-image" />
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
              {isOwnProfile ? (
                <Button
                  type="primary"
                  className="profile__edit-btn"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  Editar Perfil
                </Button>
              ) : currentFriendship && (canRequestFriend || friendStatus !== "none") ? (
                friendStatus === "none" ? (
                  <Button
                    type="primary"
                    className="profile__edit-btn"
                    icon={buttonIcon}
                    onClick={handleFriendAction}
                    loading={isLoading}
                  >
                    {currentFriendship.label}
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
                      className={`profile__edit-btn ${friendStatus === "friends" || friendStatus === "pending" ? "profile__secondary-btn" : ""}`}
                      icon={buttonIcon}
                      loading={isLoading}
                    >
                      {currentFriendship.label}
                    </Button>
                  </Popconfirm>
                )
              ) : null}
              {friendStatus === "received" && (
                <Popconfirm
                  title="Deseja recusar o pedido de amizade?"
                  onConfirm={handleRejectFriendRequest}
                  okText="Sim"
                  cancelText="Não"
                >
                  <Button
                    type="primary"
                    className="profile__secondary-btn"
                    icon={<CloseOutlined />}
                    loading={isLoading}
                  >
                    Recusar
                  </Button>
                </Popconfirm>
              )}
              {!isOwnProfile && friendStatus === 'friends' && (
                <Button
                  type="primary"
                  loading={isLoading}
                  onClick={() => handleOpenMessages(user)}
                  icon={<MessageOutlined />}
                >
                  Enviar mensagem
                </Button>
              )}
            </div>
            {friendStatus === "received" && (
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
              <Tag variant="filled" color="error" className="profile__status-tag" style={{ borderRadius: '32px' }}>
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
              : 'Este usuário ainda não adicionou uma descrição.'}
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