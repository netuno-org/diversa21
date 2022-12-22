import React, { useEffect, useState, useImperativeHandle } from "react";
import _service from "@netuno/service-client";
import { Col, notification, Row, Spin } from "antd";
import Post from "..";

function PostList({ parent, onLoaded }, ref) {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    getPosts();
  }, []);

  const newPost = (post) => {
    setPosts([post, ...posts]);
  };

  const getPosts = () => {
    setLoadingPosts(true);
    const data = {};

    if (parent) {
      data.parent = parent;
    }

    _service({
      url: "post/list",
      data,
      success: (response) => {
        if (onLoaded) {
          onLoaded();
        }

        setLoadingPosts(false);
        setPosts(response.json);
      },
      fail: (e) => {
        if (onLoaded) {
          onLoaded();
        }
        
        setLoadingPosts(false);
        notification.error({
          message: `Falha ao carregar ${parent ? "comentários" : "posts"}`,
        })
        console.log("Service Error", e);
      },
    });
  };

  useImperativeHandle(ref, () => ({
    newPost
  }));

  if (!parent && loadingPosts) {
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
        posts.map((post) => <Post {...post} />)
      }
    </div>
  );
}

export default React.forwardRef(PostList);
