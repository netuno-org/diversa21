import React from "react";
import { Avatar, Typography } from "antd";
import _service from "@netuno/service-client";

import "./index.less";

const { Text } = Typography;

function FriendItem({ uid, name, avatar, isActive, onClick }) {
  const avatarSrc = avatar
    ? _service.url(`/asset?uid=${uid}&assetName=avatar&entityName=people&${new Date().getTime()}`)
    : '/images/profile-default.png';

  return (
    <li
      onClick={onClick}
      className={`messages__friend-item ${isActive ? 'messages__friend-item--active' : ''}`}
    >
      <div className="messages__friend-item-avatar-wrapper">
        <Avatar size={48} src={avatarSrc} shape="square" />
        <span className="messages__friend-item-status"></span>
      </div>

      <div className="messages__friend-item-info">
        <Text strong className="messages__friend-item-name">
          {name}
        </Text>

        <Text className="messages__friend-item-preview">
          Toque para ver as mensagens...
        </Text>
      </div>
    </li>
  );
}

export default FriendItem;
