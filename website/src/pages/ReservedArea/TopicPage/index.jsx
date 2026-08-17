import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import usePeople from "../../../common/usePeople.js";
import _service from "@netuno/service-client";
import globalNotification from "../../../common/globalNotification.js"

import ListHeaderFilters from "../../../components/ListHeaderFilters";
import SupportCommunityDisplay from "../../../components/SupportCommunityDisplay"
import { PlusOutlined } from "@ant-design/icons";

function TopicPage({ categoryUid }) {
  const loggedUser = usePeople();
  const navigate = useNavigate();

  const canManageTopic = loggedUser.canManagePosts() || loggedUser.data.group.code === 'member'

  const [topicList, setTopicList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [categoryName, setCategoryName] = useState("");
 
  const mode = 'topic'

  useEffect(() => {
    if (!categoryUid) {
      return
    };
    _service({
      method: "GET",
      url: "/forum/category",
      data: {uid: categoryUid},
      success: ({ json }) => {
        if (json) {
          setCategoryName(json.data.name);
        }
      },
      fail: (e) => {
        console.log("Service Error", e);
      },
    });
    handleListTopics();
  }, [categoryUid]);

  const handleListTopics = (title = '') => {
    if (!categoryUid) {
      return
    };
    setLoading(true);
    _service({
      method: "GET",
      url: "/forum/topic/list",
      data: { categoryUid, title },
      success: ({ json }) => {
        if (json) {
          setTopicList(json.data.items || []);
        }
        setLoading(false);
      },
      fail: (e) => {
        console.log("Service Error", e);
        setLoading(false);
      },
    });
  };
 
  const handleCreateTopic = (values) => {
    setLoading(true);
    _service({
      method: "POST",
      url: "/forum/topic",
      data: {
        categoryUid,
        title: values.title,
        content: values.content,
      },
      success: ({ json }) => {
        if (json) {
          globalNotification.success({
            title: "Tópico Criado",
            description: "O tópico foi criado com sucesso.",
          });
          closeModal();
          handleListTopics();
          return;
        }
        setLoading(false);
      },
      fail: (e) => {
        globalNotification.error({
          title: "Error",
          description: "Não foi possível criar o tópico.",
        });
        console.log("Service Error", e);
        setLoading(false);
      },
    });
  };

  const handleUpdateTopic = (values) => {
    setLoading(true);
    _service({
      method: "PUT",
      url: "/forum/topic",
      data: {
        uid: editingTopic.uid,
        title: values.title,
        content: values.content,
      },
      success: ({ json }) => {
        if (json) {
          globalNotification.success({
            title: "Tópico Atualizado",
            description: "O tópico foi atualizado com sucesso.",
          });
          closeModal();
          handleListTopics();
          return;
        }
        setLoading(false);
      },
      fail: (e) => {
        globalNotification.error({
          title: "Error",
          description: "Não foi possível atualizar o tópico.",
        });
        console.log("Service Error", e);
        setLoading(false);
      },
    });
  };

  const handleDeleteTopic = (uid) => {
    setLoading(true);
    _service({
      method: "DELETE",
      url: "/forum/topic",
      data: { uid },
      success: ({ json }) => {
        if (json) {
          globalNotification.success({
            title: "Tópico Removido",
            description: "O tópico foi removido com sucesso.",
          });
          handleListTopics();
          return;
        }
        setLoading(false);
      },
      fail: (e) => {
        globalNotification.error({
          title: "Error",
          description: "Não foi possível remover o tópico.",
        });
        console.log("Service Error", e);
        setLoading(false);
      },
    });
  };



  const handleSearchTopic = (value) => {
    handleListTopics(value);
  };

  const openCreateModal = () => {
    setEditingTopic(null);
    setShowModal(true);
  };

  const openEditModal = (topic) => {
    setEditingTopic(topic);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTopic(null);
  };

  const onFinish = (values) => {
    if (editingTopic) {
      handleUpdateTopic(values);
      return;
    }
    handleCreateTopic(values);
  };

  const handleCardClick = (uid) => {
    navigate(`/c/${categoryUid}/t/${uid}`)
  }

  return (
    <div>
      <ListHeaderFilters
        title='Rede de apoio'
        searchPlaceholder="Buscar por Tópico"
        createButton={canManageTopic && {
          icon: <PlusOutlined />,
          text: "Criar Tópico",
          onClick: openCreateModal,
        }}
        hideLocation={true}
        onSearch={handleSearchTopic}
        onSearchClear={() => handleListTopics("")}
        categoryName={categoryName}
      />
      <SupportCommunityDisplay
        loading={loading}
        showModal={showModal}
        onCancel={closeModal}
        editingTopic={editingTopic}
        onFinish={onFinish}
        listItems={topicList}
        loggedUser={loggedUser}
        handleCardClick={handleCardClick}
        openEditModal={openEditModal}
        handleDelete={handleDeleteTopic}
        mode={mode}
      />
    </div>
  );
}

export default TopicPage;
