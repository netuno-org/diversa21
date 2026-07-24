import React, { useEffect, useState, useRef } from "react";
import { Form, Input, Button, Typography, Avatar, Empty, Popconfirm, Grid, Popover } from "antd";
import { SendOutlined, CloseOutlined, ArrowLeftOutlined, SmileOutlined } from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";

import _service from "@netuno/service-client";

import _ws from "@netuno/ws-client";
import globalNotification from "../../../../common/globalNotification.js";

import History from "./History";

import "./index.less";

const { TextArea } = Input;
const { Text } = Typography;
const { useBreakpoint } = Grid;

function Chat({ friend, onClose }) {
  const [form] = Form.useForm();
  const [messageSubmitting, setMessageSubmitting] = useState(false);
  const [historyReload, setHistoryReload] = useState(0);
  const [historyApi, setHistoryApi] = useState(null);
  const textAreaRef = useRef(null);

  const screens = useBreakpoint();
  const isMobile = screens.lg === false;

  useEffect(() => {
    setHistoryReload(0);
  }, [friend]);

  const handleEmojiClick = (emojiData) => {
    const message = form.getFieldValue("message") || "";
    const emoji = emojiData.emoji;
    
    let selectionStart = message.length;
    let selectionEnd = message.length;
    
    const textarea = textAreaRef.current?.resizableTextArea?.textArea;
    if (textarea) {
      selectionStart = textarea.selectionStart;
      selectionEnd = textarea.selectionEnd;
    }
    
    const updatedMessage = message.substring(0, selectionStart) + emoji + message.substring(selectionEnd);
    form.setFieldsValue({ message: updatedMessage });
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const cursorPosition = selectionStart + emoji.length;
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 10);
  };

  const onFinish = ({ message }) => {
    const cleanMessage = message.replace(/[^\S\n]{4,}/g, "   ").replace(/\n{6,}/g, "\n\n").trim()

    if (!cleanMessage){
      return;
    } 

    _ws.sendService({
      method: "POST",
      service: "message",
      data: {
        to: friend.uid,
        message: cleanMessage,
      },
      start: () => setMessageSubmitting(true),
      success: (response) => {
        form.resetFields([["message"]]);
        const messageContent = response?.content?.content;
        if (messageContent && historyApi) {
          historyApi.appendMessage(messageContent);
        } else {
          setHistoryReload((prev) => prev + 1);
        }
        _ws.sendService({
          service: "friend/list",
          data: { forMessages: true }
        });
      },
      fail: (error) => {
        console.error(error);
        globalNotification.serviceFail({
          title: 'Enviar Mensagem',
          description: 'Ocorreu um erro no envio da mensagem, por favor contacte-nos através do suporte ou tente novamente mais tarde.',
        })
      },
      end: () => setMessageSubmitting(false),
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      const currentMessage = form.getFieldValue('message');
      if (currentMessage && currentMessage.trim() !== '') {
        form.submit();
      }
    }
  };

  if (!friend) {
    return (
      <div className="messages__chat messages__chat--empty">
        <Empty
          description={
            <Text type="secondary" className="messages__chat-empty-text">
              Selecione uma conversa na barra lateral <br /> para começar a trocar mensagens.
            </Text>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="messages__chat">
      <div className="messages__chat-header">
        <div className="messages__chat-header-user">
          {isMobile && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={onClose}
              className="messages__chat-back-btn"
              style={{ marginRight: 8, padding: '4px 8px' }}
            />
          )}
          <Avatar
            src={friend.avatar
              ? _service.url(`/asset?uid=${friend.uid}&type=avatar&entity=people&t=${new Date().getTime()}`)
              : '/images/profile-default.png'}
            size="large"
            shape="square"
            className="messages__chat-header-avatar"
          />
          <div className="messages__chat-header-info">
            <Text strong className="messages__chat-name">{friend.name || "Usuário"}</Text>
            {friend.username && <Text type="secondary" className="messages__chat-username">@{friend.username}</Text>}
          </div>
        </div>

        {!isMobile && (
          <Popconfirm
            title="Deseja fechar conversa?"
            onConfirm={onClose}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="text"
              icon={<CloseOutlined />}
              className="messages__chat-close-btn"
              aria-label="Fechar conversa"
            />
          </Popconfirm>
        )}
      </div>

      <div className="messages__chat-body">
        <History friend={friend} reload={historyReload} onRef={setHistoryApi} />
      </div>

      <div className="messages__chat-footer">
        <Form form={form} layout="vertical" onFinish={onFinish} className="messages__chat-form">
          <div className="messages__chat-input-wrapper">
            <Popover
              content={
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  previewConfig={{ showPreview: false }}
                  height="360px"
                  width="310px"
                />
              }
              trigger="click"
              placement="topLeft"
              overlayClassName="messages__chat-emoji-popover"
            >
              <Button
                type="text"
                shape="circle"
                icon={<SmileOutlined />}
                className="messages__chat-emoji-btn"
                style={{ fontSize: 20, color: '#8c8c8c', border: 'none', background: 'transparent' }}
              />
            </Popover>

            <Form.Item
              name="message"
              rules={[{ required: true, message: 'Insira a mensagem.' }]}
              style={{ marginBottom: 0, flex: 1 }}
            >
              <TextArea
                ref={textAreaRef}
                placeholder={`Mensagem para ${friend.name || 'o usuário'}...`}
                autoSize={{ minRows: 1, maxRows: 4 }}
                variant="borderless"
                className="messages__chat-textarea"
                onKeyDown={handleKeyDown}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={messageSubmitting}
                shape="circle"
                icon={<SendOutlined />}
                size="large"
                className="messages__chat-send-btn"
              />
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Chat;