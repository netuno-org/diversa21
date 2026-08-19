import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

import _service from "@netuno/service-client";
import usePeople from "../../../common/usePeople.js";

import globalNotification from "../../../common/globalNotification.js";
import SupportCommunityDisplay from "../../../components/SupportCommunityDisplay";

import TimeAgo from "../../../components/TimeAgo/index.jsx";

import { Button, Divider, Typography, Avatar, Pagination } from "antd";
import {
  ArrowLeftOutlined,
  FolderOpenOutlined,
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
  const [page, setPage] = useState(1);
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");

  const mode = 'reply'

  useEffect(() => {
    const people = topic?.people;
    if (people?.avatar && people?.uid) {
      setAvatarUrl(
        _service.url(`/asset?uid=${people.uid}&type=avatar&entity=people&t=${Date.now()}`)
      );
      return;
    }
    setAvatarUrl("/images/profile-default.png");
  }, [topic?.people]);

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
    handleListReplies(page);
  }, [topicUid, page]);

  const handleListReplies = (currentPage = page) => {
    if (!topicUid) {
      return
    };
    setLoading(true);
    _service({
      method: "GET",
      url: "/forum/reply/list",
      data: { topicUid, page: currentPage },
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
          setPage(1);
          handleListReplies(1);
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
          handleListReplies(page);
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
          handleListReplies(page);
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
          {topic?.category?.name && (
            <>
              <div className="replies-header__category">
                <div className="replies-header__icon replies-header__icon--category">
                  <FolderOpenOutlined />
                </div>
                <div className="replies-header__category-text">
                  <p className="replies-header__category-label">
                    Categoria selecionada:
                  </p>
                  <p className="replies-header__category-name">
                    {topic.category.name}
                  </p>
                </div>
              </div>
              <Divider />
            </>
          )}
          <div className="replies-header__topic-info">
            <Link to={`/u/${topic?.people?.user}`}>
              <Avatar
                className="replies-header__avatar"
                size={50}
                src={avatarUrl}
                shape="square"
              />
            </Link>
            <div className="replies-header__topic-body">
              <p className="replies-header__title">
                {topic?.title}
              </p>
              <div className="replies-header__meta">
                {topic?.people?.name && (
                  <span>
                    Autor :{" "}
                    <Link className="replies-header__title-link"
                      to={`/u/${topic?.people?.user}`}>
                      {topic.people.name}
                    </Link>
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TimeAgo sentAt={topic?.moment} className="replies-header__time-ago" />
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {topic?.repliesCount > 0 &&
                    <span>
                      <VscCommentDiscussionQuote /> {' '}
                      {topic?.repliesCount} resposta{topic?.repliesCount !== 1 ? "s" : ""}
                    </span>
                  }
                </div>
                {topic?.repliesCount > 0 && topic?.lastActivityAt && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    Última interação:
                    <TimeAgo sentAt={topic.lastActivityAt} className="replies-header__time-ago" />
                  </span>
                )}
              </div>
            </div>
          </div>
          {topic?.content && (
            <>
              <Paragraph
                className="replies-header__description"
              >
                text={topic.content}
              </Paragraph>
            </>
          )}
        </div>
        <div className="replies__actions">
          <Button type="primary" icon={<VscCommentDiscussionQuote />} onClick={openCreateModal}>
            Responder
          </Button>
        </div>
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
      {!loading && repliesCount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '24px' }}>
          <Pagination
            current={page}
            pageSize={10}
            total={repliesCount}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}

export default Replies;
