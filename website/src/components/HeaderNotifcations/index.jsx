import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Popover, Typography, Avatar, Button, Spin, Empty } from 'antd';
import { BellOutlined, MessageOutlined, SafetyOutlined, NotificationOutlined, FileTextOutlined, CommentOutlined, UserAddOutlined, TeamOutlined } from '@ant-design/icons';
import { IoCheckmarkDoneSharp } from "react-icons/io5";

import usePeople from "../../common/usePeople.js";
import useNotifications from "../../common/useNotifications.js";

import './index.less';

const { Text } = Typography;

function HeaderNotifications() {
  const loggedUser = usePeople();
  const navigate = useNavigate();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { notifications, loading, markAllAsRead, onNotificationClick } = useNotifications(loggedUser);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIconForType = (type) => {
    switch (type) {
      case 'institution-post': return <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#50a063' }} />;
      case 'my-post-comment': return <Avatar icon={<CommentOutlined />} style={{ backgroundColor: '#1890ff' }} />;
      case 'friend-request': return <Avatar icon={<UserAddOutlined />} style={{ backgroundColor: '#fa8c16' }} />;
      case 'friend-request-accepted': return <Avatar icon={<TeamOutlined />} style={{ backgroundColor: '#52c41a' }} />;
      case 'message': return <Avatar icon={<MessageOutlined />} style={{ backgroundColor: '#8A6AA2' }} />;
      case 'security': return <Avatar icon={<SafetyOutlined />} style={{ backgroundColor: '#fa8c16' }} />;
      default: return <Avatar icon={<NotificationOutlined />} style={{ backgroundColor: '#bfbfbf' }} />;
    }
  };

  const handleMarkAll = (e) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const handleNotificationClick = (item) => {
    setPopoverOpen(false);
    onNotificationClick(item, navigate);
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
          <Button type="link" size="small" onClick={handleMarkAll} icon={<IoCheckmarkDoneSharp />}>
            Marcar todas lidas
          </Button>
        )}
      </div>

      <div className="header-notifications__list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#999' }}>
            <Empty description="Não há notificações neste momento." />
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`header-notifications__item ${!item.read ? 'header-notifications__item--unread' : ''}`}
              onClick={() => handleNotificationClick(item)}
              style={{ cursor: 'pointer' }}
            >
              <div className="header-notifications__item-avatar">
                {getIconForType(item.type)}
              </div>
              <div className="header-notifications__item-content">
                <div className="header-notifications__item-title-row">
                  <Text strong={!item.read}>{item.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>
                  {item.desc}
                </Text>
              </div>
              {!item.read && <div className="header-notifications__dot" />}
            </div>
          ))
        )}
      </div>

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
