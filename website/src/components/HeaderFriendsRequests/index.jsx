import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Popover, Typography, Avatar, Button, Spin, Empty, Popconfirm } from 'antd';
import { UserAddOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import TimeAgo from '../TimeAgo';

import _service from '@netuno/service-client';
import usePeople from "../../common/usePeople.js";
import useNotifications from "../../common/useNotifications.js";
import useFriendActions from "../../common/useFriendActions.js";

import './index.less';

const { Text } = Typography;

const FRIEND_REQUEST_TYPES = ['friend-request', 'friend-request-accepted'];

function HeaderFriendsRequests() {
  const loggedUser = usePeople();
  const navigate = useNavigate();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [handledItems, setHandledItems] = useState({});

  const {
    notifications,
    loading,
    markAllAsRead,
    onNotificationClick,
  } = useNotifications(loggedUser);

  const { run, isProcessing } = useFriendActions();

  const friendRequests = notifications.filter(n => FRIEND_REQUEST_TYPES.includes(n.type));
  const unreadCount = friendRequests.filter(n => !n.read).length;

  const handlePopoverChange = (open) => {
    setPopoverOpen(open);
    if (!open) {
      setHandledItems({});
    }
  };

  const handleMarkAll = (e) => {
    e.stopPropagation();
    FRIEND_REQUEST_TYPES.forEach(type => markAllAsRead(type));
  };

  const handleItemClick = (item) => {
    if (handledItems[item.id]) {
      return;
    }
    setPopoverOpen(false);
    onNotificationClick(item, navigate);
  };

  const handleAction = (action, item, resultStatus) => {
    const uid = item?.originator?.uid;
    if (!uid) {
      return;
    }
    run(action, uid, {
      onSuccess: () => {
        setHandledItems(prev => ({ ...prev, [item.id]: resultStatus }));
      },
    });
  };

  const popoverContent = (
    <div className="header-friends-requests__content">
      <div className="header-friends-requests__header">
        <Text strong className="header-friends-requests__title">
          Solicitações de Amizade
        </Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAll} icon={<IoCheckmarkDoneSharp />}>
            Marcar como lidas
          </Button>
        )}
      </div>

      <div className="header-friends-requests__list">
        {loading ? (
          <div className="header-friends-requests__state">
            <Spin />
          </div>
        ) : friendRequests.length === 0 ? (
          <div className="header-friends-requests__state header-friends-requests__state--empty">
            <Empty description="Não há solicitações de amizade." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          friendRequests.map((item) => {
            const handledStatus = handledItems[item.id];
            const isPending = item.type === 'friend-request' && !handledStatus;
            const originatorUid = item.originator?.uid;
            const itemAvatarUrl = (originatorUid && item.originator?.avatar)
              ? _service.url(`/asset?uid=${originatorUid}&type=avatar&entity=people`)
              : "/images/profile-default.png";

            let statusText = null;
            if (handledStatus === "friends") {
              statusText = "Vocês agora são amigos.";
            } else if (handledStatus === "rejected") {
              statusText = "Pedido recusado.";
            }

            const itemClasses = [
              'header-friends-requests__item',
              !item.read ? 'header-friends-requests__item--unread' : '',
              handledStatus ? 'header-friends-requests__item--handled' : '',
            ].filter(Boolean).join(' ');

            return (
              <div
                key={item.id}
                className={itemClasses}
                onClick={() => handleItemClick(item)}
              >
                <div className="header-friends-requests__item-avatar">
                  <Avatar
                    size={48}
                    shape="square"
                    className="header-friends-requests__avatar"
                    src={itemAvatarUrl}
                  />
                </div>
                <div className="header-friends-requests__item-content">
                  <div className="header-friends-requests__item-title-row">
                    <Text strong className="header-friends-requests__username">{item.title}</Text>
                    <div className="header-friends-requests__meta">
                      <TimeAgo sentAt={item.sent_at} className="header-friends-requests__time" />
                      {!item.read && <div className="header-friends-requests__dot" />}
                    </div>
                  </div>
                  <Text type="secondary" className="header-friends-requests__desc">
                    {item.desc}
                  </Text>

                  {statusText && (
                    <Text type="secondary" className="header-friends-requests__status">
                      {statusText}
                    </Text>
                  )}

                  {isPending && (
                    <div className="header-friends-requests__actions">
                      <Popconfirm
                        title="Deseja aceitar o pedido de amizade?"
                        onConfirm={() => handleAction('accept', item, 'friends')}
                        okText="Sim"
                        cancelText="Não"
                      >
                        <Button
                          type="primary"
                          size="middle"
                          icon={<CheckOutlined />}
                          loading={isProcessing(originatorUid, 'accept')}
                          disabled={isProcessing(originatorUid)}
                          onClick={(e) => e.stopPropagation()}
                          className="header-friends-requests__btn"
                        >
                          Aceitar
                        </Button>
                      </Popconfirm>
                      <Popconfirm
                        title="Deseja recusar o pedido de amizade?"
                        onConfirm={() => handleAction('reject', item, 'rejected')}
                        okText="Sim"
                        cancelText="Não"
                      >
                        <Button
                          type="primary"
                          size="middle"
                          icon={<CloseOutlined />}
                          loading={isProcessing(originatorUid, 'reject')}
                          disabled={isProcessing(originatorUid)}
                          onClick={(e) => e.stopPropagation()}
                          className="header-friends-requests__btn profile__secondary-btn"
                        >
                          Recusar
                        </Button>
                      </Popconfirm>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="header-friends-requests__footer">
        <Button
          type="link"
          onClick={() => {
            setPopoverOpen(false);
            navigate('/friends?tab=received-requests');
          }}
          block
        >
          Ver todos
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={popoverContent} trigger="click" placement="bottomRight"
      overlayClassName="header-friends-requests__popover" arrow={false}
      open={popoverOpen} onOpenChange={handlePopoverChange}
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