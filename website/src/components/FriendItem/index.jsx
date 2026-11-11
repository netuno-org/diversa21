import React from "react";

import { Avatar, Typography, Badge, Col, Button, Popconfirm, Row } from "antd";
import _service from "@netuno/service-client";

import TimeAgo from "../TimeAgo";

import "./index.less";
import { DeleteOutlined } from "@ant-design/icons";
import globalNotification from "../../common/globalNotification";

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
  loadChats,
}) {
  const avatarSrc = avatar
    ? _service.url(`/asset?uid=${uid}&type=avatar&entity=people&${new Date().getTime()}`)
    : "/images/profile-default.png";

  const handleDelete = (e, uid) => {
    e.stopPropagation();
    _service({
      method: "DELETE",
      url: `/message/chat?partner_uid=${uid}`,
      success: () => {
        globalNotification.success({
          title: "Conversas",
          description: "Conversa removida com sucesso.",
        });
        loadChats();
      },
      fail: () => {
        globalNotification.serviceFail({
          title: "Conversas",
          description: "Não foi possível apagar a conversa.",
        });
      },
    });
  };

  return (
    <li
      onClick={onClick}
      className={`messages__friend-item ${isActive ? "messages__friend-item--active" : ""}`}
    >
      <div className="messages__friend-item-avatar-wrapper">
        {
          status &&
          <div
            className="messages__friend-item-status"
            style={{
              backgroundColor: "#49aa19",
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
              <Badge color="#FEAF04" count={unreadMessages} />
            )}
          </Col>
        </div>
        <Text className="messages__friend-item-preview">
          {lastMessage || "Ainda não há mensagens."}
        </Text>
        <Row>
          <Col>
            <TimeAgo sentAt={lastMessageAt} className="messages__friend-item-time" />
          </Col>
          <Col>
            {lastMessage && (
              < Popconfirm
                title="Apagar conversa"
                description="Tens certeza que pretendes apagar essa conversa inteira?"
                okText="Sim"
                cancelText="Não"
                onConfirm={(e) => handleDelete(e, uid)}
                onPopupClick={(e) => e.stopPropagation()}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  className="messages__friends-list__item__delete-btn "
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            )}
          </Col>
        </Row>
      </div>
    </li>
  );
}

export default FriendItem;
