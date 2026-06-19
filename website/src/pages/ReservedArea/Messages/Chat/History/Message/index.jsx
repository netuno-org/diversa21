import React from "react";
import { Avatar, Typography } from "antd";
import _service from "@netuno/service-client";

import "./index.less";

const { Text } = Typography;

function Message({ friend, data }) {
  const messageText = data.message || data.text;
  const messageTime = data.sent_on || data.time || "";

  const isIncoming = friend.uid === data.from;

  return (
    <li className={`messages__message ${isIncoming ? 'messages__message--incoming' : 'messages__message--outgoing'}`}>
      {isIncoming && (
        <div className="messages__message-avatar">
          <Avatar
            size={36}
            src={friend.avatar ? _service.url(`/profile/avatar?uid=${friend.uid}&${new Date().getTime()}`) : '/images/profile-default.png'}
            shape="square"
          />
        </div>
      )}

      <div className="messages__message-content">
        <div className="messages__message-bubble">
          <Text className="messages__message-text">{messageText}</Text>
        </div>

        <div className="messages__message-meta">
          <Text type="secondary" className="messages__message-time">{messageTime}</Text>
          {/* {!isIncoming && data.read_on && <span className="messages__message-read">Lida a {data.read_on}</span>} */}
        </div>
      </div>

    </li>
  );
}

export default Message;