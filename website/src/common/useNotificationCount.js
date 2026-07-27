import { useState, useEffect } from 'react';
import _ws from '@netuno/ws-client';
import useWS from './useWS';

let notificationCountLoaded = false;

export default function useNotificationCount() {
  const ws = useWS();
  const [count, setCount] = useState(0);
  
  const NO_DATA = 0;
  const CONNECTED = 1;
  const NOT_CONNECTED = -1;
  const [connected, setConnected] = useState(NO_DATA);

  useEffect(() => {
    if (!ws.data) {
      notificationCountLoaded = false;
      setConnected(NO_DATA);
      return;
    }
    if (ws.data?.connected) {
      setConnected(CONNECTED);
    } else if (ws.data?.connected === false) {
      notificationCountLoaded = false;
      setConnected(NOT_CONNECTED);
    }
  }, [ws.data]);

  useEffect(() => {
    if (connected !== CONNECTED || notificationCountLoaded) {
      return;
    }
    notificationCountLoaded = true;

    _ws.sendService({ method: "GET", service: "notification/unread-count" });
    
    const listenerInitCount = _ws.addListener({
      method: "GET",
      service: "notification/unread-count",
      success: (data) => {
        setCount(data.content?.count || 0);
      }
    });

    const listenerNewNotification = _ws.addListener({
      method: "POST",
      service: "notification/new",
      success: (data) => {
        const newNotif = data.content;
        if (newNotif?.type !== 'message') {
          setCount(prev => prev + 1);
        }
      }
    });

    const listenerNotificationRead = _ws.addListener({
      method: "POST",
      service: "notification/read",
      success: (data) => {
        const content = data.content;
        if (!content || content.type === 'message') return;

        if (content.all) {
          setCount(0);
        } else {
          setCount(prev => Math.max(0, prev - 1));
        }
      }
    });

    const handleFriendActionSuccess = (event) => {
      const detail = event?.detail || {};
      const { action, uid } = detail;
      if (!uid || !['accept', 'reject', 'cancel'].includes(action)) {
        return;
      }
      setCount(prev => Math.max(0, prev - 1));
    };

    window.addEventListener('friend-action-success', handleFriendActionSuccess);

    return () => {
      notificationCountLoaded = false;
      _ws.removeListener(listenerInitCount);
      _ws.removeListener(listenerNewNotification);
      _ws.removeListener(listenerNotificationRead);
      window.removeEventListener('friend-action-success', handleFriendActionSuccess);
    };
  }, [connected]);

  return { count };
}