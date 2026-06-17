import React, { useState, useEffect } from 'react';
import { Card, Typography, Avatar, Button, Tabs, Badge, Space, Tag, Empty, Spin } from 'antd';
import { MessageOutlined, SafetyOutlined, NotificationOutlined, BellOutlined } from '@ant-design/icons';
import { IoCheckmarkDoneSharp } from "react-icons/io5";

import ListHeaderFilters from '../../../components/ListHeaderFilters/index.jsx';

import './index.less';

const { Text } = Typography;

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'message', title: 'Ana Silva', desc: 'Enviou-te uma nova mensagem.', time: 'Há 5 min', read: false },
  { id: 2, type: 'security', title: 'Novo Acesso', desc: 'Sessão iniciada num novo dispositivo.', time: 'Há 2 horas', read: false },
  { id: 3, type: 'system', title: 'Manutenção', desc: 'O sistema estará offline esta madrugada.', time: 'Ontem', read: true },
  { id: 4, type: 'system', title: 'Bem-vindo!', desc: 'O teu perfil foi criado com sucesso.', time: 'Há 3 dias', read: true },
];

function Notifications() {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'message': return <Avatar icon={<MessageOutlined />} style={{ backgroundColor: '#8A6AA2' }} />;
      case 'security': return <Avatar icon={<SafetyOutlined />} style={{ backgroundColor: '#FDBA3C' }} />;
      default: return <Avatar icon={<NotificationOutlined />} style={{ backgroundColor: '#bfbfbf' }} />;
    }
  };

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const tabItems = [
    {
      key: 'all',
      label: 'Todas'
    },
    {
      key: 'unread',
      label: (
        <Space size="small">
          Não Lidas
          <Tag color="#8A6AA2" variant='solid'>{unreadCount}</Tag>
        </Space>
      )
    }
  ];

  return (
    <section className="notifications-page">
      <div className="notifications-page__header">
        <ListHeaderFilters
          title="Notificações"
          hideInputs={true}
        />
      </div>

      <div className="notifications-page__toolbar">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="notifications-page__tabs"
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
                onClick={() => markAsRead(item.id)}
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