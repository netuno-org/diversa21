import { useEffect, useState } from "react";
import { Spin, Input, Typography, Empty } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import _service from "@netuno/service-client";
import usePeople from "../../../../common/usePeople.js";

// import _ws from "@netuno/ws-client";
// import useWS from "../../../../common/useWS.js";

import FriendItem from "./FriendItem";

import "./index.less";

const { Text } = Typography;
const { Search } = Input;

function FriendsList({ onFriendSelected }) {
  const loggedUser = usePeople();

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [activeUid, setActiveUid] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  // const ws = useWS();

  useEffect(() => {
    setLoading(true);

    _service({
      url: "people/list",
      data: { page: 1 },
      success: ({ json }) => {
        const items = json.data?.items || [];

        const filteredPeople = items.filter(
          (person) => person.uid !== loggedUser.data.uid
        );

        setList(filteredPeople);
        setLoading(false);
      },
      fail: () => {
        setList([]);
        setLoading(false);
      }
    });

    /*
      const listenerRef = _ws.addListener({
        service: "friend/list",
        success: (data) => {
          setList(data.content);
          setLoading(false);
        },
        fail: (error) => {
          setLoading(false);
        }
      });
      _ws.sendService({
        service: "friend/list"
      });
      return () => {
        _ws.removeListener(listenerRef);
      }
    */
  }, [loggedUser.data.uid]);

  const handleSelectFriend = (friend) => {
    setActiveUid(friend.uid);
    if (onFriendSelected) {
      onFriendSelected(friend);
    }
  };

  const filteredList = list.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (friend.username && friend.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="messages__friends-list">
      <div className="messages__friends-header">
        <Search
          className="messages__friends-search"
          placeholder="Pesquisar..."
          enterButton={true}
          allowClear
          variant="filled"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="messages__friends-loading">
          <Spin />
        </div>
      ) : (
        <ul className="messages__friends-ul">
          {filteredList.length > 0 ? (
            filteredList.map((friend) => (
              <FriendItem
                key={friend.uid}
                uid={friend.uid}
                name={friend.name}
                avatar={friend.avatar}
                isActive={activeUid === friend.uid}
                onClick={() => handleSelectFriend(friend)}
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