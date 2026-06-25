import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Avatar, Button, Tabs, Badge, Space, Tag, Empty, Spin } from 'antd';
import { MessageOutlined, SafetyOutlined, NotificationOutlined, FileTextOutlined } from '@ant-design/icons';
import { IoCheckmarkDoneSharp } from "react-icons/io5";

import ListHeaderFilters from '../../../components/ListHeaderFilters/index.jsx';
import usePeople from "../../../common/usePeople.js";
import useNotifications from "../../../common/useNotifications.js";

import './index.less';

const { Text } = Typography;

function Notifications() {
  const loggedUser = usePeople();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const { notifications, loading, markAllAsRead, markAsRead } = useNotifications(loggedUser);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (item) => {
    markAsRead(item.id);

    if (item.type === 'institution-post') {
      if (item.parentUid && item.commentUid) {
        navigate(`/p/${item.parentUid}?c=${item.commentUid}`);
      } else if (item.parentUid) {
        navigate(`/p/${item.parentUid}`);
      } else {
        navigate('/posts');
      }
    } else if (item.type === 'message') {
      navigate('/messages', {
        state: { autoOpenFriend: { uid: item.senderUid, name: item.title, username: item.username } }
      });
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'institution-post': return <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#50a063' }} shape='square' />;
      case 'message': return <Avatar icon={<MessageOutlined />} style={{ backgroundColor: '#8A6AA2' }} shape='square' />;
      case 'security': return <Avatar icon={<SafetyOutlined />} style={{ backgroundColor: '#FDBA3C' }} shape='square' />;
      default: return <Avatar icon={<NotificationOutlined />} style={{ backgroundColor: '#bfbfbf' }} shape='square' />;
    }
  };

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

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
            { key: 'unread', label: <Space size="small">Não Lidas<Tag color="#8A6AA2" variant='solid'>{unreadCount}</Tag></Space> }
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
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div style={{ padding: '40px 0' }}>
              <Empty description="Não há notificações neste momento." />
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`notifications-page__item ${!item.read ? 'notifications-page__item--unread' : ''}`}
                onClick={() => handleNotificationClick(item)}
                style={{ cursor: 'pointer' }}
              >
                <div className="notifications-page__item-meta">
                  <div className="notifications-page__item-avatar">
                    {getIconForType(item.type)}
                  </div>
                  <div className="notifications-page__item-content">
                    <div className="notifications-page__item-title">
                      <Text strong={!item.read}>{item.title}</Text>
                      <Text type="secondary" className="notifications-page__item-time">{item.time}</Text>
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
