import React, { useState } from "react";
import { Avatar, Typography, Dropdown, Button, Input, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import _service from "@netuno/service-client";

import "./index.less";

import dayjs from "dayjs";

const { Text } = Typography;

function Message({ friend, data, onDelete, onEdit, showTime, showRead }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editText, setEditText] = useState(data.message || data.text || "");

  const messageText = data.message || data.text;
  const isIncoming = friend.uid === data.from;

  const messageTime = data.sent_at
    ? dayjs(data.sent_at).format("DD/MM/YYYY HH:mm")
    : "";

  const readTime = data.read_at
    ? dayjs(data.read_at).format("HH:mm")
    : "";

  const handleSaveEdit = () => {
    if (editText.trim() !== "" && editText !== messageText) {
      onEdit && onEdit(data.uid, editText);
    }
    setIsEditing(false);
  };

  const menuItems = [
    {
      key: 'edit',
      label: 'Editar',
      icon: <EditOutlined />,
      onClick: () => setIsEditing(true)
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => setShowDeleteConfirm(true)
    }
  ];

  return (
    <li className={`messages__message ${isIncoming ? 'messages__message--incoming' : 'messages__message--outgoing'}`}>
      {showTime && (
        <Text type="secondary" className="messages__message-time">
          {messageTime}
        </Text>
      )}

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
          {isEditing ? (
            <div className="messages__message-edit-wrapper">
              <Input.TextArea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoSize={{ minRows: 1, maxRows: 3 }}
                className="messages__message-edit-input"
              />
              <div className="messages__message-edit-buttons">
                <Button
                  size="small"
                  type="primary"
                  onClick={handleSaveEdit}
                  className="messages__message-edit-btn-save"
                >
                  Salvar
                </Button>
                <Button
                  size="small"
                  onClick={() => setIsEditing(false)}
                  className="messages__message-edit-btn-cancel"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Popconfirm
              title="Eliminar mensagem?"
              open={showDeleteConfirm}
              onConfirm={() => {
                onDelete && onDelete(data.uid);
                setShowDeleteConfirm(false);
              }}
              onCancel={() => setShowDeleteConfirm(false)}
              okText="Sim"
              cancelText="Não"
              placement="left"
            >
              <Dropdown
                menu={{ items: menuItems }}
                trigger={['click']}
                placement="bottomRight" disabled={isIncoming}
              >
                <div className="messages__message-bubble" style={{ cursor: isIncoming ? 'default' : 'pointer' }}>
                  <Text className="messages__message-text">
                    {messageText}
                  </Text>
                </div>
              </Dropdown>
            </Popconfirm>
          )}

          {!isIncoming && readTime && showRead && (
            <div className="messages__message-meta">
              <Text type="secondary" className="messages__message-read">
                Lida às {readTime}
              </Text>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default Message;
