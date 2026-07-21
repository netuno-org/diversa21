import React, { useEffect, useRef, useState } from "react";
import { Spin, Button } from "antd";

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
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const refList = useRef(null);
  const prevScrollHeightRef = useRef(0);

  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    setCurrentPage(1);
    setHasMore(true);
    setLoadingMore(false);
    prevScrollHeightRef.current = 0;
    isInitialLoadRef.current = true;
    const listenerMessageRef = _ws.addListener({
      method: "POST",
      service: "message/list",
      success: ({ content, data }) => {
        const page = data?.page || 1;
        if (page > 1) {
          setMessages((prev) => {
            const existingUids = new Set(prev.map((m) => m.uid));
            const newItems = content.filter((m) => !existingUids.has(m.uid));
            return [...newItems, ...prev];
          });
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
        if (data.with === friend.uid || content.to === friend.uid || content.from === friend.uid) {
          const appendMessage = () => {
            setMessages((prev) => {
              if (prev.some((m) => m.uid === content.uid)) {
                return prev.map((m) => (m.uid === content.uid ? content : m));
              }
              return [...prev, content];
            });
          };

          _ws.sendService({
            service: "message/read/mark",
            data: {
              uid: content.uid,
              from: friend.uid
            },
            success: appendMessage,
            fail: appendMessage
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
    if (!refList.current || messages.length === 0) return;

    const el = refList.current;
    const lastMessage = messages[messages.length - 1];
    const isOutgoing = lastMessage && lastMessage.from !== friend?.uid;

    const scrollToBottom = () => {
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    };

    if (isInitialLoadRef.current) {
      setTimeout(() => {
        scrollToBottom();
      }, 50);
      isInitialLoadRef.current = false;
      prevScrollHeightRef.current = 0;
    } else if (prevScrollHeightRef.current > 0) {
      const prevScrollHeight = prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
      requestAnimationFrame(() => {
        if (el) {
          const newScrollHeight = el.scrollHeight;
          el.scrollTop = newScrollHeight - prevScrollHeight;
        }
      });
    } else if (isOutgoing) {
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    } else {
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 250;
      if (isNearBottom) {
        setTimeout(() => {
          scrollToBottom();
        }, 50);
      }
    }
  }, [messages]);

  useEffect(() => {
    if (!loading && !loadingMore && hasMore && refList.current && messages.length > 0) {
      const el = refList.current;
      if (el.scrollHeight <= el.clientHeight) {
        const nextPage = Math.floor(messages.length / 10) + 1;
        setCurrentPage(nextPage);
        setLoadingMore(true);
        _ws.sendService({
          method: "POST",
          service: "message/list",
          data: {
            with: friend.uid,
            page: nextPage
          }
        });
      }
    }
  }, [messages, loading, loadingMore, hasMore]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 300;
    setShowScrollBottom(isFarFromBottom);

    if (scrollTop <= 50 && hasMore && !loading && !loadingMore) {
      const nextPage = Math.floor(messages.length / 10) + 1;
      setCurrentPage(nextPage);
      setLoadingMore(true);
      prevScrollHeightRef.current = scrollHeight;
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

  const scrollToBottom = () => {
    if (refList.current) {
      refList.current.scrollTo({ top: refList.current.scrollHeight, behavior: 'smooth' });
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
    setCurrentPage(1);
    prevScrollHeightRef.current = 0;
    _ws.sendService({
      method: "POST",
      service: "message/list",
      data: {
        with: friend.uid,
        page: 1
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

      {showScrollBottom && (
        <Button
          type="primary"
          shape="round"
          className="messages__history-scroll-bottom"
          onClick={scrollToBottom}
        >
          Ver mensagens recentes
        </Button>
      )}
    </div>
  );
}

export default History;