import React, { useState, useEffect, Fragment, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Typography, Avatar, Divider, Space, Spin, Popover, Tabs, Tag } from 'antd';
import {
  EnvironmentOutlined,
  CalendarOutlined,
  SafetyOutlined,
  FileTextOutlined,
  CommentOutlined,
  LikeOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { RiCommunityLine, RiFileEditLine } from "react-icons/ri";
import { BsFillHouseGearFill } from "react-icons/bs";
import { MdOutlineInsertPhoto } from "react-icons/md";
import dayjs from 'dayjs';
import _service from '@netuno/service-client';

import ActivityList from "../Activity/List";
import FriendList from "../Friend/List";
import GalleryTab from "./GalleryTab";
import ProfileHeaderActions from "./ProfileHeaderActions";
import GalleryCarousel from './GalleryCarousel';

import usePeople from "../../common/usePeople.js";
import useFriendActions from "../../common/useFriendActions.js";

import './index.less';

const { Title, Text } = Typography;

function Profile({ user }) {
  const loggedUser = usePeople();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('posts');
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");
  const [coverUrl, setCoverUrl] = useState();
  const [friendStatus, setFriendStatus] = useState(null);
  const [canRequestFriend, setCanRequestFriend] = useState(false);
  const [screenSize, setScreenSize] = useState({
    isMobile: window.innerWidth <= 768,
  });

  const { run, isProcessing } = useFriendActions();

  const isOwnProfile = user?.username === loggedUser?.data?.username;
  const canEditProfile = isOwnProfile || loggedUser?.canManageUser?.(user);
  const isLoading = user?.uid ? isProcessing(user.uid) : false;

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        isMobile: window.innerWidth <= 768,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      const timestamp = new Date().getTime();
      if (user.avatar) {
        setAvatarUrl(_service.url(`/asset?uid=${user.uid}&type=avatar&entity=people&${timestamp}`));
      }
      if (user.cover_image) {
        setCoverUrl(_service.url(`/asset?uid=${user.uid}&type=cover_image&entity=people&${timestamp}`));
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user?.uid || isOwnProfile) {
      setCanRequestFriend(false);
      return;
    }

    _service({
      method: "GET",
      url: "/friend/status",
      data: { uid: user.uid },
      success: ({ json }) => {
        setCanRequestFriend(json.canRequest);
        setFriendStatus(json.status);
      },
      fail: (error) => {
        console.error("Erro ao obter status de amizade:", error);
        setCanRequestFriend(false);
        setFriendStatus("none");
      },
    });
  }, [user, isOwnProfile]);

  const handleEdit = () => {
    navigate(isOwnProfile ? `/profile/edit` : `/e/${user.username}`);
  };

  const doFriendAction = (action, nextStatus) => {
    if (!user?.uid) return;
    run(action, user.uid, {
      onSuccess: () => setFriendStatus(nextStatus),
    });
  };

  const handleFriendAction = (action) => {
    const nextStatusMap = {
      request: { act: "send", next: "pending" },
      cancel: { act: "cancel", next: "none" },
      accept: { act: "accept", next: "friends" },
      remove: { act: "remove", next: "none" },
    };
    const target = nextStatusMap[action];
    if (target) {
      doFriendAction(target.act, target.next);
    }
  };

  const handleRejectFriendRequest = () => {
    doFriendAction("reject", "none");
  };

  const handleOpenMessages = (targetUser) => {
    if (!targetUser?.uid) return;
    navigate('/messages', {
      state: {
        autoOpenFriend: {
          uid: targetUser.uid,
          name: targetUser.name,
          username: targetUser.username,
          avatar: targetUser.avatar,
        },
      },
    });
  };

  const renderGroupInfo = () => {
    if (!user?.group || user.group.code === "member") return null;

    const groupConfig = {
      "super-admin": { Icon: SafetyOutlined, color: "#D0990F" },
      "management": { Icon: BsFillHouseGearFill, color: "#4E5FA0" },
      "review": { Icon: RiFileEditLine, color: "#50A063" },
    };

    const currentConfig = groupConfig[user.group.code] || { Icon: RiFileEditLine, color: "#D0990F" };
    const { Icon, color } = currentConfig;

    return (
      <div className="profile__group-badge" style={{ color }}>
        <Icon size={16} />
        <span>{user.group.name}</span>
      </div>
    );
  };

  const tabItems = useMemo(() => {
    if (!user?.uid) return [];

    const tabs = [
      {
        key: 'posts',
        label: (
          <Space>
            <FileTextOutlined style={{ fontSize: 18 }} />
            <span>Publicações</span>
          </Space>
        ),
        children: (
          <div className="profile__tabs-content">
            <ActivityList url="activity/post/list" author={user.uid} />
          </div>
        ),
      },
      {
        key: 'comments',
        label: (
          <Space>
            <CommentOutlined style={{ fontSize: 18 }} />
            <span>Comentários</span>
          </Space>
        ),
        children: (
          <div className="profile__tabs-content">
            <ActivityList url="activity/comment/list" author={user.uid} />
          </div>
        ),
      },
      {
        key: 'likes',
        label: (
          <Space>
            <LikeOutlined style={{ fontSize: 18 }} />
            <span>Curtidas</span>
          </Space>
        ),
        children: (
          <div className="profile__tabs-content">
            <ActivityList url="activity/like/list" author={user.uid} />
          </div>
        ),
      },
    ];

    if (loggedUser?.data?.group?.code) {
      tabs.push({
        key: 'friends',
        label: (
          <Space>
            <TeamOutlined style={{ fontSize: 18 }} />
            <span>Amigos</span>
          </Space>
        ),
        children: (
          <div className="profile__tabs-content">
            <FriendList userUid={user.uid} />
          </div>
        ),
      });
    }

    tabs.push({
      key: 'gallery',
      label: (
        <Space>
          <MdOutlineInsertPhoto style={{ fontSize: 18 }} />
          <span>Galeria</span>
        </Space>
      ),
      children: <GalleryTab userUid={user.uid} isOwnProfile={isOwnProfile} />,
    });

    return tabs;
  }, [user?.uid, loggedUser?.data?.group?.code, isOwnProfile]);

  if (!user) {
    return (
      <div className="profile">
        <div className="profile__loading">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  const institutionNode = user.institution && (
    <Link to={`/institutions/${user.institution.slug}`} className="profile__detail-item profile__detail-link">
      <RiCommunityLine />
      <span>{user.institution.name}</span>
    </Link>
  );

  const formattedAge = user.birthDate && dayjs(user.birthDate).isValid()
    ? `${dayjs().diff(dayjs(user.birthDate), 'year')} anos`
    : null;

  const defaultDescription = user.institution
    ? 'Esta instituição ainda não adicionou uma descrição.'
    : 'Este utilizador ainda não adicionou uma descrição.';

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

          <ProfileHeaderActions
            user={user}
            isOwnProfile={isOwnProfile}
            canEditProfile={canEditProfile}
            friendStatus={friendStatus}
            canRequestFriend={canRequestFriend}
            isLoading={isLoading}
            isProcessing={isProcessing}
            onEdit={handleEdit}
            onFriendAction={handleFriendAction}
            onRejectFriendRequest={handleRejectFriendRequest}
            onOpenMessages={handleOpenMessages}
          />
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
              <Tag variant="filled" color="error" className="profile__status-tag">
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

            {formattedAge && (
              <div className="profile__detail-item">
                <CalendarOutlined />
                <Text type="secondary">{formattedAge}</Text>
              </div>
            )}

            {user.institution && (
              screenSize.isMobile ? (
                institutionNode
              ) : (
                <Popover content="Visitar página da instituição" placement="bottom" trigger="hover">
                  {institutionNode}
                </Popover>
              )
            )}
          </Space>
        </div>

        <Divider />

        <div className="profile__about">
          <Title level={4}>Sobre</Title>
          {(user.description || defaultDescription)
            .split('\n')
            .map((line, index, array) => (
              <Fragment key={index}>
                {line}
                {index < array.length - 1 && <br />}
              </Fragment>
            ))}
        </div>

        <Divider />
        <GalleryCarousel
          userUid={user.uid}
          isOwnProfile={isOwnProfile}
          onViewMore={() => setActiveTab('gallery')}
        />
      </Card>

      <div className="profile__tabs">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          tabBarGutter={screenSize.isMobile ? 16 : 32}
        />
      </div>
    </section>
  );
}

export default Profile;