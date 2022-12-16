import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import _service from "@netuno/service-client";
import _auth from "@netuno/auth-client";
import Post from "../../components/Post";

import "./index.less"
import Editor from "../../components/Post/Editor";
import PostList from "../../components/Post/List";

function Posts() {
  
  const onCreated = (post) => {
   // setPosts([post, ...posts]);
  };
  
  if (!_auth.isLogged()) {
    return <Navigate to="/login" />;
  }
  return (
    <div className="posts">
      <Editor onCreated={onCreated}/>
      <PostList/>
    </div>
  );
}

export default Posts;
