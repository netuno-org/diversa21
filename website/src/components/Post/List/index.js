import React, { useEffect, useState, useImperativeHandle } from "react";
import _service from "@netuno/service-client";
import { Button, Col, notification, Row, Spin } from "antd";
import Post from "..";

function PostList({ parent, onLoaded, onItemRemoved }, ref) {
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

    data.page = page;

    _service({
      url: "post/list",
      data,
      success: (response) => {
        if (onLoaded) {
          onLoaded();
        }

        setLoadingPosts(false);
        setPosts([...posts, ...response.json]);
      },
      fail: (e) => {
        if (onLoaded) {
          onLoaded();
        }

        setLoadingPosts(false);
        notification.error({
          message: `Falha ao carregar ${parent ? "comentários" : "posts"}`,
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
      <Row justify="center">
        <Col>
          <Spin />
        </Col>
      </Row>
    );
  }

  return (
    <div>
      {
        posts.map((post, index) => (
          <Post
            key={index}
            {...post}
            onRemovePost={onRemovePost}
            onEditPost={onEditPost}
          />
        ))
      }

      {!loadingPosts && parent && posts.length >= 10 && (
        <Button
          type="link"
          onClick={onLoadMorePosts}
        >
          Mostrar mais
        </Button>
      )}

      {loadingPosts && page > 0 && (
        <Row justify="center">
          <Col>
            <Spin />
          </Col>
        </Row>
      )}
    </div>
  );
}

export default React.forwardRef(PostList);
