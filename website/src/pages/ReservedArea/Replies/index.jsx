import { useState, useEffect } from "react";
import usePeople from "../../../common/usePeople.js";
import _service from "@netuno/service-client";
import globalNotification from "../../../common/globalNotification.js"

import ListHeaderFilters from "../../../components/ListHeaderFilters";
import SupportCommunityDisplay from "../../../components/SupportCommunityDisplay"
import { PlusOutlined } from "@ant-design/icons";

function Replies({ topicUid }) {
  const loggedUser = usePeople();

  const [replyList, setReplyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReply, setEditingReply] = useState(null);
  const [topicName, setTopicName] = useState("");
  const [topicContent, setTopicContent] = useState("");

  const mode = 'reply'

  useEffect(() => {
    if (!topicUid) {
      return
    };
    _service({
      method: "GET",
      url: "/forum/topic",
      data: { uid: topicUid },
      success: ({ json }) => {
        if (json) {
          setTopicName(json.data.title);
          setTopicContent(json.data.content);
        }
      },
      fail: (e) => {
        console.log("Service Error", e);
      },
    });
    handleListReplies();
  }, [topicUid]);

  const handleListReplies = () => {
    if (!topicUid) {
      return
    };
    setLoading(true);
    _service({
      method: "GET",
      url: "/forum/reply/list",
      data: { topicUid },
      success: ({ json }) => {
        if (json) {
          setReplyList(json.data.items || []);
        }
        setLoading(false);
      },
      fail: (e) => {
        console.log("Service Error", e);
        setLoading(false);
      },
    });
  };

  const handleCreateReply = (values) => {
    setLoading(true);
    _service({
      method: "POST",
      url: "/forum/reply",
      data: {
        topicUid,
        content: values.content,
      },
      success: ({ json }) => {
        if (json) {
          globalNotification.success({
            title: "Resposta Criada",
            description: "A resposta foi criada com sucesso.",
          });
          closeModal();
          handleListReplies();
          return;
        }
        setLoading(false);
      },
      fail: (e) => {
        globalNotification.error({
          title: "Error",
          description: "Não foi possível criar a resposta.",
        });
        console.log("Service Error", e);
        setLoading(false);
      },
    });
  };

  const handleUpdateReply = (values) => {
    setLoading(true);
    _service({
      method: "PUT",
      url: "/forum/reply",
      data: {
        uid: editingReply.uid,
        content: values.content,
      },
      success: ({ json }) => {
        if (json) {
          globalNotification.success({
            title: "Resposta Atualizada",
            description: "A resposta foi atualizada com sucesso.",
          });
          closeModal();
          handleListReplies();
          return;
        }
        setLoading(false);
      },
      fail: (e) => {
        globalNotification.error({
          title: "Error",
          description: "Não foi possível atualizar a resposta.",
        });
        console.log("Service Error", e);
        setLoading(false);
      },
    });
  };

  const handleDeleteReply = (uid) => {
    setLoading(true);
    _service({
      method: "DELETE",
      url: "/forum/reply",
      data: { uid },
      success: ({ json }) => {
        if (json) {
          globalNotification.success({
            title: "Resposta Removida",
            description: "A resposta foi removida com sucesso.",
          });
          handleListReplies();
          return;
        }
        setLoading(false);
      },
      fail: (e) => {
        globalNotification.error({
          title: "Error",
          description: "Não foi possível remover a resposta.",
        });
        console.log("Service Error", e);
        setLoading(false);
      },
    });
  };

  const openCreateModal = () => {
    setEditingReply(null);
    setShowModal(true);
  };

  const openEditModal = (reply) => {
    setEditingReply(reply);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReply(null);
  };

  const onFinish = (values) => {
    if (editingReply) {
      handleUpdateReply(values);
      return;
    }
    handleCreateReply(values);
  };

  return (
    <div>
      <ListHeaderFilters
        title='Rede de apoio'
        createButton={{
          icon: <PlusOutlined />,
          text: "Responder",
          onClick: openCreateModal,
        }}
        hideLocation={true}
        hideInputs={true}
        topicName={topicName}
        topicContent={topicContent}
      />
      <SupportCommunityDisplay
        loading={loading}
        showModal={showModal}
        onCancel={closeModal}
        editingReply={editingReply}
        onFinish={onFinish}
        listItems={replyList}
        loggedUser={loggedUser}
        openEditModal={openEditModal}
        handleDelete={handleDeleteReply}
        mode={mode}
      />
    </div>
  );
}

export default Replies;
