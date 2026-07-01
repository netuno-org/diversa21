import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Editor from "../../../components/Post/Editor";
import PostList from "../../../components/Post/List";
import _service from "@netuno/service-client";

import "./index.less";

function Posts() {
  const refPostList = useRef(null);
  const navigate = useNavigate();

  const { uid } = useParams();
  const [searchParams] = useSearchParams();
  
  const rawC = searchParams.get('c');
  const commentUid = rawC === "undefined" ? null : rawC;
  const isolatedUid = uid === "undefined" ? null : uid;

  const onCreated = (post) => {
    if (refPostList.current) {
      refPostList.current.newPost(post);
    }
  };

  const handleClearIsolation = () => {
    navigate('/posts');
  };

  return (
    <div className="posts">
      {isolatedUid ? (
        <div className="posts__isolated-header" style={{ marginBottom: 24 }}>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={handleClearIsolation}
            style={{ padding: 0, fontSize: '16px', color: '#8A6AA2' }}
          >
            Ver todas as publicações
          </Button>
        </div>
      ) : (
        <Editor type="post" onSubmitted={onCreated} />
      )}

      <PostList
        ref={refPostList}
        isolatedUid={isolatedUid}
        isolatedCommentUid={commentUid}
        key={isolatedUid || 'all'}
      />
    </div>
  );
}

export default Posts;
