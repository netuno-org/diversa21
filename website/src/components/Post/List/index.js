import { useEffect, useState } from "react";
import _service from "@netuno/service-client";
import Post from "..";

import "./index.less";

function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPosts();
  }, []);

  const onCreated = (post) => {
    setPosts([post, ...posts]);
  };

  const getPosts = () => {
    _service({
      url: "post/list",
      success: (response) => {
        setPosts(response.json);
      },
      fail: (e) => {
        console.log("Service Error", e);
      },
    });
  };

  return (
    <div className="posts">
      
      {
        posts.map((post) => <Post {...post} />)
      }
    </div>
  );
}

export default PostList;
