import { useEffect, useState, useRef } from "react";
import _service from "@netuno/service-client";
import { Comment, Card, Avatar, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons"
import momentjs from "moment";
import Editor from "./Editor";
import PostList from "./List";
import "./index.less";

function Post({
  uid,
  moment,
  content,
  comments,
  people
}) {
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");
  const [showEditor, setShowEditor] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [countComments, setCountComments] = useState(comments);
  const [loadingComments, setLoadingComments] = useState(false);

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

  return (
    <Card className="post-container">
      <Comment
        actions={[
          <div>
            {!showEditor && (
              <Button onClick={() => setShowEditor(true)}>Responder</Button>
            )}

            {countComments > 0 && (
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
              onCreated={onCreated}
              parent={uid}
            />
          ),
          showComments && (
            <PostList
              ref={refPostList}
              parent={uid}
              onLoaded={onCommentsLoaded}
            />
          )
        ].filter((item) => item)}
        author={people.name}
        datetime={(
          <span>
            {momentjs(moment).format("lll")}
            <Button
              danger
              type="link"
              className="delete-post-button"
            >
              <DeleteOutlined />
            </Button>
          </span>
        )}
        avatar={<Avatar src={avatarUrl} alt={people.name} />}
        content={content}
      >
      </Comment>
    </Card>
  );
}

export default Post;
