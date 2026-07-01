import React, { useState, useEffect } from "react";

import { useLocation } from "react-router-dom";
import { Row, Col, Card, Modal, Select, Spin, Typography, Avatar, Space, Empty } from "antd";
import { LuMessageSquarePlus } from "react-icons/lu";

import _service from "@netuno/service-client";
import usePeople from "../../../common/usePeople";
import useWS from "../../../common/useWS.js";

import Chat from "./Chat";
import FriendsList from "./FriendsList/index.jsx";
import ListHeaderFilters from '../../../components/ListHeaderFilters/index.jsx';

import "./index.less";

const { Text } = Typography;

function Messages() {
  const [chatFriend, setChatFriend] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [peopleList, setPeopleList] = useState([]);
  const [fetchingPeople, setFetchingPeople] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loggedUser = usePeople();
  const location = useLocation();

  const ws = useWS();

  useEffect(() => {
    ws.load();
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (location.state?.autoOpenFriend) {
      setChatFriend(location.state.autoOpenFriend);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchPeopleForModal = (term = "") => {
    setFetchingPeople(true);

    _service({
      url: "people/list",
      data: {
        name: term,
        page: 1,
      },
      success: ({ json }) => {
        const items = json.data?.items || [];
        const loggedUserUid = loggedUser.data?.uid;

        const filteredPeople = items.filter(
          (person) => !loggedUserUid || person.uid !== loggedUserUid
        );

        const options = filteredPeople.map((person) => ({
          label: person.name,
          value: person.uid,
          personData: person,
        }));

        setPeopleList(options);
        setFetchingPeople(false);
      },
      fail: () => {
        setPeopleList([]);
        setFetchingPeople(false);
      }
    });
  };


  useEffect(() => {
    if (isModalVisible) {
      fetchPeopleForModal("");
    } else {

      setPeopleList([]);
      setSearchTerm("");
    }
  }, [isModalVisible]);


  const handleModalSearch = (value) => {
    setSearchTerm(value);
    fetchPeopleForModal(value);
  };

  const onFriendSelected = (friend) => {
    setChatFriend(friend);
  };

  const handleStartNewChat = (value, option) => {
    setChatFriend(option.personData);
    setIsModalVisible(false);
  };

  return (
    <section className="messages">
      <div className="messages__header">
        <ListHeaderFilters
          title="Mensagens"
          hideInputs={true}
          createButton={{
            icon: <LuMessageSquarePlus size={18} />,
            text: 'Nova mensagem',
            onClick: () => setIsModalVisible(true)
          }}
        />
      </div>

      <div className="messages__body">
        <Card className="messages__card" variant="borderless">
          <Row className="messages__row">
            <Col xs={24} md={8} className="messages__sidebar">
              <FriendsList onFriendSelected={onFriendSelected} />
            </Col>

            <Col xs={24} md={16} className="messages__chat-area">
              <Chat
                friend={chatFriend}
                onClose={() => setChatFriend(null)}
              />
            </Col>
          </Row>
        </Card>
      </div>

      <Modal
        title="Nova Conversa"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <div style={{ padding: '16px 0' }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Pesquise e selecione uma pessoa para iniciar uma troca de mensagens.
          </Text>

          <Select
            showSearch
            style={{ width: '100%' }}
            placeholder="Pesquisar por nome..."
            value={null}
            onSearch={handleModalSearch}
            onChange={handleStartNewChat}
            filterOption={false}
            notFoundContent={
              fetchingPeople ? (
                <div style={{ textAlign: 'center', padding: 16 }}><Spin size="small" /></div>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhuma pessoa encontrada." />
              )
            }
            options={peopleList}
            size="large"
            optionRender={(option) => (
              <Space>
                <Avatar
                  src={
                    option.data.personData.avatar
                      ? _service.url(`/asset?uid=${option.data.personData.uid}&type=avatar&entity=people&${new Date().getTime()}`)
                      : "/images/profile-default.png"
                  }
                  size="small"
                  shape="square"
                />
                <Text>{option.data.label}</Text>
                {option.data.personData.username && (
                  <Text type="secondary" style={{ fontSize: 12 }}>@{option.data.personData.username}</Text>
                )}
              </Space>
            )}
          />
        </div>
      </Modal>
    </section>
  );
}

export default Messages;
