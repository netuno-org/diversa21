import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Popover, List, Typography, Avatar, Button } from 'antd';
import { BellOutlined, MessageOutlined, SafetyOutlined, NotificationOutlined, FileTextOutlined } from '@ant-design/icons';
import { IoCheckmarkDoneSharp } from "react-icons/io5";

import _service from '@netuno/service-client';

import usePeople from "../../common/usePeople.js";

import './index.less';

const { Text } = Typography;

function HeaderNotifications() {
  const loggedUser = usePeople();

  const MOCK_NOTIFICATIONS = loggedUser.canChangeUserGroup() ?
    [
      {
        id: 1,
        type: 'message',
        title: '@test',
        desc: 'Enviou-te uma nova mensagem.',
        time: 'Há 5 min',
        read: false,
        username: 'test'
      },
      {
        id: 2,
        type: 'security',
        title: 'Novo Acesso',
        desc: 'Sessão iniciada num novo dispositivo.',
        time: 'Há 2 horas',
        read: false
      },
      {
        id: 3,
        type: 'system',
        title: 'Manutenção',
        desc: 'O sistema estará offline esta madrugada.',
        time: 'Ontem',
        read: true
      },
      {
        id: 4,
        type: 'system',
        title: 'Bem-vindo!',
        desc: 'O teu perfil foi criado com sucesso.',
        time: 'Há 3 dias',
        read: true
      },
    ] : [];

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const displayNotifications = notifications.slice(0, 5);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    _service({
      url: 'notification/list',
      success: (response) => {
        const { items } = response.json.data;
        items.forEach(n => {
          n.id = n.uid;
          n.read = Boolean(n.read_at); 
          n.time = n.sent_at;
          if (n.type === 'institution-post') {
            n.desc = n.title;
            n.title = '@' + n.originator.username;
            n.username = '@' + n.originator.username;
            n.postId = n.extra.postUid;
          }
        });
        setNotifications(notifications => [...notifications, ...items]);
      },
      fail: () => {
      }
    })
  };

  const markAllAsRead = (e) => {
    e.stopPropagation();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item) => {
    setNotifications(notifications.map(n => n.id === item.id ? { ...n, read: true } : n));
    setPopoverOpen(false);

    if (item.type === 'institution-post') {
      navigate('/posts', { state: { autoOpenPostUid: item.postId } });
    } else if (item.type === 'message') {
      navigate('/messages', {
        state: { autoOpenFriend: { uid: item.senderUid, name: item.title, username: item.username } }
      });
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'institution-post': return <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#50a063' }} />;
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
