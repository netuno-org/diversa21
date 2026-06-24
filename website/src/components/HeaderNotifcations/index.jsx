import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Popover, List, Typography, Avatar, Button } from 'antd';
import { BellOutlined, MessageOutlined, SafetyOutlined, NotificationOutlined, FileTextOutlined } from '@ant-design/icons';
import { IoCheckmarkDoneSharp } from "react-icons/io5";

import './index.less';

const { Text } = Typography;

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'institution_post', title: `@ben10`, desc: 'Fez uma nova publicação na tua instituição.', time: 'Agora mesmo', read: false, postId: 'b3499f27-44b8-4169-92ea-d0a8b6c12148', username: 'ben10' },
  { id: 2, type: 'message', title: '@test', desc: 'Enviou-te uma nova mensagem.', time: 'Há 5 min', read: false, username: 'test' },
  { id: 3, type: 'security', title: 'Novo Acesso', desc: 'Sessão iniciada num novo dispositivo.', time: 'Há 2 horas', read: false },
  { id: 4, type: 'system', title: 'Manutenção', desc: 'O sistema estará offline esta madrugada.', time: 'Ontem', read: true },
  { id: 5, type: 'system', title: 'Bem-vindo!', desc: 'O teu perfil foi criado com sucesso.', time: 'Há 3 dias', read: true },
  { id: 6, type: 'system', title: 'Notificação Extra', desc: 'Esta notificação não deve aparecer no header.', time: 'Há 4 dias', read: true },
];

function HeaderNotifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const displayNotifications = notifications.slice(0, 5);

  const markAllAsRead = (e) => {
    e.stopPropagation();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item) => {
    setNotifications(notifications.map(n => n.id === item.id ? { ...n, read: true } : n));
    setPopoverOpen(false);

    if (item.type === 'institution_post') {
      navigate('/posts', { state: { autoOpenPostUid: item.postId } });
    } else if (item.type === 'message') {
      navigate('/messages', {
        state: { autoOpenFriend: { uid: item.senderUid, name: item.title, username: item.username } }
      });
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'institution_post': return <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#50a063' }} />;
      case 'message': return <Avatar icon={<MessageOutlined />} style={{ backgroundColor: '#8A6AA2' }} />;
      case 'security': return <Avatar icon={<SafetyOutlined />} style={{ backgroundColor: '#FDBA3C' }} />;
      default: return <Avatar icon={<NotificationOutlined />} style={{ backgroundColor: '#bfbfbf' }} />;
    }
  };

  const handleOpenNotifications = () => {
    setPopoverOpen(false);
    navigate('/notifications');
  };

  const popoverContent = (
    <div className="header-notifications__content">
      <div className="header-notifications__header">
        <Text strong style={{ fontSize: 16 }}>Notificações</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllAsRead} icon={<IoCheckmarkDoneSharp />}>
            Marcar todas lidas
          </Button>
        )}
      </div>

      <List
        className="header-notifications__list"
        itemLayout="horizontal"
        dataSource={notifications}
        locale={{ emptyText: 'Não tens novas notificações.' }}
        renderItem={(item) => (
          <List.Item
            onClick={() => handleNotificationClick(item)}
            style={{ cursor: 'pointer' }}
            className={`header-notifications__item ${!item.read ? 'header-notifications__item--unread' : ''}`}
          >
            <List.Item.Meta
              avatar={getIconForType(item.type)}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Text strong={!item.read}>{item.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                </div>
              }
              description={<Text type="secondary" style={{ fontSize: 13 }}>{item.desc}</Text>}
            />
            {!item.read && <div className="header-notifications__dot" />}
          </List.Item>
        )}
      />

      <div className="header-notifications__footer">
        <Button
          type="link"
          onClick={handleOpenNotifications}
          block>Ver todas as notificações
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      trigger="click"
      placement="bottomRight"
      overlayClassName="header-notifications__popover"
      arrow={false}
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
    >
      <div className="header-notifications__trigger">
        <Badge count={unreadCount} size="small" offset={[-2, 4]} color="#FDBA3C">
          <BellOutlined style={{ fontSize: 18 }} />
        </Badge>
      </div>
    </Popover>
  );
}

export default HeaderNotifications;