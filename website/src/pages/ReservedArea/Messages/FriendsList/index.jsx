import { useEffect, useState, useRef } from "react";
import { Spin, Input, Typography, Empty } from "antd";

import _ws from "@netuno/ws-client";
import useWS from "../../../../common/useWS.js";
import globalNotification from "../../../../common/globalNotification.js";

import FriendItem from "./FriendItem";

import "./index.less";

const { Text } = Typography;
const { Search } = Input;

function FriendsList({ onFriendSelected, friend }) {
  const [loading, setLoading] = useState(true);
  const [peopleList, setPeopleList] = useState([]);
  const [timeRefresh, setTimeRefresh] = useState(0);
  const selectedFriendUidRef = useRef(null);

  selectedFriendUidRef.current = friend?.uid ?? null;

  const ws = useWS();

  useEffect(() => {
    const listenerList = _ws.addListener({
      service: "friend/list",
      success: ({ content }) => {
        setPeopleList(content.data.items || []);
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
      }
    });
    _ws.sendService({
      service: "friend/list",
      data: {
        forMessages: true
      }
    });
    const listenerStatusChanged = _ws.addListener({
      service: "friend/status/changed",
      success: ({ content }) => {
        setPeopleList((prev) =>
          prev.map((item) => {
            if (item.uid === content.uid) {
              return { ...item, ...content }
            }
            return item;
          })
        )
      }
    });
    const listenerNewMessage = _ws.addListener({
      method: "POST",
      service: "message/new",
      success: ({ data, content }) => {
        let shouldRefresh = false;

        setPeopleList((prev) => {
          const index = prev.findIndex((item) => item.uid === data.with);
          if (index === -1) {
            shouldRefresh = true;
            return prev;
          }

          const current = prev[index];
          const updated = {
            ...current,
            last_message_at: content?.sent_at ?? current.last_message_at,
            unread_messages: selectedFriendUidRef.current === data.with
              ? 0
              : (current.unread_messages || 0) + 1
          };

          if (index === 0) {
            return [updated, ...prev.slice(1)];
          }

          return [
            updated,
            ...prev.slice(0, index),
            ...prev.slice(index + 1)
          ];
        });

        if (shouldRefresh) {
          _ws.sendService({
            service: "friend/list",
            data: { forMessages: true }
          });
        }
      }
    });

    const listenerMessageReadMark = _ws.addListener({
      service: "message/read/mark",
      success: ({ content }) => {
        setPeopleList((prev) => prev.map((item) => {
          if (item.uid === content.from) {
            return {
              ...item,
              unread_messages: Math.max(0, (item.unread_messages || 0) - 1)
            };
          }
          return item;
        }));
      }
    });

    return () => {
      _ws.removeListener(listenerList);
      _ws.removeListener(listenerStatusChanged);
      _ws.removeListener(listenerNewMessage);
      _ws.removeListener(listenerMessageReadMark);
    }
  }, [ws.data]);

  const handleSearch = (value) => {
    if (value.trim() || value === '') {
      setLoading(true)
      _ws.sendService({
        service: "friend/list",
        data: {
          name: value,
          forMessages: true
        }
      });
    }
  };

  return (
    <div className="messages__friends-list">
      <div className="messages__friends-header">
        <Search
          className="messages__friends-search"
          placeholder="Pesquisar..."
          enterButton={true}
          allowClear
          variant="filled"
          onSearch={handleSearch}
        />
      </div>

      {loading ? (
        <div className="messages__friends-loading">
          <Spin />
        </div>
      ) : peopleList.length > 0 ? (
        <ul className="messages__friends-ul">
          {peopleList.map((f) => (
            <FriendItem
              key={f.uid}
              uid={f.uid}
              name={f.name}
              status={f.online}
              avatar={f.avatar}
              isActive={selectedFriendUidRef.current === f.uid}
              unreadMessages={f.unread_messages}
              lastMessageAt={f.last_message_at}
              onClick={() => onFriendSelected && onFriendSelected(f)}
            />
          ))}
        </ul>
      ) : (
        <div className="messages__friends--empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" className="messages__friends-empty-text">
                Nenhuma conversa encontrada.
              </Text>
            }
          />
        </div>
      )}
    </div>
  );
}

export default FriendsList;
