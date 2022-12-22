import { useRef } from "react";
import { Navigate } from "react-router-dom";
import _service from "@netuno/service-client";
import _auth from "@netuno/auth-client";
import Editor from "../../components/Post/Editor";
import PostList from "../../components/Post/List";

import "./index.less";

function Posts() {
  const refPostList = useRef();
  
  const onCreated = (post) => {
    if (refPostList.current) {
      refPostList.current.newPost(post);
    }
  };
  
  if (!_auth.isLogged()) {
    return <Navigate to="/login" />;
  }
  return (
    <div className="posts">
      <Editor onCreated={onCreated}/>
      <PostList ref={refPostList}/>
    </div>
  );
}

export default Posts;
