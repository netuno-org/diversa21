import React from "react";
import { Avatar, Typography } from "antd";
import _service from "@netuno/service-client";

import "./index.less";

import dayjs from "dayjs";

const { Text } = Typography;

function Message({ friend, data }) {
  const messageText = data.message || data.text;
  const isIncoming = friend.uid === data.from;

  const messageTime = data.sent_at
    ? dayjs(data.sent_at).format("DD/MM/YYYY HH:mm")
    : "";
  const readTime = data.read_at
    ? dayjs(data.read_at).format("HH:mm")
    : "";

  return (
    <li className={`messages__message ${isIncoming ? 'messages__message--incoming' : 'messages__message--outgoing'}`}>
      <Text type="secondary" className="messages__message-time">
        {messageTime}
      </Text>

      <div className="messages__message-row">
        {isIncoming && (
          <Avatar
            size={36}
            src={friend.avatar
              ? _service.url(`/asset?uid=${friend.uid}&type=avatar&entity=people&${new Date().getTime()}`)
              : '/images/profile-default.png'}
            shape="square"
            className="messages__message-avatar"
          />
        )}

        <div className="messages__message-content">
          <div className="messages__message-bubble">
            <Text className="messages__message-text">{messageText}</Text>
          </div>

          {!isIncoming && readTime && (
            <div className="messages__message-meta">
              <span className="messages__message-read">Lida às {readTime}</span>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default Message;
