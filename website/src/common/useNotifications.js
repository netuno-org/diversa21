import { useState, useEffect } from 'react';
import _service from '@netuno/service-client';

import dayjs from 'dayjs';

function useNotifications(loggedUser) {
  const MOCK_NOTIFICATIONS = loggedUser.canChangeUserGroup() ?
    [
      {
        id: 1,
        type: 'message',
        title: '@test',
        desc: 'Enviou-te uma nova mensagem.',
        time: 'Há 5 min',
        read: false,
        username: 'test'
      },
      {
        id: 2,
        type: 'security',
        title: 'Novo Acesso',
        desc: 'Sessão iniciada num novo dispositivo.',
        time: 'Há 2 horas',
        read: false
      },
      {
        id: 3,
        type: 'system',
        title: 'Manutenção',
        desc: 'O sistema estará offline esta madrugada.',
        time: 'Ontem',
        read: true
      },
      {
        id: 4,
        type: 'system',
        title: 'Bem-vindo!',
        desc: 'O teu perfil foi criado com sucesso.',
        time: 'Há 3 dias',
        read: true
      },
    ] : [];

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setLoading(true);
    _service({
      url: 'notification/list',
      success: (response) => {
        const { items } = response.json.data;
        items.forEach(n => {
          n.id = n.uid;
          n.desc = n.content;
          n.username = n.originator.username;
          n.read = Boolean(n.read_at);

          if ((n.type === 'institution-post' || n.type === 'my-post-comment') && n.extra) {
            n.postId = n.extra.postUid;
          }

          const deatTimeUrl = n.sent_at && !n.sent_at.endsWith('Z') ? `${n.sent_at}Z` : n.sent_at;
          n.time = dayjs(deatTimeUrl).fromNow();
        });

        setNotifications(prev => {
          const combined = [...items, ...prev];
          return combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        });
        setLoading(false);
      },
      fail: () => setLoading(false)
    });
  };

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
    onNotificationClick
  };
}

export default useNotifications;
