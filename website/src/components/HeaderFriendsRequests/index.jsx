import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Popover, Typography, Avatar, Button, Spin, Empty, Space } from 'antd';
import { UserAddOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { IoCheckmarkDoneSharp } from "react-icons/io5";

import _service from '@netuno/service-client';
import usePeople from "../../common/usePeople.js";
import useNotifications from "../../common/useNotifications.js";

import './index.less';

const { Text } = Typography;

const FRIEND_REQUEST_TYPES = ['friend-request', 'friend-request-accepted'];

function HeaderFriendsRequests() {
  const loggedUser = usePeople();
  const navigate = useNavigate();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [processing, setProcessing] = useState({});

  const {
    notifications,
    loading,
    markAllAsRead,
    onNotificationClick,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useNotifications(loggedUser);

  const friendRequests = notifications.filter(n => FRIEND_REQUEST_TYPES.includes(n.type));

  const unreadCount = friendRequests.filter(n => !n.read).length;

  const handleMarkAll = (e) => {
    e.stopPropagation();
    FRIEND_REQUEST_TYPES.forEach(type => markAllAsRead(type));
  };

  const handleItemClick = (item) => {
    setPopoverOpen(false);
    onNotificationClick(item, navigate);
  };

  const handleAccept = async (e, item) => {
    e.stopPropagation();
    setProcessing(prev => ({ ...prev, [item.id]: 'accept' }));
    try {
      acceptFriendRequest && acceptFriendRequest(item);
    } finally {
      setProcessing(prev => ({ ...prev, [item.id]: null }));
    }
  };

  const handleReject = async (e, item) => {
    e.stopPropagation();
    setProcessing(prev => ({ ...prev, [item.id]: 'reject' }));
    try {
      rejectFriendRequest && rejectFriendRequest(item);
    } finally {
      setProcessing(prev => ({ ...prev, [item.id]: null }));
    }
  };

  const popoverContent = (
    <div className="header-friends-requests__content">
      <div className="header-friends-requests__header">
        <Text strong style={{ fontSize: 16 }}>Pedidos de Amizade</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAll} icon={<IoCheckmarkDoneSharp />}>
            Marcar todas lidas
          </Button>
        )}
      </div>

      <div className="header-friends-requests__list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}><Spin /></div>
        ) : friendRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#999' }}>
            <Empty description="Não há pedidos de amizade." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          friendRequests.map((item) => {
            const isPending = item.type === 'friend-request';
            const itemProcessing = processing[item.id];

            return (
              <div
                key={item.id}
                className={`header-friends-requests__item ${!item.read ? 'header-friends-requests__item--unread' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                <div className="header-friends-requests__item-avatar">
                  <Avatar
                    size={40}
                    src={
                      item.originator?.uid
                        ? _service.url(`/asset?uid=${item.originator.uid}&type=avatar&entity=people&${new Date().getTime()}`)
                        : "/images/profile-default.png"
                    }
                  />
                </div>
                <div className="header-friends-requests__item-content">
                  <div className="header-friends-requests__item-title-row">
                    <Text strong={!item.read}>{item.title}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>
                    {item.desc}
                  </Text>

                  {isPending && (
                    <Space size="small" style={{ marginTop: 8 }}>
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckOutlined />}
                        loading={itemProcessing === 'accept'}
                        disabled={!!itemProcessing}
                        onClick={(e) => handleAccept(e, item)}
                      >
                        Aceitar
                      </Button>
                      <Button
                        size="small"
                        icon={<CloseOutlined />}
                        loading={itemProcessing === 'reject'}
                        disabled={!!itemProcessing}
                        onClick={(e) => handleReject(e, item)}
                      >
                        Recusar
                      </Button>
                    </Space>
                  )}
                </div>
                {!item.read && <div className="header-friends-requests__dot" />}
              </div>
            );
          })
        )}
      </div>
      <div className="header-friends-requests__footer">
        <Button type="link" onClick={() => { setPopoverOpen(false); navigate('/friends/requests'); }} block>
          Ver todos
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={popoverContent} trigger="click" placement="bottomRight"
      overlayClassName="header-friends-requests__popover" arrow={false}
      open={popoverOpen} onOpenChange={setPopoverOpen}
    >
      <div className="header-friends-requests__trigger">
        <Badge count={unreadCount} size="small" offset={[-2, 4]} color="#FDBA3C">
          <UserAddOutlined style={{ fontSize: 18 }} />
        </Badge>
      </div>
    </Popover>
  );
}

export default HeaderFriendsRequests;