import { useEffect, useState } from "react";
import Post from "../../../components/Post";
import _service from "@netuno/service-client";

function PostPage({ uid }) {
  const [post, setPost] = useState({});

  const onRemovePost = (uid) => {
    setPost({});
  };

  const onEditPost = (uid, content) => {
    setPost(prev => ({ ...prev, content }));
  };

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = () => {
    _service({
      url: "/post",
      data: {
        uid
      },
      success: (response) => {
        const post = response.json.data;
        setPost(post);
      },
      fail: () => {
        console.log("falha ao carregar post");
      }
    });
  };

  if (Object.keys(post).length === 0) {
    return null;
  }

  return (
    <Post
      {...post}
      onRemovePost={onRemovePost}
      onEditPost={onEditPost}
    />
  );
}

export default PostPage;
