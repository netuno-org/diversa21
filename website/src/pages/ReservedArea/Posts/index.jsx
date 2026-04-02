import { useRef } from "react";
import Editor from "../../../components/Post/Editor";
import PostList from "../../../components/Post/List";

import "./index.less";

function Posts() {
  const refPostList = useRef(null);
  
  const onCreated = (post) => {
    if (refPostList.current) {
      refPostList.current.newPost(post);
    }
  };

  return (
    <div className="posts">
      <Editor type="post" onSubmitted={onCreated}/>
      <PostList ref={refPostList}/>
    </div>
  );
}

export default Posts;
