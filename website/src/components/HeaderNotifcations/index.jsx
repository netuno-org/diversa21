import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Popover, Typography, Avatar, Button, Spin, Empty } from 'antd';
import {
  BellOutlined, FileTextOutlined, CommentOutlined,
  HeartOutlined, NotificationOutlined, SafetyOutlined
} from '@ant-design/icons';
import { IoCheckmarkDoneSharp } from "react-icons/io5";

import _service from '@netuno/service-client';
import usePeople from "../../common/usePeople.js";
import useNotifications from "../../common/useNotifications.js";

import './index.less';

const { Text } = Typography;

function HeaderNotifications() {
  const loggedUser = usePeople();
  const navigate = useNavigate();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { notifications, loading, markAllAsRead, onNotificationClick } = useNotifications(loggedUser);

  const generalNotifications = notifications.filter(n =>
    !['message', 'friend-request', 'friend-request-accepted'].includes(n.type)
  );

  const unreadCount = generalNotifications.filter(n => !n.read).length;

  const getTypeBadge = (type) => {
    let icon;
    let color;
    switch (type) {
      case 'institution-post':
      case 'friend-post':
        icon = <FileTextOutlined style={{ fontSize: 10 }} />; color = '#50a063'; break;
      case 'my-post-comment':
      case 'institution-comment':
      case 'friend-comment':
        icon = <CommentOutlined style={{ fontSize: 10 }} />; color = '#1890ff'; break;
      case 'my-post-like':
      case 'institution-like':
      case 'friend-like':
        icon = <HeartOutlined style={{ fontSize: 10 }} />; color = '#eb2f96'; break;
      case 'security':
        icon = <SafetyOutlined style={{ fontSize: 10 }} />; color = '#fa8c16'; break;
      default:
        icon = <NotificationOutlined style={{ fontSize: 10 }} />; color = '#bfbfbf'; break;
    }
    return <Avatar size={18} style={{ backgroundColor: color, border: '2px solid #fff' }} icon={icon} />;
  };

  const handleMarkAll = (e) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const handleNotificationClick = (item) => {
    setPopoverOpen(false);
    onNotificationClick(item, navigate);
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
          <div style={{ textAlign: 'center', padding: '24px 0' }}><Spin /></div>
        ) : generalNotifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#999' }}>
            <Empty description="Não há notificações." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          generalNotifications.map((item) => (
            <div
              key={item.id}
              className={`header-notifications__item ${!item.read ? 'header-notifications__item--unread' : ''}`}
              onClick={() => handleNotificationClick(item)}
            >
              <div className="header-notifications__item-avatar">
                <Badge count={getTypeBadge(item.type)} offset={[-4, 32]}>
                  <Avatar
                    size={40}
                    src={
                      item.originator?.uid
                        ? _service.url(`/asset?uid=${item.originator.uid}&type=avatar&entity=people&${new Date().getTime()}`)
                        : "/images/profile-default.png"
                    }
                  />
                </Badge>
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
        <Button type="link" onClick={() => { setPopoverOpen(false); navigate('/notifications'); }} block>
          Ver todas
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={popoverContent} trigger="click" placement="bottomRight"
      overlayClassName="header-notifications__popover" arrow={false}
      open={popoverOpen} onOpenChange={setPopoverOpen}
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