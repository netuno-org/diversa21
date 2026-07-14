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
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const refList = useRef(null);
  const prevScrollHeightRef = useRef(0);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    setCurrentPage(1);
    setHasMore(true);
    setLoadingMore(false);
    prevScrollHeightRef.current = 0;
    const listenerMessageRef = _ws.addListener({
      method: "POST",
      service: "message/list",
      success: ({ content, data }) => {
        const page = data?.page || 1;
        if (page > 1) {
          setMessages((prev) => [...content, ...prev]);
        } else {
          setMessages(content);
        }
        if (content.length < 10) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
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
        setLoadingMore(false);
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
      if (prevScrollHeightRef.current > 0) {
        const newScrollHeight = refList.current.scrollHeight;
        refList.current.scrollTop = newScrollHeight - prevScrollHeightRef.current;
        prevScrollHeightRef.current = 0;
      } else {
        refList.current.scrollTo({ top: refList.current.scrollHeight });
      }
    }
  }, [messages]);

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasMore && !loading && !loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      setLoadingMore(true);
      prevScrollHeightRef.current = e.currentTarget.scrollHeight;
      _ws.sendService({
        method: "POST",
        service: "message/list",
        data: {
          with: friend.uid,
          page: nextPage
        }
      });
    }
  };

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
    <div className="messages__history-wrapper" ref={refList} onScroll={handleScroll}>
      {loading && (
        <div className="messages__history-loading">
          <Spin />
        </div>
      )}

      {!loading && (
        <ul className="messages__history-list">
          {loadingMore && (
            <li className="messages__history-loading-more" style={{ textAlign: 'center', padding: '8px 0', listStyleType: 'none' }}>
              <Spin size="small" />
            </li>
          )}
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