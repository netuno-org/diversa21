import React, { useEffect, useRef, useState } from "react";
import { Spin } from "antd";

import _ws from "@netuno/ws-client";
import dayjs from "dayjs";

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

    const listenerMessageReadRef = _ws.addListener({
      method: "POST",
      service: "message/read",
      success: ({ data, content }) => {
        if (data?.with !== friend.uid || !content) {
          return;
        }

        if (content.uid) {
          setMessages((prev) =>
            prev.map((m) => (m.uid === content.uid ? { ...m, read_at: content.read_at } : m))
          );
          return;
        }

        if (content.all && content.read_at) {
          setMessages((prev) =>
            prev.map((m) =>
              m.to === friend.uid && !m.read_at
                ? { ...m, read_at: content.read_at }
                : m
            )
          );
        }
      }
    });

    onLoad();

    return () => {
      _ws.removeListener(listenerMessageRef);
      _ws.removeListener(listenerNewMessageRef);
      _ws.removeListener(listenerDeleteMessageRef);
      _ws.removeListener(listenerEditMessageRef);
      _ws.removeListener(listenerMessageReadRef);
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
          {messages.map((message, index) => {
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

            let showTime = false;
            if (!prevMessage) {
              showTime = true;
            } else {
              const diffMinutes = dayjs(message.sent_at).diff(dayjs(prevMessage.sent_at), 'minute');
              if (diffMinutes >= 10) {
                showTime = true;
              }
            }

            let showRead = false;
            const isOutgoing = friend.uid !== message.from;

            if (isOutgoing && message.read_at) {
              if (!nextMessage) {
                showRead = true;
              } else {
                const nextIsIncoming = friend.uid === nextMessage.from;
                const nextIsUnread = !nextMessage.read_at;
                const diffNextMinutes = dayjs(nextMessage.sent_at).diff(dayjs(message.sent_at), 'minute');

                if (nextIsIncoming || nextIsUnread || diffNextMinutes >= 5) {
                  showRead = true;
                }
              }
            }

            return (
              <Message
                key={message.uid}
                friend={friend}
                data={message}
                showTime={showTime}
                showRead={showRead}
                onDelete={handleDeleteMessage}
                onEdit={handleEditMessage}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default History;