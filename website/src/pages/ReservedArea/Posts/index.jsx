import { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Editor from "../../../components/Post/Editor";
import PostList from "../../../components/Post/List";

import "./index.less";

function Posts() {
  const refPostList = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isolatedUid = location.state?.autoOpenPostUid;

  const onCreated = (post) => {
    if (refPostList.current) {
      refPostList.current.newPost(post);
    }
  };

  const handleClearIsolation = () => {
    navigate('/posts', { replace: true, state: {} });
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
        key={isolatedUid || 'all'}
      />
    </div>
  );
}

export default Posts;
