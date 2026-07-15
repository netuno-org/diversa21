import React from "react";
import { Avatar, Typography, Badge, Col } from "antd";
import _service from "@netuno/service-client";
import dayjs from "dayjs";

import "./index.less";

const { Text } = Typography;

function formatRelativeTime(sentAt) {
  if (!sentAt) {
    return ''
  };
  const date = dayjs(sentAt);
  if (!date.isValid()) {
    return ""
  };
  const minutes = dayjs().diff(date, "minute");
  if (minutes < 1) {
    return "Enviada agora"
  };
  if (minutes < 60) {
    return `Enviada à ${minutes} min`
  };
  const hours = dayjs().diff(date, "hour");
  if (hours < 24) {
    return `Enviada à ${hours} h`
  };
  const days = dayjs().diff(date, "day");
  if (days < 7) {
    return `Enviada à ${days} d`
  };
  return date.format("DD/MM");
}

function FriendItem({
  uid,
  name,
  avatar,
  status,
  isActive,
  onClick,
  unreadMessages,
  lastMessageAt,
}) {
  const avatarSrc = avatar
    ? _service.url(`/asset?uid=${uid}&type=avatar&entity=people&${new Date().getTime()}`)
    : '/images/profile-default.png';

  const timeLabel = formatRelativeTime(lastMessageAt);

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
          Toque para ver as mensagens...
        </Text>
        {timeLabel && (
          <Text type="secondary" className="messages__friend-item-time">
            {timeLabel}
          </Text>
        )}
      </div>
    </li>
  );
}

export default FriendItem;
