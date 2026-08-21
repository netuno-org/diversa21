import { useState, useEffect, useRef } from 'react';
import _service from '@netuno/service-client';
import _ws from '@netuno/ws-client';

import useWS from "./useWS.js";

let openChatFriendUid = null;

export function setOpenChatFriendUid(uid) {
  openChatFriendUid = uid || null;
}

function useNotifications() {
  const ws = useWS();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({ current: 1, size: 10, total: 0 });

  const NO_DATA = 0;
  const CONNECTED = 1;
  const NOT_CONNECTED = -1;

  const [connected, setConnected] = useState(NO_DATA);
  const [count, setCount] = useState(0);

  const loadedRef = useRef(false);

  useEffect(() => {
    setCount(0);
    if (!ws.data) {
      loadedRef.current = false;
      setConnected(NO_DATA);
      return;
    }
    if (ws.data?.connected) {
      setConnected(CONNECTED);
    } else if (ws.data?.connected === false) {
      loadedRef.current = false;
      setConnected(NOT_CONNECTED);
    }
  }, [ws.data]);

  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({ ...prev, current: page, size: pageSize }));
    _ws.sendService({
      method: "GET",
      service: "notification/list",
      data: {
        page: String(page),
        pageSize: String(pageSize)
      }
    });
  };

  useEffect(() => {
    if (connected !== CONNECTED) {
      return;
    }

    if (loadedRef.current) {
      return;
    }
    loadedRef.current = true;

    const listenerNotification = _ws.addListener({
      method: "GET",
      service: 'notification/list',
      start: () => setLoading(true),
      success: (data) => {
        const items = data.content.data.items || [];
        items.forEach(n => processNotification(n));
        setNotifications(items);
        
        const totalCount = data.content.data.pagination?.totalCount ?? items.length;
        setCount(totalCount);
        
        setPagination(prev => ({ ...prev, total: totalCount })); 
      },
      end: () => setLoading(false)
    });

    _ws.sendService({
      method: "GET",
      service: "notification/list",
      data: {
        page: String(pagination.current),
        pageSize: String(pagination.size)
      }
    });

    const listenerNewNotification = _ws.addListener({
      method: "POST",
      service: "notification/new",
      success: (data) => {
        const newNotification = data.content;
        processNotification(newNotification);

        if (
          newNotification.type === 'message' &&
          openChatFriendUid &&
          newNotification.originator?.uid === openChatFriendUid
        ) {
          return;
        }

        setNotifications(prev => {
          if (newNotification.type === 'message') {
            const existing = prev.find(n =>
              n.type === 'message' && n.originator?.uid === newNotification.originator?.uid
            );
            const previousCount = existing?.messageCount || 1;
            newNotification.messageCount = existing ? previousCount + 1 : 1;

            if (!existing) {
              setCount((c) => c + 1);
            }
            return [
              newNotification,
              ...prev.filter(n =>
                !(n.type === 'message' && n.originator?.uid === newNotification.originator?.uid)
              )
            ];
          }
          setCount((c) => c + 1);
          return [newNotification, ...prev];
        });
      }
    });

    const listenerNotificationRead = _ws.addListener({
      method: "POST",
      service: "notification/read",
      success: (data) => {
        const content = data.content;
        if (!content) {
          return;
        }
        if (content.type === 'message') {
          if (content.all) {
            setNotifications(prev => prev.filter(n => n.type !== 'message'));
            return;
          }
          if (content.originator?.uid) {
            setNotifications(prev => prev.filter(n =>
              !(n.type === 'message' && n.originator?.uid === content.originator.uid)
            ));
          }
          return;
        }
        
        if (content.all) {
          setNotifications(prev => prev.map(n => n.type !== 'message' ? { ...n, read: true } : n));
        } else if (content.uid) {
          setNotifications(prev => prev.map(n => n.uid === content.uid ? { ...n, read: true } : n));
        }
      }
    });

    return () => {
      loadedRef.current = false;
      _ws.removeListener(listenerNotification);
      _ws.removeListener(listenerNewNotification);
      _ws.removeListener(listenerNotificationRead);
    };
  }, [connected]);

  useEffect(() => {
    const handleFriendActionSuccess = (event) => {
      const detail = event?.detail || {};
      const { action, uid } = detail;
      if (!uid || !['accept', 'reject', 'cancel'].includes(action)) {
        return;
      }
      setNotifications((prev) => prev.filter((n) =>
        !(n.type === 'friend-request' && n.originator?.uid === uid)
      ));
    };

    window.addEventListener('friend-action-success', handleFriendActionSuccess);
    return () => {
      window.removeEventListener('friend-action-success', handleFriendActionSuccess);
    };
  }, []);

  const processNotification = (n) => {
    n.id = n.uid;
    n.username = n.originator?.username;
    n.read = Boolean(n.read_at);

    if (n.type === 'message') {
      n.messageCount = n.messageCount || n.extra?.count || 1;
    } else {
      n.desc = n.content;
    }

    if (n.type && ["post", "comment", "like"].some(k => n.type.includes(k)) && n.extra) {
      n.postId = n.extra.postUid;
    }

    if (n.type === 'forum-reply' && n.extra) {
      n.topicUid = n.extra.topicUid;
      n.categoryUid = n.extra.categoryUid;
      n.replyUid = n.extra.replyUid;
    }
  };

  const markAllAsRead = (type) => {
    if (type === 'message') {
      _service({
        url: 'notification/message/clear',
        method: 'POST'
      });
      setNotifications(prev => prev.filter(n => n.type !== 'message'));
      return;
    }

    const previousNotifications = notifications;

    setNotifications(prev => prev.map(n => {
      if (type && n.type !== type) {
        return n;
      }
      if (n.type === 'message') {
        return n;
      }
      return { ...n, read: true };
    }));

    _service({
      url: 'notification',
      method: 'PUT',
      fail: (e) => {
        console.error("Falha ao marcar todas as notificações como lidas:", e);
        setNotifications(previousNotifications);
      }
    });
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

    _service({
      url: 'notification',
      method: 'PUT',
      data: { uid: id },
      fail: (e) => {
        console.error("Falha ao marcar notificação como lida:", e);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
      }
    });
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    _service({
      url: 'notification',
      method: 'DELETE',
      data: { uid: id },
      fail: (e) => {
        console.error("Falha ao remover notificação:", e);
      }
    });
  };

  const onNotificationClick = (item, navigate) => {
    if (item.type === 'message') {
      setNotifications(prev => prev.filter(n =>
        !(n.type === 'message' && n.originator?.uid === item.originator?.uid)
      ));
      navigate('/messages', {
        state: {
          autoOpenFriend: {
            uid: item.originator?.uid,
            name: item.originator?.name,
            username: item.username || item.originator?.username,
            avatar: item.originator?.avatar
          }
        }
      });
      return;
    }

    markAsRead(item.id);

    if (item.type && ["post", "comment", "like"].some(k => item.type.includes(k))) {
      if (!item.postId) {
        return navigate('/posts');
      }

      _service({
        url: 'post',
        method: 'GET',
        data: { uid: item.postId },
        success: (response) => {
          const post = response.json.data;
          if (post.parent) {
            navigate(`/p/${post.parent}?c=${item.postId}`);
          } else {
            navigate(`/p/${item.postId}`);
          }
        },
        fail: (e) => {
          console.error("Falha ao abrir post:", e);
          navigate('/posts');
        }
      });

    } else if (item.type === 'forum-reply') {
      const topicUid = item.topicUid || item.extra?.topicUid;
      const categoryUid = item.categoryUid || item.extra?.categoryUid;

      if (!topicUid) {
        return navigate('/support-community');
      }

      if (categoryUid) {
        return navigate(`/c/${categoryUid}/t/${topicUid}`);
      }

      _service({
        url: 'forum/topic',
        method: 'GET',
        data: { uid: topicUid },
        success: (response) => {
          const fetchedCategoryUid = response.json.data?.category?.uid;
          if (fetchedCategoryUid) {
            navigate(`/c/${fetchedCategoryUid}/t/${topicUid}`);
            return;
          }
          navigate('/support-community');
        },
        fail: (e) => {
          console.error("Falha ao abrir tópico:", e);
          navigate('/support-community');
        }
      });

    } else if (item.type === 'friend-request' || item.type === 'friend-request-accepted') {
      navigate(`/u/${item.username}`);
    }
  };

  return {
    notifications,
    loading,
    markAllAsRead,
    onNotificationClick,
    markAsRead,
    removeNotification,
    count,
    pagination,
    handlePaginationChange
  };
}

export default useNotifications;