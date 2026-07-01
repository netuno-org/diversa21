import { useEffect, useState } from "react";
import Post from "../../../components/Post";
import _service from "@netuno/service-client";

function PostPage({ uid }) {
  const [post, setPost] = useState({});

  const onRemovePost = (uid) => {
    setPosts(posts.filter((post) => post.uid !== uid));
    if (onItemRemoved) onItemRemoved();
  };

  const onEditPost = (uid, content) => {
    setPosts(posts.map((post) => post.uid === uid ? { ...post, content } : post));
  }

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
    })
  };

  if (Object.keys(post).length === 0) {
    return;
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
