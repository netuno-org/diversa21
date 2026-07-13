import React, { useEffect, useRef, useState } from "react";
import { Spin } from "antd";

import _ws from "@netuno/ws-client";

import globalNotification from "../../../../../common/globalNotification.js";

import Message from "./Message/index.jsx";
import "./index.less";

function History({ friend, reload }) {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const refList = useRef(null);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    const listenerMessageRef = _ws.addListener({
      method: "POST",
      service: "message/list",
      success: ({ content }) => {
        setMessages(content);
      },
      fail: (error) => {
        console.error(error);
        globalNotification.serviceFail({
          title: "Histórico de Mensagens",
          description: "Houve uma falha ao tentar atualizar o histórico de mensagens.",
        });
      },
      end: () => {
        setLoading(false);
      }
    });

    const listenerNewMessageRef = _ws.addListener({
      method: "POST",
      service: "message/new",
      success: ({ data, content }) => {
        if (data.with === friend.uid) {
          _ws.sendService({
            service: "message/read/mark",
            data: {
              uid: content.uid,
              from: friend.uid
            },
            success: () => {
              setMessages((prev) => [...prev, content]);
            }
          });
        }
      }
    });

    const listenerDeleteMessageRef = _ws.addListener({
      method: "DELETE",
      service: "message/delete",
      success: ({ data }) => {
        setMessages((prev) => prev.filter((m) => m.uid !== data.uid));
      }
    });

    const listenerEditMessageRef = _ws.addListener({
      method: "PUT",
      service: "message/edit",
      success: ({ content }) => {
        setMessages((prev) => prev.map((m) => m.uid === content.uid ? content : m));
      }
    });

    onLoad();

    return () => {
      _ws.removeListener(listenerMessageRef);
      _ws.removeListener(listenerNewMessageRef);
      _ws.removeListener(listenerDeleteMessageRef);
      _ws.removeListener(listenerEditMessageRef);
    }
  }, [friend]);

  useEffect(() => {
    if (refList.current) {
      refList.current.scrollTo({ top: refList.current.scrollHeight });
    }
  }, [messages]);

  useEffect(() => {
    if (reload > 0) {
      onLoad();
    }
  }, [reload]);

  const onLoad = () => {
    if (!friend?.uid) {
      setLoading(false);
      setMessages([]);
      return;
    }
    _ws.sendService({
      method: "POST",
      service: "message/list",
      data: {
        with: friend.uid
      }
    });
  };

  const handleDeleteMessage = (uid) => {
    _ws.sendService({
      method: "DELETE",
      service: "message",
      data: { uid }
    });
  };

  const handleEditMessage = (uid, text) => {
    _ws.sendService({
      method: "PUT",
      service: "message",
      data: { uid, message: text }
    });
  };

  return (
    <div className="messages__history-wrapper" ref={refList}>
      {loading && (
        <div className="messages__history-loading">
          <Spin />
        </div>
      )}

      {!loading && (
        <ul className="messages__history-list">
          {messages.map((message) => (
            <Message
              key={message.uid}
              friend={friend}
              data={message}
              onDelete={handleDeleteMessage}
              onEdit={handleEditMessage}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default History;