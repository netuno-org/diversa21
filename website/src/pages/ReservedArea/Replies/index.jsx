import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import _service from "@netuno/service-client";
import usePeople from "../../../common/usePeople.js";

import globalNotification from "../../../common/globalNotification.js";
import SupportCommunityDisplay from "../../../components/SupportCommunityDisplay";
import ContentActions from "../../../components/ContentActions";

import TimeAgo from "../../../components/TimeAgo/index.jsx";

import { Button, Divider, Typography, Avatar, Pagination } from "antd";
import {
  ArrowLeftOutlined,
  FolderOpenOutlined,
  UserOutlined,
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
  const [editingTopic, setEditingTopic] = useState(null);
  const [topic, setTopic] = useState(null);
  const [repliesCount, setRepliesCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingLike, setLoadingLike] = useState(null)
  const [isAnonymous, setIsAnonymous] = useState(false);
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
    fetchTopic();
    handleListReplies(page);
  }, [topicUid, page]);

  const fetchTopic = () => {
    if (!topicUid) {
      return;
    }
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
  };

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
        isAnonymous,
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
          fetchTopic();
          setLoading(false);
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
          navigate(`/c/${categoryUid}`);
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

  const handleLikeReply = (reply) => {
    if (loadingLike) {
      return;
    }
    const isLiked = !!reply.liked;

    setLoadingLike(reply.uid)

    _service({
      url: "/forum/reply/like",
      method: isLiked ? "DELETE" : "POST",
      data: { uid: reply.uid },
      success: ({ json }) => {
        if (json?.data) {
          const { liked, likes } = json.data;
          setReplyList((items) =>
            items.map((item) => {
              if (item.uid !== reply.uid) {
                return item;
              }
              return {
                ...item,
                liked,
                likes,
              };
            })
          );
        }
        setLoadingLike(null);
      },
      fail: (error) => {
        globalNotification.error({
          title: "Error",
          description: isLiked
            ? "Não foi possível remover o like."
            : "Não foi possível dar o like.",
        });
        console.log("Service Error", error);
        setLoadingLike(null);
      },
    });
  };

  const openCreateModal = () => {
    setEditingReply(null);
    setEditingTopic(null);
    setShowModal(true);
  };

  const openEditModal = (reply) => {
    setEditingTopic(null);
    setEditingReply(reply);
    setShowModal(true);
  };

  const openEditTopic = () => {
    setEditingReply(null);
    setEditingTopic(topic);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReply(null);
    setEditingTopic(null);
    setIsAnonymous(false);
  };

  const handleAnonymousChange = (checked) => {
    setIsAnonymous(checked);
  };

  const onFinish = (values) => {
    if (editingTopic) {
      handleUpdateTopic({
        ...values,
        content: values.content
          ?.replace(/\n{3,}/g, "\n\n")
          .trim(),
      });
      return;
    }
    if (editingReply) {
      handleUpdateReply(values);
      return;
    }
    handleCreateReply(values);
  };

  const canManageTopic = loggedUser.canManagePosts()
    || topic?.isOwner === true
    || topic?.people?.uid === loggedUser.data?.uid;
  const isOwnTopic = topic?.isOwner === true || topic?.people?.uid === loggedUser.data?.uid;

  return (
    <div className="replies">
      <div className="replies-header">
        <Button
          type="link"
          className="replies-header__back"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Voltar
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
            {topic?.anonymous === true ? (
              <div className="replies-header__icon replies-header__icon--anonymous">
                <UserOutlined />
              </div>
            ) : (
              <Link to={`/u/${topic?.people?.user}`}>
                <Avatar
                  className="replies-header__avatar"
                  size={50}
                  src={avatarUrl}
                  shape="square"
                />
              </Link>
            )}
            <div className="replies-header__meta">
              <div>
                <span className="replies-header__author-info">
                  Autor:{" "}
                  {topic?.anonymous === true ? (
                    "Anônimo"
                  ) : (
                    <Link
                      className="replies-header__title-link"
                      to={`/u/${topic?.people?.user}`}
                    >
                      {topic?.people?.name}
                    </Link>
                  )}
                </span>
                <span className="replies-header__meta-item">
                  <TimeAgo sentAt={topic?.moment} className="replies-header__time-ago" />
                </span>
              </div>
            </div>
            {topic && (
              <div className="replies-header__actions">
                <ContentActions
                  canViewDeletePostButton={canManageTopic}
                  canViewReportButton={!isOwnTopic}
                  onDeletePost={() => handleDeleteTopic(topic.uid)}
                  onEdit={openEditTopic}
                />
              </div>
            )}
          </div>
          <p className="replies-header__title">
            {topic?.title}
          </p>
          {topic?.content && (
            <Paragraph className="replies-header__description">
              {topic.content}
            </Paragraph>
          )}
        </div>
        <div className="replies__actions">
          <Button type="primary" icon={<VscCommentDiscussionQuote />} onClick={openCreateModal}>
            Responder
          </Button>
        </div>
      </div>
      {topic?.repliesCount > 0 && (
        <div className="replies__stats">
          <span className="replies__stats-item">
            {topic.repliesCount} Resposta{topic.repliesCount !== 1 ? "s" : ""} Encontrada{topic.repliesCount !== 1 ? "s" : ""}
          </span>
          {topic.lastActivityAt && (
            <span className="replies__stats-item">
              &nbsp;· Última:
              <TimeAgo sentAt={topic.lastActivityAt} className="replies-header__time-ago" />
            </span>
          )}
        </div>
      )}
      <SupportCommunityDisplay
        loading={loading}
        showModal={showModal}
        onCancel={closeModal}
        editingReply={editingReply}
        editingTopic={editingTopic}
        onFinish={onFinish}
        listItems={replyList}
        loggedUser={loggedUser}
        openEditModal={openEditModal}
        handleDelete={handleDeleteReply}
        handleLike={handleLikeReply}
        loadingLike={loadingLike}
        anonymous={isAnonymous}
        onAnonymousChange={handleAnonymousChange}
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
