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
  const selectedFriendUidRef = useRef(null);

  selectedFriendUidRef.current = friend?.uid ?? null;

  const ws = useWS();

  useEffect(() => {
    const listenerList = _ws.addListener({
      service: "friend/list",
      start: () => {
        setLoading(true);
      },
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
      service: "friend/list"
    });

    const listenerNewMessage = _ws.addListener({
      method: "POST",
      service: "message/new",
      success: ({ data }) => {
        setPeopleList((prev) => {
          // Aqui comparamos e não alteramos o contador se não for da pessoa certa
          return prev.map((item) => {
            if (item.uid !== data.with) {
              return item;
            }
            // Se for da pessoa certa e a janela está aberta, zeramos o contador
            if (selectedFriendUidRef.current === data.with) {
              return {
                ...item,
                unread_messages: 0
              };
            }
            // É da pessoa correta e a janela está fechada, então incrementamos +1
            return {
              ...item,
              unread_messages: (item.unread_messages || 0) + 1
            };
          });
        });
      }
    });
    const listenerMessageReadMark = _ws.addListener({
      service: "message/read/mark",
      success: ({ content }) => {
        setPeopleList((prev) => {
          return prev.map((item) => {
            if (item.uid === content.from) {
              return {
                ...item,
                unread_messages: Math.max(0, (item.unread_messages || 0) - 1)
              };
            }
            return item;
          });
        });
      }
    });

    return () => {
      _ws.removeListener(listenerList);
      // _ws.removeListener(listenerStatusChanged);
      _ws.removeListener(listenerNewMessage);
      _ws.removeListener(listenerMessageReadMark);
    }
  }, [ws.data]);

  const handleSearch = (value) => {
    if (value.trim() || value === '') {
      _ws.sendService({
        service: "friend/list",
        data: {
          name: value
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
          {peopleList.map((friend) =>
            <FriendItem
              key={friend.uid}
              uid={friend.uid}
              name={friend.name}
              avatar={friend.avatar}
              isActive={ws.data?.uid === friend.uid}
              unreadMessages={friend.unread_messages}
              onClick={() => onFriendSelected && onFriendSelected(friend)}
            />
          )}
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
