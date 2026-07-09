import { useEffect, useState } from "react";
import { Spin, Input, Typography, Empty } from "antd";

import usePeople from "../../../../common/usePeople.js";

import _ws from "@netuno/ws-client";
import useWS from "../../../../common/useWS.js";
import globalNotification from "../../../../common/globalNotification.js";

import FriendItem from "./FriendItem";

import "./index.less";
import { data } from "react-router-dom";
import _service from "@netuno/service-client";

const { Text } = Typography;
const { Search } = Input;

function FriendsList({ onFriendSelected }) {
  const [loading, setLoading] = useState(true);
  const [peopleList, setPeopleList] = useState([]);

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

    // const listenerStatusChanged = _ws.addListener({
    //   service: "friend/status/changed",
    //   success: ({ content }) => {
    //     setList((prev) => {
    //       const safePrev = Array.isArray(prev) ? prev : [];
    //       return safePrev.map((item) => {
    //         if (item.uid === content.uid) {
    //           return { ...item, ...content }
    //         }
    //         return item;
    //       });
    //     });
    //   }
    // });
    const listenerNewMessage = _ws.addListener({
      method: "POST",
      service: "message/new",
      success: ({ data }) => {
        setPeopleList((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];

          return safePrev.map((item) => {
            if (item.uid === data.with) {
              return { ...item, unread_messages: item.unread_messages + 1 }
            }
            return item;
          });
        });
      }
    });
    const listenerMessageReadMark = _ws.addListener({
      service: "message/read/mark",
      success: ({ content }) => {
        setPeopleList((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];

          return safePrev.map((item) => {
            if (item.uid === content.from) {
              return { ...item, unread_messages: item.unread_messages - 1 }
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
    fetchFriendListMessage(value)
  }

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
      ) : (
        <ul className="messages__friends-ul">
          {peopleList.length > 0 ? (
            peopleList.map((friend) => (
              <FriendItem
                key={friend.uid}
                uid={friend.uid}
                name={friend.name}
                avatar={friend.avatar}
                isActive={ws.data?.uid === friend.uid}
                onClick={() => onFriendSelected && onFriendSelected(friend)}
              />
            ))
          ) : (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<Text type="secondary">Nenhuma conversa encontrada.</Text>}
              />
            </div>
          )}
        </ul>
      )}
    </div>
  );
}

export default FriendsList;