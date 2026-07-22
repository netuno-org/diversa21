import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Avatar, Button, Tabs, Badge, Space, Tag, Empty, Spin, Popconfirm } from 'antd';
import { SafetyOutlined, NotificationOutlined, FileTextOutlined, CommentOutlined, UserAddOutlined, TeamOutlined, HeartOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import _service from '@netuno/service-client';
import useFriendActions from '../../../common/useFriendActions.js';
import ListHeaderFilters from '../../../components/ListHeaderFilters/index.jsx';
import TimeAgo from '../../../components/TimeAgo';
import usePeople from "../../../common/usePeople.js";
import useNotifications from "../../../common/useNotifications.js";

import './index.less';

const { Text } = Typography;

function Notifications() {
  const loggedUser = usePeople();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const { notifications, loading, markAllAsRead, onNotificationClick, markAsRead, removeNotification } = useNotifications(loggedUser);
  const { run: runFriendAction, isProcessing } = useFriendActions();

  // Mensagens ficam só no header de mensagens — não aparecem nesta página.
  const generalNotifications = notifications.filter((n) => n.type !== 'message');
  const unreadCount = generalNotifications.filter(n => !n.read).length;

  const getIconForType = (type) => {
    switch (type) {
      case 'institution-post': return <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#50a063' }} />;
      case 'friend-post': return <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#50a063' }} />;
      case 'my-post-comment': return <Avatar icon={<CommentOutlined />} style={{ backgroundColor: '#1890ff' }} />;
      case 'institution-comment': return <Avatar icon={<CommentOutlined />} style={{ backgroundColor: '#1890ff' }} />;
      case 'friend-comment': return <Avatar icon={<CommentOutlined />} style={{ backgroundColor: '#1890ff' }} />;
      case 'my-post-like': return <Avatar icon={<HeartOutlined />} style={{ backgroundColor: '#eb2f96' }} />;
      case 'institution-like': return <Avatar icon={<HeartOutlined />} style={{ backgroundColor: '#eb2f96' }} />;
      case 'friend-like': return <Avatar icon={<HeartOutlined />} style={{ backgroundColor: '#eb2f96' }} />;
      case 'friend-request': return <Avatar icon={<UserAddOutlined />} style={{ backgroundColor: '#fa8c16' }} />;
      case 'friend-request-accepted': return <Avatar icon={<TeamOutlined />} style={{ backgroundColor: '#52c41a' }} />;
      case 'security': return <Avatar icon={<SafetyOutlined />} style={{ backgroundColor: '#fa8c16' }} />;
      default: return <Avatar icon={<NotificationOutlined />} style={{ backgroundColor: '#bfbfbf' }} />;
    }
  };

  const getNotificationBadge = (type) => {
    let icon;
    let color;
    switch (type) {
      case 'institution-post':
      case 'friend-post':
        icon = <FileTextOutlined style={{ fontSize: 10 }} />;
        color = '#50a063';
        break;
      case 'my-post-comment':
      case 'institution-comment':
      case 'friend-comment':
        icon = <CommentOutlined style={{ fontSize: 10 }} />;
        color = '#1890ff';
        break;
      case 'my-post-like':
      case 'institution-like':
      case 'friend-like':
        icon = <HeartOutlined style={{ fontSize: 10 }} />;
        color = '#eb2f96';
        break;
      case 'security':
        icon = <SafetyOutlined style={{ fontSize: 10 }} />;
        color = '#fa8c16';
        break;
      case 'friend-request':
      case 'friend-request-accepted':
        icon = <CheckOutlined style={{ fontSize: 10 }} />;
        color = '#52c41a';
        break;
      default:
        icon = <NotificationOutlined style={{ fontSize: 10 }} />;
        color = '#bfbfbf';
    }
    return <Avatar size={18} style={{ backgroundColor: color, border: '2px solid #fff' }} icon={icon} />;
  };

  const getNotificationAvatar = (item) => {
    if (item.originator?.uid) {
      return (
        <Avatar
          size={40}
          src={item.originator?.avatar
            ? _service.url(`/asset?uid=${item.originator.uid}&type=avatar&entity=people&${new Date().getTime()}`)
            : "/images/profile-default.png"
          }
        />
      );
    }
    return getIconForType(item.type);
  };

  const getNotificationTitle = (item) => {
    if (item.originator?.name) {
      return item.originator.name;
    }
    return item.title;
  };

  const filteredNotifications = activeTab === 'unread'
    ? generalNotifications.filter((n) => !n.read)
    : generalNotifications;

  return (
    <section className="notifications-page">
      <div className="notifications-page__header">
        <ListHeaderFilters title="Notificações" hideInputs={true} />
      </div>

      <div className="notifications-page__toolbar">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="notifications-page__tabs"
          items={[
            { key: 'all', label: 'Todas' },
            {
              key: 'unread', label: (
                <Space size="small">
                  Não Lidas
                  <Tag color="#8A6AA2" variant="solid" style={{ borderRadius: '32px' }}>
                    {unreadCount}
                  </Tag>
                </Space>
              ),
            },
          ]}
        />

        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllAsRead} icon={<IoCheckmarkDoneSharp />}>
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <Card className="notifications-page__card" variant="borderless">
        <div className="notifications-page__list">
          {loading ? (
            <div className="notifications-page__loading">
              <Spin />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notifications-page__filter">
              <Empty description="Não há notificações neste momento." />
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`notifications-page__item ${!item.read ? 'notifications-page__item--unread' : ''}`}
                onClick={() => onNotificationClick(item, navigate)}
                style={{ cursor: 'pointer' }}
              >
                <div className="notifications-page__item-meta">
                  <div className="notifications-page__item-avatar">
                    <Badge count={getNotificationBadge(item.type)} offset={[-4, 32]}>
                      {getNotificationAvatar(item)}
                    </Badge>
                  </div>
                  <div className="notifications-page__item-content">
                    <div className="notifications-page__item-title">
                      <Text strong={!item.read}>{getNotificationTitle(item)}</Text>
                      {item.sent_at && (
                        <TimeAgo sentAt={item.sent_at} className="notifications-page__item-time" />
                      )}
                    </div>
                    <div className="notifications-page__item-description">
                      <Text type="secondary">{item.desc}</Text>
                    </div>
                    {item.type === 'friend-request' && item.originator?.uid && !item.read && (
                      <div className="notifications-page__item-actions" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="small"
                          type="primary"
                          icon={<CheckOutlined />}
                          onClick={() => {
                            runFriendAction('accept', item.originator.uid, {
                              onSuccess: () => {
                                removeNotification(item.id);
                              }
                            });
                          }}
                          loading={isProcessing(item.originator.uid, 'accept')}
                          disabled={isProcessing(item.originator.uid)}
                        >
                          Aceitar
                        </Button>
                        <Popconfirm
                          title="Recusar solicitação"
                          description="Tem certeza que deseja recusar este pedido de amizade?"
                          onConfirm={() => {
                            runFriendAction('reject', item.originator.uid, {
                              onSuccess: () => {
                                removeNotification(item.id);
                              }
                            });
                          }}
                          okText="Sim"
                          cancelText="Não"
                        >
                          <Button
                            size="small"
                            type="default"
                            icon={<CloseOutlined />}
                            loading={isProcessing(item.originator.uid, 'reject')}
                            disabled={isProcessing(item.originator.uid)}
                          >
                            Recusar
                          </Button>
                        </Popconfirm>
                      </div>
                    )}
                  </div>
                </div>
                <div className="notifications-page__item-extra" onClick={(e) => e.stopPropagation()}>
                  {!item.read && <Badge color="#52c41a" />}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </section>
  );
}

export default Notifications;
