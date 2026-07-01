import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Popover, Typography, Avatar, Button, Spin, Empty } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { IoCheckmarkDoneSharp } from "react-icons/io5";

import _service from '@netuno/service-client';
import usePeople from "../../common/usePeople.js";
import useNotifications from "../../common/useNotifications.js";

import './index.less';

const { Text } = Typography;

function HeaderMessages() {
  const loggedUser = usePeople();
  const navigate = useNavigate();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { notifications, loading, markAllAsRead, onNotificationClick } = useNotifications(loggedUser);

  const messageNotifications = notifications.filter(n => n.type === 'message');

  const unreadCount = messageNotifications.filter(n => !n.read).length;

  const handleMarkAll = (e) => {
    e.stopPropagation();
    markAllAsRead('message');
  };

  const handleMessageClick = (item) => {
    setPopoverOpen(false);
    onNotificationClick(item, navigate);
  };

  const popoverContent = (
    <div className="header-messages__content">
      <div className="header-messages__header">
        <Text strong style={{ fontSize: 16 }}>Mensagens</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAll} icon={<IoCheckmarkDoneSharp />}>
            Marcar todas lidas
          </Button>
        )}
      </div>

      <div className="header-messages__list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}><Spin /></div>
        ) : messageNotifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#999' }}>
            <Empty description="Não há mensagens." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          messageNotifications.map((item) => (
            <div
              key={item.id}
              className={`header-messages__item ${!item.read ? 'header-messages__item--unread' : ''}`}
              onClick={() => handleMessageClick(item)}
            >
              <div className="header-messages__item-avatar">
                <Avatar
                  size={40}
                  src={
                    item.originator?.uid
                      ? _service.url(`/asset?uid=${item.originator.uid}&type=avatar&entity=people&${new Date().getTime()}`)
                      : "/images/profile-default.png"
                  }
                />
              </div>
              <div className="header-messages__item-content">
                <div className="header-messages__item-title-row">
                  <Text strong={!item.read}>{item.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 13, display: 'block' }} ellipsis>
                  {item.desc}
                </Text>
              </div>
              {!item.read && <div className="header-messages__dot" />}
            </div>
          ))
        )}
      </div>
      <div className="header-messages__footer">
        <Button type="link" onClick={() => { setPopoverOpen(false); navigate('/messages'); }} block>
          Ver todas
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={popoverContent} trigger="click" placement="bottomRight"
      overlayClassName="header-messages__popover" arrow={false}
      open={popoverOpen} onOpenChange={setPopoverOpen}
    >
      <div className="header-messages__trigger">
        <Badge count={unreadCount} size="small" offset={[-2, 4]} color="#FDBA3C">
          <MessageOutlined style={{ fontSize: 18 }} />
        </Badge>
      </div>
    </Popover>
  );
}

export default HeaderMessages;