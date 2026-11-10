import { useCallback, useEffect, useRef, useState } from "react";
import { Spin, Tabs } from "antd";
import _ws from "@netuno/ws-client";

import useWS from "../../../../common/useWS.js";
import globalNotification from "../../../../common/globalNotification.js";
import _service from "@netuno/service-client";
import FriendItem from "../../../../components/FriendItem/index.jsx";

import "./index.less";

function FriendsList({ selectedFriend, onFriendSelected }) {
  const [loading, setLoading] = useState(true);
  const [conversations, setConverstations] = useState(null);
  const [friends, setFriends] = useState(null);
  const selectedFriendUidRef = useRef(null);
  const conversationsRef = useRef(null);
  const ws = useWS();

  selectedFriendUidRef.current = selectedFriend?.uid ?? null;

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const loadChats = useCallback(() => {
    _ws.sendService({
      service: "message/chat/list",
    });
  }, []);

  useEffect(() => {
    _service({
      method: "GET",
      url: "/message/chat/list",
      success: (response) => {
        setLoading(false);
        if (response.json && response.json.result) {
          setFriends(response.json.friends || []);
        } else {
          setFriends([]);
        }
      },
      fail: (e) => {
        setLoading(false);
        console.error("Erro ao carregar dados de amigos:", e);
        globalNotification.serviceFail({
          title: "Amigos",
          description: "Não foi possível carregar a lista de amigos.",
        });
      }
    });
  }, []);

  useEffect(() => {
    const listenerList = _ws.addListener({
      service: "message/chat/list",
      start: () => {
        setLoading(true);
      },
      success: (data) => {
        setConverstations(data.content || []);
      },
      fail: (error) => {
        console.error(error);
        globalNotification.serviceFail({
          title: "Lista de Amigos",
          description: "Houve uma falha ao tentar atualizar a listagem de amigos.",
        });
      },
      end: () => {
        setLoading(false);
      },
    });

    const listenerStatusChanged = _ws.addListener({
      service: "friend/status/changed",
      success: ({ content }) => {
        setConverstations((prev) =>
          prev ? prev.map((item) => {
            if (item.uid === content.uid) {
              return { ...item, ...content };
            }
            return item;
          }) : prev
        );
      },
    });

    const listenerNewMessage = _ws.addListener({
      method: "POST",
      service: "message/new",
      success: ({ data, content }) => {
        const knownConversation = conversationsRef.current
          && conversationsRef.current.some((item) => item.uid === data.with);

        if (!knownConversation) {
          // First message exchanged with this profile: reload the list so the
          // new conversation appears without requiring a tab switch.
          loadChats();
          return;
        }

        setConverstations((prev) =>
          prev
            .map((item) => {
              if (item.uid === data.with) {
                return {
                  ...item,
                  unread_messages: (item.unread_messages || 0) + 1,
                  latest_message: content?.sent_at || item.latest_message,
                };
              }
              return item;
            })
            .sort((a, b) => new Date(b.latest_message) - new Date(a.latest_message))
        );
      },
    });

    const listenerMessageReadMark = _ws.addListener({
      service: "message/read/mark",
      success: ({ data }) => {
        setConverstations((prev) =>
          prev ? prev.map((item) => {
            if (item.uid === data.from) {
              return { ...item, unread_messages: Math.max(0, (item.unread_messages || 0) - 1) };
            }
            return item;
          }) : prev
        );
      },
    });

    loadChats();

    return () => {
      _ws.removeListener(listenerList);
      _ws.removeListener(listenerStatusChanged);
      _ws.removeListener(listenerNewMessage);
      _ws.removeListener(listenerMessageReadMark);
    };
  }, [ws.data, loadChats]);


  return (
    <div className="messages__chats-list">
      {loading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin />
        </div>
      )}
      {
        !loading && (!conversations || conversations.length === 0) && (
          <div style={{ padding: "20px", textAlign: "center", color: "#8c8c8c" }}>
            Nenhuma conversa ainda.
          </div>
        )
      }
      {
        conversations && conversations.length > 0 && (
          <ul className="messages__chats-ul">
            {conversations.map((item) => (
              <FriendItem
                key={item.uid}
                {...item}
                loadChats={loadChats}
                className={selectedFriend && selectedFriend.uid === item.uid ? "active" : ""}
                isActive={selectedFriendUidRef.current === item.uid}
                onClick={() => onFriendSelected && onFriendSelected(item)}
              />
            ))}
          </ul>
        )
      }
    </div>
  );
}

export default FriendsList;
