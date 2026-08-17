import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import _service from "@netuno/service-client";
import usePeople from "../../../common/usePeople.js";

import globalNotification from "../../../common/globalNotification.js";
import SupportCommunityDisplay from "../../../components/SupportCommunityDisplay";

import { Button, Divider, Typography } from "antd";
import {
  ArrowLeftOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { LuReply } from "react-icons/lu";
import { VscCommentDiscussionQuote } from "react-icons/vsc";

import "./index.less";

const { Title, Text, Paragraph } = Typography;

function Replies({ topicUid }) {
  const loggedUser = usePeople();
  const navigate = useNavigate();
  const { categoryUid } = useParams();

  const [replyList, setReplyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReply, setEditingReply] = useState(null);
  const [topic, setTopic] = useState(null);
  const [repliesCount, setRepliesCount] = useState(0);

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
          setTopic(json.data);
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
          setReplyList(json.data.items || [])
          setRepliesCount(json.data.pagination?.totalCount ?? 0);
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
    <div className="replies">
      <div className="replies-header">
        <Button
          type="link"
          className="replies-header__back"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Voltar aos tópicos
        </Button>
        <div className="replies-header__topic">
          <div className="replies-header__icon">
            <TagsOutlined />
          </div>
          <div className="replies-header__topic-body">
            <Title level={4} className="replies-header__title">
              {topic?.title}
            </Title>
            <div className="replies-header__meta">
              <LuReply />
              <Text>
                {repliesCount} resposta{repliesCount !== 1 ? "s" : ""}
                {topic?.people?.name ? ` | ${topic.people.name}` : ""}
              </Text>
            </div>
          </div>
        </div>
        {topic?.content && (
          <Paragraph
            ellipsis={{ rows: 2, tooltip: true }}
            className="replies-header__description"
          >
            {topic.content}
          </Paragraph>
        )}
        {topic?.category?.name && (
          <>
            <Divider />
            <div className="replies-header__category">
              <div className="replies-header__icon replies-header__icon--category">
                <FolderOpenOutlined />
              </div>
              <div className="replies-header__category-text">
                <Text className="replies-header__category-label">
                  Categoria selecionada:
                </Text>
                <Text className="replies-header__category-name">
                  {topic.category.name}
                </Text>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="replies__actions">
        <Button type="primary" icon={<VscCommentDiscussionQuote />}  onClick={openCreateModal}>
          Responder
        </Button>
      </div>
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
