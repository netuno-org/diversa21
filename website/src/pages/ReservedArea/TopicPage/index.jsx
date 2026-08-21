import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import usePeople from "../../../common/usePeople.js";
import _service from "@netuno/service-client";
import globalNotification from "../../../common/globalNotification.js"

import ListHeaderFilters from "../../../components/ListHeaderFilters";
import SupportCommunityDisplay from "../../../components/SupportCommunityDisplay"
import { PlusOutlined } from "@ant-design/icons";
import { Pagination } from "antd";

function TopicPage({ categoryUid }) {
  const loggedUser = usePeople();
  const navigate = useNavigate();

  const canManageTopic = loggedUser.canManagePosts() || loggedUser.data.group.code === 'member'

  const [topicList, setTopicList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTitle, setSearchTitle] = useState("");
 
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
          setCategoryDescription(json.data.description || "");
        }
      },
      fail: (e) => {
        console.log("Service Error", e);
      },
    });
    handleListTopics(searchTitle, page);
  }, [categoryUid, page]);

  const handleListTopics = (title = searchTitle, currentPage = page) => {
    if (!categoryUid) {
      return
    };
    setLoading(true);
    _service({
      method: "GET",
      url: "/forum/topic/list",
      data: { categoryUid, title, page: currentPage },
      success: ({ json }) => {
        if (json) {
          setTopicList(json.data.items || []);
          setTotalCount(json.data.pagination?.totalCount ?? 0);
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
          setPage(1);
          handleListTopics(searchTitle, 1);
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
          handleListTopics(searchTitle, page);
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
          handleListTopics(searchTitle, page);
          return;
        }
        setLoading(false);
      },
      fail: ({ json }) => {
        if (json?.error === "forum-topic-has-replies") {
          globalNotification.error({
            title: "Error",
            description: "Não é possível apagar o tópico, pois existe pelo menos uma resposta criada.",
          });
        } else {
          globalNotification.error({
            title: "Error",
            description: "Não foi possível remover o tópico.",
          });
        }
        setLoading(false);
      },
    });
  };

  const handleSearchTopic = (value) => {
    const term = (value || "").trim();
    setSearchTitle(term);
    setPage(1);
    handleListTopics(term, 1);
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
    const formattedValues = {
      ...values,
      content: values.content
        ?.replace(/\n{3,}/g, "\n\n")
        .trim()
    };
    if (editingTopic) {
      handleUpdateTopic(formattedValues);
      return;
    }
    handleCreateTopic(formattedValues);
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
        onSearchClear={() => {
          setSearchTitle("");
          setPage(1);
          handleListTopics("", 1);
        }}
        categoryName={categoryName}
        categoryDescription={categoryDescription}
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
      {!loading && totalCount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '24px' }}>
          <Pagination
            current={page}
            pageSize={10}
            total={totalCount}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}

export default TopicPage;
