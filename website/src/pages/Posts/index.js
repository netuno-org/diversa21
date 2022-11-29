import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import _service from "@netuno/service-client";
import _auth from "@netuno/auth-client";
import Post from "./Post";


function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPosts();
  }, []);

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

  if (!_auth.isLogged()) {
    return <Navigate to="/login" />;
  }
  return (
    <div>
        {
          posts.map((post) => <Post {...post}/>)
        }
    </div>
  );
}

export default Posts;
