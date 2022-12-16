import { useEffect, useState } from "react";
import _service from "@netuno/service-client";
import { Comment, Card, Avatar, Button } from "antd";
import Editor from "./Editor";
import "./index.less";

function Post({ uid, moment, content, people }) {
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");
  const [showEditor, setShowEditor] = useState(false);
  useEffect(() => {
    if (people.avatar) {
      setAvatarUrl(
        `${_service.config().prefix}/people/avatar?uid=${
          people.uid
        }&${new Date().getTime()}`
      );
    }
  }, []);
  const onCreated = (post) => {
    console.log(post);
  };
  return (
    <Card className="post-container">
      <Comment
        actions={[
          showEditor ? (
            <Editor
              type="comment"
              onCancel={() => setShowEditor(false)}
              onCreated={onCreated}
              parent={uid}
            />
          ) : (
            <Button onClick={() => setShowEditor(true)}>Responder</Button>
          ),
        ]}
        author={people.name}
        datetime={moment}
        avatar={<Avatar src={avatarUrl} alt={people.name} />}
        content={content}
      ></Comment>
    </Card>
  );
}

export default Post;
