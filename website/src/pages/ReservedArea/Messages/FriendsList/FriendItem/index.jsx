import React from "react";
import TimeAgo from '../../../../../components/TimeAgo'

import { Avatar, Typography, Badge, Col } from "antd";
import _service from "@netuno/service-client";

import "./index.less";

const { Text } = Typography;

function FriendItem({
  uid,
  name,
  avatar,
  status,
  isActive,
  onClick,
  unreadMessages,
  lastMessage,
  lastMessageAt,
}) {
  const avatarSrc = avatar
    ? _service.url(`/asset?uid=${uid}&type=avatar&entity=people&${new Date().getTime()}`)
    : '/images/profile-default.png';

  return (
    <li
      onClick={onClick}
      className={`messages__friend-item ${isActive ? 'messages__friend-item--active' : ''}`}
    >
      <div className="messages__friend-item-avatar-wrapper">
        {
          status &&
          <div
            className="messages__friend-item-status"
            style={{
              backgroundColor: '#49aa19',
            }}
          />
        }
        <Avatar size={48} src={avatarSrc} shape="square" />
      </div>
      <div className="messages__friend-item-info">
        <div className="messages__friend-item__count">
          <Text strong className="messages__friend-item-name">
            {name}
          </Text>
          <Col flex="auto" className="messages__friend-item-meta">
            {unreadMessages > 0 && (
              <Badge color="green" count={unreadMessages} />
            )}
          </Col>
        </div>
        <Text className="messages__friend-item-preview">
          {lastMessage || "Ainda não há mensagens."}
        </Text>
        <TimeAgo sentAt={lastMessageAt} className="messages__friend-item-time" />
      </div>
    </li>
  );
}

export default FriendItem;
