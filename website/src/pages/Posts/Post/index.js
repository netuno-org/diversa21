import { useEffect, useState } from "react";
import _service from "@netuno/service-client";
import { Comment, Card, Avatar } from "antd";

function Post({ uid, moment, content, people }) {
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");
  useEffect(() => {
    if (people.avatar) {
      setAvatarUrl(
        `${_service.config().prefix}/people/avatar?uid=${
          people.uid
        }&${new Date().getTime()}`
      );
    }
  }, []);
  return (
    <Card>
      <Comment
        actions={[<span key="comment-nested-reply-to">Reply to</span>]}
        author={people.name}
        datetime={moment}
        avatar={<Avatar src={avatarUrl} alt={people.name} />}
        content={content}
      ></Comment>
    </Card>
  );
}

export default Post;
