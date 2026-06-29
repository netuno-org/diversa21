import React, { useEffect, useState, useImperativeHandle } from "react";
import _service from "@netuno/service-client";
import { Button, Col, notification, Row, Spin, Empty } from "antd";
import Post from "../../Post";

function ActivityList({ author, parent, institution, onLoaded, onItemRemoved }, ref) {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    getPosts();
  }, [page]);

  const newPost = (post) => {
    setPosts([post, ...posts]);
  };

  const getPosts = () => {
    setLoadingPosts(true);

    const data = {};

    if (parent) {
      data.parent = parent;
    }

    if (institution) {
      data.institutionUid = institution;
    }

    if (author) {
      data.peopleUid = author;
    }

    data.page = page;

    _service({
      url: "activity/list",
      data,
      success: (response) => {
        if (onLoaded) {
          onLoaded();
        }

        setLoadingPosts(false);
        setPosts([...posts, ...response.json.data.items]);
      },
      fail: (e) => {
        if (onLoaded) {
          onLoaded();
        }
        setLoadingPosts(false);
        notification.error({
          title: `Falha ao carregar ${parent ? "comentários" : "posts"}`,
        });
        console.error("Service Error", e);
      },
    });
  };

  useImperativeHandle(ref, () => ({
    newPost
  }));

  const onLoadMorePosts = () => {
    setPage(page + 1);
  };

  const onRemovePost = (uid) => {
    setPosts(posts.filter((post) => post.uid !== uid));
    if (onItemRemoved) {
      onItemRemoved();
    }
  };

  const onEditPost = (uid, content) => {
    setPosts(posts.map((post) => {
      if (post.uid === uid) {
        return {
          ...post,
          content
        };
      }

      return post;
    }));
  }

  if ((!parent && loadingPosts) && page === 0) {
    return (
      <Row style={{ marginTop: 20 }} justify="center">
        <Col>
          <Spin size="large" />
        </Col>
      </Row>
    );
  }

  return (
    <div>
      {
        posts.map((post) => (
          <Post
            key={post.uid}
            {...post}
            parentUid={post.parentUid}
            onRemovePost={onRemovePost}
            onEditPost={onEditPost}
          />
        ))
      }

      {!loadingPosts && posts.length === 0 && (
        <div style={{ padding: '40px 20px', background: '#fff', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
          <Empty
            description={"Ainda não existe atividade."}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}

      {!loadingPosts && parent && posts.length >= 10 && (
        <Button
          type="link"
          onClick={onLoadMorePosts}
        >
          Mostrar mais
        </Button>
      )}

      {loadingPosts && page > 0 && (
        <Row justify="center" style={{ marginTop: 20 }}>
          <Col>
            <Spin size="large" />
          </Col>
        </Row>
      )}
    </div>
  );
}

export default React.forwardRef(ActivityList);
