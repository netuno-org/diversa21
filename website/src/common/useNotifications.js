import { useState, useEffect } from 'react';
import _service from '@netuno/service-client';
import _ws from '@netuno/ws-client';

import useWS from "./useWS.js";

import dayjs from 'dayjs';

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
    }
    if (ws.data?.connected) {
      setConnected(CONNECTED);
    } else if (ws.data?.connected === false) {
      setConnected(NOT_CONNECTED);
    }
  }, [ws.data]);

  useEffect(() => {
    if (connected === CONNECTED) {
      const listenerNotificationCount = _ws.addListener({
        method: "GET",
        service: 'notification/list',
        success: (data) => {
          setCount(data.content.data.pagination.totalCount);
        }
      });
      const listenerNotification = _ws.addListener({
        method: "GET",
        service: 'notification/list',
        success: (data) => {
          setLoading(true);
          const items = data.content.data.items;
          items.forEach(n => {
            processNotification(n)
          });
          setNotifications(items);
          setLoading(false);
        }
      });
      _ws.sendService({
        method: "GET",
        service: "notification/list"
      });
      // _ws.sendService({
      //   method: "GET",
      //   service: "notification"
      // });
      const listenerNewNotification = _ws.addListener({
        method: "POST",
        service: "notification/new",
        success: (data) => {
          const newNotification = data.content;
          processNotification(newNotification);
          setNotifications(prev => [...prev, newNotification]); 
          setCount((prev) => prev + 1);
        }
      });
      // const listenerMessageReadMark = _ws.addListener({
      //   service: "message/read/mark",
      //   success: () => {
      //     setUnreadCount((prev) => prev - 1);
      //   }
      // });
      return () => {
        _ws.removeListener(listenerNotificationCount);
        _ws.removeListener(listenerNotification);
        _ws.removeListener(listenerNewNotification);
        // _ws.removeListener(listenerMessageReadMark);
      }
    }
  }, [connected]);

  const processNotification = (n) => {
      n.id = n.uid;
      n.desc = n.content;
      n.username = n.originator.username;
      n.read = Boolean(n.read_at);

      if ((n.type === 'institution-post' || n.type === 'my-post-comment') && n.extra) {
        n.postId = n.extra.postUid;
      }

      const deatTimeUrl = n.sent_at && !n.sent_at.endsWith('Z') ? `${n.sent_at}Z` : n.sent_at;
      n.time = dayjs(deatTimeUrl).fromNow();
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const onNotificationClick = (item, navigate) => {
    markAsRead(item.id);

    if (item.type === 'institution-post' || item.type === 'my-post-comment') {
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
    } else if (item.type === 'message') {
      navigate('/messages', {
        state:
        {
          autoOpenFriend: {
            uid: item.senderUid,
            name: item.title,
            username: item.username
          }
        }
      });
    }
  };

  return {
    notifications,
    loading,
    markAllAsRead,
    onNotificationClick,
    count
  };
}

export default useNotifications;
