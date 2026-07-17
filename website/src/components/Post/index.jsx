import React, { useEffect, useState, useRef } from "react";
import { connect } from 'react-redux';
import _service from "@netuno/service-client";
import { Space, Tag, Card, Avatar, Button, Popconfirm } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DeleteOutlined, EditOutlined, LikeOutlined, LikeFilled } from "@ant-design/icons";
import { RiArrowGoBackLine } from "react-icons/ri";
import { FaRegComment } from "react-icons/fa";

import TimeAgo from "../../components/TimeAgo"
import Editor from "./Editor";
import PostList from "./List";
import "./index.less";
import usePeople from "../../common/usePeople.js";
import globalNotification from "../../common/globalNotification.js";

function Post({
  uid,
  parentUid,
  parentPeopleUser,
  rootUid,
  moment,
  content,
  comments,
  likes,
  liked,
  type,
  people,
  onRemovePost,
  onEditPost,
  isolatedCommentUid
}) {
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");
  const [showEditor, setShowEditor] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [countComments, setCountComments] = useState(comments);
  const [loadingComments, setLoadingComments] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isLiked, setIsLiked] = useState(liked);
  const [likesCounter, setLikesCounter] = useState(likes);
  const [loadingLike, setLoadingLike] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  const refPostList = useRef(null);
  const postCardRef = useRef(null);

  const loggedUser = usePeople();
  const location = useLocation();
  const navigate = useNavigate();

  const isAlreadyIsolated = location.pathname === `/p/${uid}`;
  const canViewDeletePostButton = people.uid === loggedUser.data?.uid || loggedUser.canManagePosts();

  useEffect(() => {
    if (people?.avatar) {
      setAvatarUrl(
        _service.url(`/asset?uid=${people.uid}&type=avatar&entity=people`)
      );
    }
  }, [people]);

  useEffect(() => {
    if (isAlreadyIsolated) {
      setIsHighlighted(true);
      setTimeout(() => {
        postCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (countComments > 0 && !showComments) {
          setShowComments(true);
          setLoadingComments(true);
        }
        setTimeout(() => setIsHighlighted(false), 3000);
      }, 500);
    }
  }, [location.state, uid, countComments, showComments, isAlreadyIsolated]);

  useEffect(() => {
    if (isolatedCommentUid && countComments > 0 && !showComments) {
      setShowComments(true);
      setLoadingComments(true);
    }
  }, [isolatedCommentUid, countComments, showComments]);

  const handleCardClick = (e) => {
    if (isAlreadyIsolated || editMode) {
      return;
    }
    if (e.target.closest('.post-actions-wrapper')
      || e.target.closest('.user-info-actions')
      || e.target.closest('a')) {
      return;
    }
    navigate(`/p/${uid}`);
  };

  const onCommentRemoved = () => setCountComments(countComments - 1);

  const onCreated = (post) => {
    setCountComments(countComments + 1);
    if (refPostList.current) {
      refPostList.current.newPost(post);
    }
    setShowEditor(false);
  };

  const onCommentsLoaded = () => setLoadingComments(false);

  const onDeletePost = (e) => {
    e.stopPropagation();
    _service({
      url: "/post",
      method: "DELETE",
      data: { uid },
      success: () => {
        globalNotification.success({
          title: "Post apagado com sucesso."
        });
        onRemovePost(uid);
      },
      fail: (e) => {
        globalNotification.error({
          title: "Falha ao deletar post."
        });
        console.error("Service Error", e);
      }
    });
  };

  const onLike = () => {
    if (loadingLike) return;
    setLoadingLike(true);
    if (!isLiked) {
      _service({
        url: 'post/like',
        method: 'POST',
        data: { uid },
        success: () => {
          setIsLiked(true);
          setLikesCounter(likesCounter + 1);
          setLoadingLike(false);
        },
        fail: (e) => {
          globalNotification.error({ title: "Falha ao dar o like." });
          console.error("Service Error", e);
          setLoadingLike(false);
        }
      });
    } else {
      _service({
        url: 'post/like',
        method: 'DELETE',
        data: { uid },
        success: () => {
          setIsLiked(false);
          setLikesCounter(likesCounter - 1);
          setLoadingLike(false);
        },
        fail: (e) => {
          globalNotification.error({ title: "Falha ao remover o like." });
          console.error("Service Error", e);
          setLoadingLike(false);
        }
      });
    }
  };

  const displayContent = content.split('\n').map((line, index, array) => (
    <React.Fragment key={index}>
      {line}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));

  // Texto contextual de atividade
  const activityLabel = type === 'comment' && parentPeopleUser
    ? <span className="activity-context-label"><Link to={`/u/${people.user}`}>@{people.user}</Link> comentou num post de <Link to={`/u/${parentPeopleUser}`}>@{parentPeopleUser}</Link></span>
    : type === 'like' && parentPeopleUser
      ? <span className="activity-context-label"><Link to={`/u/${people.user}`}>@{people.user}</Link> curtiu de um post de <Link to={`/u/${parentPeopleUser}`}>@{parentPeopleUser}</Link></span>
      : null;

  return (
    <Card
      className={`post-container 
        ${isHighlighted ? 'post-container--highlight' : ''} 
        ${!isAlreadyIsolated ? 'post-container--clickable' : ''}`}
      ref={postCardRef}
      onClick={handleCardClick}
      style={{ cursor: !isAlreadyIsolated ? 'pointer' : 'default' }}
    >
      {activityLabel && (
        <div className="activity-context-bar">
          {activityLabel}
        </div>
      )}

      <div className="header-user-info-container">
        <div className="user-info-left">
          <Link to={`/u/${people.user}`}>
            <Avatar
              size={50}
              className="user-avatar"
              src={avatarUrl}
              alt={people.name}
              shape="square"
            />
          </Link>
          <div className="user-info-text">
            <Link className="user-name-link" to={`/u/${people.user}`}>
              <p className="user-name">{people.name}</p>
            </Link>
            <TimeAgo sentAt={moment} className="post-date" />
          </div>
        </div>

        <div className="user-info-actions">
          <div className="parent-nav-tags" onClick={(e) => e.stopPropagation()}>
            {parentUid && (
              <Tag
                className="btn-parent-nav"
                color="purple"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/p/${parentUid}`)}
              >
                Ver resposta
              </Tag>
            )}
            {rootUid && rootUid !== parentUid && rootUid !== uid && (
              <Tag
                className="btn-parent-nav"
                color="default"
                style={{ cursor: 'pointer' }}
                onClick={() => { console.log('tag clicked', rootUid); navigate(`/p/${rootUid}`); }}
              >
                Ver post original
              </Tag>
            )}
          </div>
          {canViewDeletePostButton && (
            <>
              <Popconfirm
                title="Tem a certeza que quer remover a postagem?"
                description="Esta ação é irreversível"
                onConfirm={onDeletePost}
                okText="Sim"
                cancelText="Não"
              >
                <Button danger type="link" className="delete-post-button">
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
              {!editMode && (
                <Button type="link" onClick={() => setEditMode(true)} className="edit-post-button">
                  <EditOutlined />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {editMode ? (
        <Editor
          uid={uid}
          type="editPost"
          content={content}
          onCancel={() => setEditMode(false)}
          onSubmitted={(values) => {
            onEditPost(uid, values.content);
            setEditMode(false);
            if (refPostList.current) {
              refPostList.current.newPost(values);
            }
          }}
        />
      ) : (
        <div className="post-text-container">{displayContent}</div>
      )}

      {!editMode && (
        <div className="post-actions-wrapper">
          <div className="post-actions-buttons">
            <Button type="link" onClick={onLike} className="btn-like" loading={loadingLike} disabled={loadingLike}>
              {isLiked ? <LikeFilled /> : <LikeOutlined />}
              &nbsp;{likesCounter}
            </Button>

            {countComments > 0 && (
              <Button
                type="link"
                className="btn-load-comments"
                onClick={() => {
                  setShowComments(!showComments);
                  if (!showComments) {
                    setLoadingComments(true);
                  }
                }}
                loading={loadingComments}
              >
                {showComments ? (
                  "Esconder comentários"
                ) : (
                  <Space size="small">
                    Ver comentários
                    <Tag color="#8A6AA2" variant="solid" style={{ margin: 0, borderRadius: '32px' }}>
                      {countComments}
                    </Tag>
                  </Space>
                )}
              </Button>
            )}

            {!showEditor && (
              <Button className="btn-reply" onClick={() => setShowEditor(true)}>
                <RiArrowGoBackLine /> Responder
              </Button>
            )}
          </div>

          {showEditor && (
            <Editor
              type="comment"
              onCancel={() => setShowEditor(false)}
              onSubmitted={onCreated}
              parent={uid}
            />
          )}

          {showComments && (
            <PostList
              ref={refPostList}
              parent={uid}
              isolatedCommentUid={isolatedCommentUid}
              onLoaded={onCommentsLoaded}
              onItemRemoved={onCommentRemoved}
            />
          )}
        </div>
      )}
    </Card>
  );
}

export default Post;