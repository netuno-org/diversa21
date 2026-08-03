import React, { useState, useRef } from "react";
import { Avatar, Typography, Dropdown, Button, Input, Popconfirm, Popover, Space } from "antd";
import { EditOutlined, DeleteOutlined, SmileOutlined, PlusOutlined, EnterOutlined } from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";
import ptEmojis from "emoji-picker-react/dist/data/emojis-pt";
import _service from "@netuno/service-client";
import Config from "../../../../../../common/Config";

import "./index.less";

import dayjs from "dayjs";

const { Text } = Typography;

function Message({ friend, data, onDelete, onEdit, onReact, onReply, onLoadPreviousPage, showTime, showRead }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reactionPopoverOpen, setReactionPopoverOpen] = useState(false);
  const [editText, setEditText] = useState(data.message || data.text || "");
  const editTextAreaRef = useRef(null);

  const messageText = data.message || data.text;
  const isIncoming = friend.uid === data.from;
  const serverTimezone = Config.timezone();

  let messageMoment = dayjs.tz(data.sent_at, serverTimezone).tz(dayjs.tz.guess());
  let readMoment = dayjs.tz(data.read_at, serverTimezone).tz(dayjs.tz.guess());

  const scrollToParent = (parentUid) => {
    if (!parentUid) return;
    const parentEl = document.getElementById(`message-${parentUid}`);
    if (parentEl) {
      parentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      parentEl.classList.add('messages__message--highlight');
      setTimeout(() => {
        parentEl.classList.remove('messages__message--highlight');
      }, 6000);
    } else if (onLoadPreviousPage) {
      onLoadPreviousPage(parentUid, (found) => {
        if (found) {
          setTimeout(() => {
            const targetEl = document.getElementById(`message-${parentUid}`);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              targetEl.classList.add('messages__message--highlight');
              setTimeout(() => {
                targetEl.classList.remove('messages__message--highlight');
              }, 6000);
            }
          }, 100);
        }
      });
    }
  };

  const handleEmojiClick = (emojiData) => {
    const text = editText || "";
    const emoji = emojiData.emoji;

    let selectionStart = text.length;
    let selectionEnd = text.length;

    const textarea = editTextAreaRef.current?.resizableTextArea?.textArea;
    if (textarea) {
      selectionStart = textarea.selectionStart;
      selectionEnd = textarea.selectionEnd;
    }

    const updatedText = text.substring(0, selectionStart) + emoji + text.substring(selectionEnd);
    setEditText(updatedText);

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const cursorPosition = selectionStart + emoji.length;
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 10);
  };

  const handleSaveEdit = () => {
    if (editText.trim() !== "" && editText !== messageText) {
      onEdit && onEdit(data.uid, editText);
    }
    setIsEditing(false);
  };

  const isEditAllowed = new Date().getTime() - messageMoment.valueOf() <= 3600000;

  const getEmojiSegments = (text) => {
    if (!text) return [];
    if (typeof Intl.Segmenter === "function") {
      const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
      return Array.from(segmenter.segment(text)).map((s) => s.segment);
    }
    return Array.from(text);
  };

  const menuItems = [
    ...(data.parent ? [{
      key: 'view-original',
      label: 'Ver original',
      icon: <EnterOutlined style={{ transform: 'rotate(90deg)' }} />,
      onClick: () => scrollToParent(data.parent.uid)
    }] : []),
    ...(isEditAllowed ? [{
      key: 'edit',
      label: 'Editar',
      icon: <EditOutlined />,
      onClick: () => setIsEditing(true)
    }] : []),
    {
      key: 'delete',
      label: 'Eliminar',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => setShowDeleteConfirm(true)
    }
  ];

  const incomingMenuItems = [
    {
      key: 'react',
      label: 'Reagir...',
      icon: <SmileOutlined />,
      onClick: () => setReactionPopoverOpen(true)
    },
    {
      key: 'reply',
      label: 'Responder',
      icon: <EnterOutlined style={{ transform: 'scaleX(-1)' }} />,
      onClick: () => onReply && onReply(data)
    },
    ...(data.parent ? [{
      key: 'view-original',
      label: 'Ver original',
      icon: <EnterOutlined style={{ transform: 'rotate(90deg)' }} />,
      onClick: () => scrollToParent(data.parent.uid)
    }] : [])
  ];

  return (
    <li id={`message-${data.uid}`} className={`messages__message ${isIncoming ? 'messages__message--incoming' : 'messages__message--outgoing'}`}>
      {showTime && (
        <Text type="secondary" className="messages__message-time">
          {messageMoment.format("DD/MM/YYYY HH:mm")}
        </Text>
      )}

      <div className="messages__message-row">
        <div className="messages__message-content">
          {isEditing ? (
            <div className="messages__message-edit-wrapper">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Input.TextArea
                  ref={editTextAreaRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  className="messages__message-edit-input"
                  style={{ flex: 1 }}
                />
                <Popover
                  content={
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      skinTonesDisabled={false}
                      previewConfig={{ showPreview: false }}
                      emojiData={ptEmojis}
                      searchPlaceholder="Pesquisar..."
                      height="360px"
                      width="310px"
                    />
                  }
                  trigger="click"
                  placement="topRight"
                  overlayClassName="messages__chat-emoji-popover"
                >
                  <Button
                    type="text"
                    shape="circle"
                    icon={<SmileOutlined />}
                    style={{ fontSize: 18, color: '#8c8c8c' }}
                  />
                </Popover>
              </div>
              <div className="messages__message-edit-buttons">
                <Button
                  size="small"
                  type="primary"
                  onClick={handleSaveEdit}
                  className="messages__message-edit-btn-save"
                >
                  Salvar
                </Button>
                <Popconfirm
                  title="Cancelar edição?"
                  description="Todas as alterações não guardadas serão perdidas."
                  onConfirm={() => setIsEditing(false)}
                  okText="Sim"
                  cancelText="Não"
                  placement="top"
                >
                  <Button
                    size="small"
                    className="messages__message-edit-btn-cancel"
                  >
                    Cancelar
                  </Button>
                </Popconfirm>
              </div>
            </div>
          ) : (
            <div className="messages__message-bubble-wrapper" style={{ position: 'relative' }}>
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
                {isIncoming && !data.deleted_at ? (
                  <Popover
                    content={
                      <div style={{ margin: '-12px' }} onClick={(e) => e.stopPropagation()}>
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            const rawReaction = data.reaction || "";
                            const currentReaction = rawReaction.replace(/\uFE0F/g, "");
                            const clickedEmoji = emojiData.emoji;
                            const clickedEmojiNormalized = clickedEmoji.replace(/\uFE0F/g, "");

                            const updated = currentReaction === clickedEmojiNormalized ? "" : clickedEmoji;

                            setReactionPopoverOpen(false);
                            onReact && onReact(data.uid, updated);
                          }}
                          skinTonesDisabled={false}
                          previewConfig={{ showPreview: false }}
                          emojiData={ptEmojis}
                          searchPlaceholder="Pesquisar..."
                          height="360px"
                          width="310px"
                        />
                      </div>
                    }
                    trigger="contextMenu"
                    open={reactionPopoverOpen}
                    onOpenChange={(visible) => {
                      setReactionPopoverOpen(visible);
                    }}
                    placement="top"
                    overlayClassName="messages__chat-emoji-popover"
                  >
                    <Dropdown
                      menu={{ items: incomingMenuItems }}
                      trigger={['click']}
                      placement="bottomRight"
                      style={{ minWidth: 0, width: '100%' }}
                    >
                      <div
                        className={`messages__message-bubble ${data.deleted_at ? 'messages__message-bubble--deleted' : ''}`}
                        style={{ cursor: 'pointer', minWidth: 0, width: '100%' }}
                      >
                        {!data.deleted_at && data.parent && (
                          <div className="messages__message-reply-quote">
                            <span className="messages__message-reply-quote-sender">
                              {data.parent.from || "Usuário"}
                            </span>
                            <span className="messages__message-reply-quote-text">
                              {data.parent.message}
                            </span>
                          </div>
                        )}
                        <Text className="messages__message-text" style={{ wordBreak: 'break-all', display: 'block' }}>
                          {messageText.replace(/[^\S\n]{4,}/g, "   ").replace(/\n{2,}/g, "\n\n").trim()}
                        </Text>
                        {!data.deleted_at && (
                          <div className="messages__message-bubble-meta">
                            <span className="messages__message-bubble-meta-text">
                              {messageMoment.format("HH:mm")}
                              {data.edited_at ? " (editada)" : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </Dropdown>
                  </Popover>
                ) : (
                  <Dropdown
                    menu={{ items: menuItems }}
                    trigger={['click']}
                    placement="bottomRight"
                    disabled={!!data.deleted_at}
                    style={{ minWidth: 0, width: '100%' }}
                  >
                    <div
                      className={`messages__message-bubble ${data.deleted_at ? 'messages__message-bubble--deleted' : ''}`}
                      style={{ cursor: data.deleted_at ? 'default' : 'pointer', minWidth: 0, width: '100%' }}
                    >
                      {data.deleted_at ? (
                        <Text italic type="secondary" className="messages__message-text" style={{ wordBreak: 'break-all', display: 'block' }}>
                          Mensagem apagada
                        </Text>
                      ) : (
                        <>
                          {data.parent && (
                            <div className="messages__message-reply-quote">
                              <span className="messages__message-reply-quote-sender">
                                {data.parent.from || "Usuário"}
                              </span>
                              <span className="messages__message-reply-quote-text">
                                {data.parent.message}
                              </span>
                            </div>
                          )}
                          <Text className="messages__message-text" style={{ wordBreak: 'break-all', display: 'block' }}>
                            {messageText.replace(/[^\S\n]{4,}/g, "   ").replace(/\n{2,}/g, "\n\n").trim()}
                          </Text>
                          {((readMoment && showRead) || data.edited_at) && (
                            <div className="messages__message-bubble-meta">
                              <span className="messages__message-bubble-meta-text">
                                {readMoment && showRead ? `Lida às ${readMoment.format("HH:mm")}` : ""}
                                {data.edited_at ? " (editada)" : ""}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </Dropdown>
                )}
              </Popconfirm>

              {!data.deleted_at && data.reaction && (
                <div
                  className="messages__message-reaction-badge"
                  style={{
                    [isIncoming ? 'left' : 'right']: '-2px'
                  }}
                >
                  <span>{data.reaction}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default Message;
