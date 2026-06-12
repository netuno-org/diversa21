import React, { useEffect, useState } from "react";
import { Form, Input, Button, Typography, Avatar, Empty } from "antd";
import { SendOutlined, CloseOutlined } from "@ant-design/icons";

// import _ws from "@netuno/ws-client";
// import globalNotification from "../../../../common/globalNotification.js";

import History from "./History";

import "./index.less";

const { TextArea } = Input;
const { Text } = Typography;

function Chat({ friend, onClose }) {
  const [form] = Form.useForm();
  const [messageSubmitting, setMessageSubmitting] = useState(false);
  const [historyReload, setHistoryReload] = useState(0);

  useEffect(() => {
    setHistoryReload(0);
    form.resetFields();
  }, [friend, form]);

  // Placeholder values
  const onFinish = ({ message }) => {
    setMessageSubmitting(true);

    setTimeout(() => {
      setMessageSubmitting(false);
      setHistoryReload((prev) => prev + 1);
      form.resetFields();
    }, 500);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && friend && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [friend, onClose]);

  // const onFinish = ({ message }) => {
  //   setMessageSubmitting(true);
  //   const listenerMessagePostRef = _ws.addListener({
  //     method: "POST",
  //     service: "message",
  //     success: (data) => {
  //       setMessageSubmitting(false);
  //       setHistoryReload(historyReload + 1);
  //       _ws.removeListener(listenerMessagePostRef);
  //     },
  //     fail: (error) => {
  //       setMessageSubmitting(false);
  //       _ws.removeListener(listenerMessagePostRef);
  //       globalNotification.serviceFail({
  //         title: 'Enviar Mensagem',
  //         description: 'Ocorreu um erro no envio da mensagem, por favor contacte-nos através do suporte ou tente novamente mais tarde.',
  //       })
  //     }
  //   });
  //   _ws.sendService({
  //     method: "POST",
  //     service: "message",
  //     data: {
  //       to: friend.uid,
  //       message
  //     }
  //   });
  // };

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
          <Avatar src={friend.avatar || "/images/profile-default.png"} size="large" />
          <div className="messages__chat-header-info">
            <Text strong className="messages__chat-name">{friend.name || "Utilizador"}</Text>
            {friend.username && <Text type="secondary" className="messages__chat-username">@{friend.username}</Text>}
          </div>
        </div>

        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          className="messages__chat-close-btn"
        />

      </div>

      <div className="messages__chat-body">
        <History friend={friend} reload={historyReload} />
      </div>

      <div className="messages__chat-footer">
        <Form form={form} layout="vertical" onFinish={onFinish} className="messages__chat-form">
          <div className="messages__chat-input-wrapper">
            <Form.Item
              name="message"
              rules={[{ required: true, message: 'Insira a mensagem.' }]}
              style={{ marginBottom: 0, flex: 1 }}
            >
              <TextArea
                placeholder={`Escrever mensagem para ${friend.name || 'o utilizador'}...`}
                autoSize={{ minRows: 1, maxRows: 4 }}
                variant="borderless"
                className="messages__chat-textarea"
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