import { useState, useEffect } from 'react';
import _service from '@netuno/service-client';
import _ws from '@netuno/ws-client';

import useWS from "./useWS.js";

import dayjs from 'dayjs';

let openChatFriendUid = null;

export function setOpenChatFriendUid(uid) {
  openChatFriendUid = uid || null;
}

function useNotifications(loggedUser) {
  const MOCK_NOTIFICATIONS = loggedUser.canChangeUserGroup() ?
    [
      // {
      //   id: 1,
      //   type: 'message',
      //   title: '@test',
      //   desc: 'Enviou-te uma nova mensagem.',
      //   time: 'Há 5 min',
      //   read: false,
      //   username: 'test'
      // },
      {
        id: 1,
        type: 'security',
        title: 'Novo Acesso',
        desc: 'Sessão iniciada num novo dispositivo.',
        time: 'Há 2 horas',
        read: false
      },
      {
        id: 2,
        type: 'system',
        title: 'Manutenção',
        desc: 'O sistema estará offline esta madrugada.',
        time: 'Ontem',
        read: true
      },
      {
        id: 3,
        type: 'system',
        title: 'Bem-vindo!',
        desc: 'O teu perfil foi criado com sucesso.',
        time: 'Há 3 dias',
        read: true
      },
    ] : [];

  const ws = useWS();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   fetchNotifications();
  // }, []);

  const NO_DATA = 0;
  const CONNECTED = 1;
  const NOT_CONNECTED = -1;

  const [connected, setConnected] = useState(NO_DATA);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    if (!ws.data) {
      setConnected(NO_DATA);
      return;
    }
    if (ws.data?.connected) {
      setConnected(CONNECTED);
    } else if (ws.data?.connected === false) {
      setConnected(NOT_CONNECTED);
    }
  }, [ws.data]);

  useEffect(() => {
    if (connected !== CONNECTED) {
      return;
    }

    const listenerNotification = _ws.addListener({
      method: "GET",
      service: 'notification/list',
      start: () => setLoading(true),
      success: (data) => {
        const items = data.content.data.items || [];
        items.forEach(n => processNotification(n));
        setNotifications(items);
        setCount(data.content.data.pagination?.totalCount ?? items.length);
      },
      end: () => setLoading(false)
    });

    _ws.sendService({
      method: "GET",
      service: "notification/list"
    });

    const listenerNewNotification = _ws.addListener({
      method: "POST",
      service: "notification/new",
      success: (data) => {
        const newNotification = data.content;
        processNotification(newNotification);

        // Chat aberto com o remetente: ignora a notificação.
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
      _ws.removeListener(listenerNotification);
      _ws.removeListener(listenerNewNotification);
      _ws.removeListener(listenerNotificationRead);
    };
  }, [connected]);

  const processNotification = (n) => {
    n.id = n.uid;
    n.username = n.originator?.username;
    n.read = Boolean(n.read_at);

    if (n.type === 'message') {
      // Se o servidor mandar um contador, respeitamos; senão começamos em 1.
      n.messageCount = n.messageCount || n.extra?.count || 1;
    } else {
      n.desc = n.content;
    }

    if (n.type && ["post", "comment", "like"].some(k => n.type.includes(k)) && n.extra) {
      n.postId = n.extra.postUid;
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
    // ensure server marks as read/handled
    _service({
      url: 'notification',
      method: 'PUT',
      data: { uid: id },
      fail: (e) => {
        console.error("Falha ao marcar notificação como lida ao remover:", e);
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
    count
  };
}

export default useNotifications;
