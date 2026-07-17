import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Avatar, Button, Tabs, Badge, Space, Tag, Empty, Spin } from 'antd';
import { SafetyOutlined, NotificationOutlined, FileTextOutlined, CommentOutlined, UserAddOutlined, TeamOutlined } from '@ant-design/icons';
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import _service from '@netuno/service-client';
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

  const { notifications, loading, markAllAsRead, onNotificationClick } = useNotifications(loggedUser);

  // Mensagens ficam só no header de mensagens — não aparecem nesta página.
  const generalNotifications = notifications.filter((n) => n.type !== 'message');
  const unreadCount = generalNotifications.filter(n => !n.read).length;

  const getIconForType = (type) => {
    switch (type) {
      case 'institution-post': return <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#50a063' }} />;
      case 'my-post-comment': return <Avatar icon={<CommentOutlined />} style={{ backgroundColor: '#1890ff' }} />;
      case 'friend-request': return <Avatar icon={<UserAddOutlined />} style={{ backgroundColor: '#fa8c16' }} />;
      case 'friend-request-accepted': return <Avatar icon={<TeamOutlined />} style={{ backgroundColor: '#52c41a' }} />;
      case 'security': return <Avatar icon={<SafetyOutlined />} style={{ backgroundColor: '#fa8c16' }} />;
      default: return <Avatar icon={<NotificationOutlined />} style={{ backgroundColor: '#bfbfbf' }} />;
    }
  };

  const getNotificationAvatar = (item) => {
    if (['friend-request', 'friend-request-accepted'].includes(item.type)) {
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
    }
    return getIconForType(item.type);
  };

  const getNotificationTitle = (item) => {
    if (['friend-request', 'friend-request-accepted'].includes(item.type) && item.originator?.name) {
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
                    {getNotificationAvatar(item)}
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
                  </div>
                </div>
                <div className="notifications-page__item-extra">
                  {!item.read && <Badge color="#8A6AA2" />}
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
