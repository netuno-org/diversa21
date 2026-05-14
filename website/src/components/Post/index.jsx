import { useEffect, useState, useRef } from "react";
import { connect } from 'react-redux';
import _service from "@netuno/service-client";
import { Link } from "react-router-dom";
import { Card, Avatar, Button, Popconfirm, notification } from "antd";
import { DeleteOutlined, EditOutlined, LikeOutlined, LikeFilled } from "@ant-design/icons";
import momentjs from "moment";
import Editor from "./Editor";
import PostList from "./List";
import "./index.less";
import usePeople from "../../common/usePeople.js";

function Post({
  uid,
  moment,
  content,
  comments,
  likes,
  liked,
  people,
  onRemovePost,
  onEditPost
}) {
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");
  const [showEditor, setShowEditor] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [countComments, setCountComments] = useState(comments);
  const [loadingComments, setLoadingComments] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isLiked, setIsLiked] = useState(liked);
  const [likesCounter, setLikesCounter] = useState(likes);

  const refPostList = useRef(null);

  const userPeople = usePeople();

  useEffect(() => {
    if (people.avatar) {
      setAvatarUrl(
        _service.url(`/people/avatar?uid=${people.uid}`)
      );
    }
  }, []);

  const onCommentRemoved = () => {
    setCountComments(countComments - 1);
  }

  const onCreated = (post) => {
    setCountComments(countComments + 1);

    if (refPostList.current) {
      refPostList.current.newPost(post);
    }

    setShowEditor(false);
  };

  const onCommentsLoaded = () => {
    setLoadingComments(false);
  };

  const onDeletePost = () => {
    _service({
      url: "/post",
      method: "DELETE",
      data: {
        uid
      },
      success: (respo) => {
        notification.success({
          title: "Post apagado com sucesso."
        });
        onRemovePost(uid);
      },
      fail: (e) => {
        notification.error({
          title: "Falha ao deletar post."
        });
        console.error("Service Error", e);
      }
    })
  };

  const onLike = () => {
    if (!isLiked) {
      _service({
        url: 'post/like',
        method: 'POST',
        data: {
          uid
        },
        success: (response) => {
          setIsLiked(true);
          setLikesCounter(likesCounter + 1);
        },
        fail: (e) => {
          notification.error({
            title: "Falha ao dar o like."
          });
          console.error("Service Error", e);
        }
      });
    } else {
      _service({
        url: 'post/like',
        method: 'DELETE',
        data: {
          uid
        },
        success: (response) => {
          setIsLiked(false);
          setLikesCounter(likesCounter - 1);
        },
        fail: (e) => {
          notification.error({
            title: "Falha ao remover o like."
          });
          console.error("Service Error", e);
        }
      });
    }
  }

  return (
    <Card className="post-container">
      <>
        <div
          className="header-user-info-container"
        >
          <div style={{ display: "flex" }}>
            <Link to={`/u/${people.user}`}>
              <Avatar
                size={50}
                style={{ marginRight: '12px' }}
                src={avatarUrl}
                alt={people.name}
              />
            </Link>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Link style={{ fontSize: '20px' }} to={`/u/${people.user}`}>
                <p className="user-name">{people.name}</p>
              </Link>
              <span style={{ fontSize: '13px', color: '#8c8c8c' }}>
                {momentjs(moment).format("lll")}
              </span>
            </div>
          </div>
          <div>
            {people.uid === userPeople.data.uid && <>
              <Popconfirm
                title="Removendo post"
                onConfirm={onDeletePost}
              >
                <Button
                  danger
                  type="link"
                  className="delete-post-button"
                >
                  <DeleteOutlined />
                </Button>
              </Popconfirm>
              {!editMode && (
                <Button
                  type="link"
                  onClick={() => setEditMode(true)}
                  className="edit-post-button"
                >
                  <EditOutlined />
                </Button>
              )}
            </>}
          </div>
        </div>
      </>
      {
        editMode ? (
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
        ) : <div className="post-text-container">{content}</div>}
      {[
        <div>
          <Button type='link' onClick={onLike}>
            {isLiked ? <LikeFilled /> : <LikeOutlined />}
            &nbsp;{likesCounter}
          </Button>
          {!showEditor && !editMode && (
            <Button onClick={() => setShowEditor(true)}>Responder</Button>
          )}

          {!editMode && countComments > 0 && (
            <Button
              type="link"
              onClick={() => {
                setShowComments(!showComments);

                if (!showComments) {
                  setLoadingComments(true);
                }
              }}
              loading={loadingComments}
            >
              {showComments ? "Esconder comentários" : `Carregar comentários (${countComments})`}
            </Button>
          )}

        </div>,
        showEditor && (
          <Editor
            type="comment"
            onCancel={() => setShowEditor(false)}
            onSubmitted={onCreated}
            parent={uid}
          />
        ),
        !editMode && showComments && (
          <PostList
            ref={refPostList}
            parent={uid}
            onLoaded={onCommentsLoaded}
            onItemRemoved={onCommentRemoved}
          />
        )
      ]}
    </Card >
  );
}

export default Post;
