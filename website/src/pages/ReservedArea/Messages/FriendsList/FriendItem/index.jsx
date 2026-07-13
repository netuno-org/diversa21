import React, { useState, useEffect } from "react";
import { Avatar, Typography, Badge, Col } from "antd";
import _service from "@netuno/service-client";

import "./index.less";

const { Text } = Typography;

function FriendItem({ uid, name, avatar, isActive, onClick, unreadMessages }) {

  const avatarSrc = avatar
    ? _service.url(`/asset?uid=${uid}&type=avatar&entity=people&${new Date().getTime()}`)
    : '/images/profile-default.png';

  return (
    <li
      onClick={onClick}
      className={`messages__friend-item ${isActive ? 'messages__friend-item--active' : ''}`}
    >
      <div className="messages__friend-item-avatar-wrapper">
        <Avatar size={48} src={avatarSrc} shape="square" />
      </div>

      <div className="messages__friend-item-info">

        <div className="messages__friend-item__count">
          <Text strong className="messages__friend-item-name">
            {name}
          </Text>
          <Col flex="50px">
            {unreadMessages > 0 &&
              <div>
                <Badge color="green" count={unreadMessages} />
              </div>
            }
          </Col>
        </div>

        <Text className="messages__friend-item-preview">
          Toque para ver as mensagens...
        </Text>

      </div>
    </li>
  );
}

export default FriendItem;
