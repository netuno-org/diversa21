import { useEffect, useState, useRef } from "react";
import _service from "@netuno/service-client";
import { Comment, Card, Avatar, Button, Popconfirm, notification } from "antd";
import { DeleteOutlined, EditOutlined, LikeOutlined, LikeTwoTone } from "@ant-design/icons";
import momentjs from "moment";
import Editor from "./Editor";
import PostList from "./List";
import "./index.less";

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

  const refPostList = useRef();

  useEffect(() => {
    if (people.avatar) {
      setAvatarUrl(
        `${_service.config().prefix}/people/avatar?uid=${people.uid
        }&${new Date().getTime()}`
      );
    }
  }, []);

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
          message: "Post apagado com sucesso."
        });

        onRemovePost(uid);
      },
      fail: (e) => {
        notification.error({
          message: "Falha ao deletar post."
        });
        console.error("Service Error", e);
      }
    })
  };
  
  const onLike= () => {
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
            message: "Falha ao dar o like."
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
            message: "Falha ao remover o like."
          });
          console.error("Service Error", e);
        }
      });
    }
  }

  return (
    <Card className="post-container">
      <Comment
        actions={[
          <div>
            <Button type='link' onClick={onLike}>
              { isLiked ? <LikeTwoTone/> : <LikeOutlined />}
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
              onSubmited={onCreated}
              parent={uid}
            />
          ),
          !editMode && showComments && (
            <PostList
              ref={refPostList}
              parent={uid}
              onLoaded={onCommentsLoaded}
            />
          )
        ].filter((item) => item)}
        datetime={(
          <>
            <div
              style={{
                width: "100%"
              }}
            >
              <Avatar style={{ marginRight: '12px'}} src={avatarUrl} alt={people.name} />
              {people.name}
            </div>
            <span>
              {/* {momentjs(moment).startOf('hour').fromNow()} */}
              {/* {momentjs(moment).startOf('day').fromNow()} */}
              {momentjs(moment).format("lll")}
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
                >
                  <EditOutlined />
                </Button>
              )}
            </span>
          </>
        )}
        content={editMode ? (
          <Editor
            uid={uid}
            type="editPost"
            content={content}
            onCancel={() => setEditMode(false)}
            onSubmited={(values) => {
              onEditPost(uid, values.content);
              setEditMode(false);
            }}
          />
        ) : content}
      >
      </Comment>
    </Card>
  );
}

export default Post;
