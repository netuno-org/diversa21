import React, { useEffect, useState, useImperativeHandle } from "react";
import _service from "@netuno/service-client";
import { Button, Col, notification, Row, Spin, Empty } from "antd";
import Post from "..";

function PostList({ author, parent, isolatedUid, isolatedCommentUid, onLoaded, onItemRemoved }, ref) {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

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

    if (author) {
      data.peopleUid = author;
    }

    if (!parent && isolatedUid) {
      data.uid = isolatedUid;
    }

    if (parent && isolatedCommentUid) {
      data.uid = isolatedCommentUid;
    }

    data.page = page;

    _service({
      url: "post/list",
      data,
      success: ({ json }) => {
        if (onLoaded) {
          onLoaded();
        }

        setLoadingPosts(false);
        let fetchedItems = json?.data?.items || [];

        if (!parent && isolatedUid) {
          fetchedItems = fetchedItems.filter(p => String(p.uid) === String(isolatedUid));
        }

        if (parent && isolatedCommentUid) {
          fetchedItems = fetchedItems.filter(p => String(p.uid) === String(isolatedCommentUid));
        }

        fetchedItems = fetchedItems.map(p => {
          if (p.moment && !p.moment.endsWith('Z')) {
            p.moment = `${p.moment}Z`;
          }
          return p;
        });

        setPosts([...posts, ...fetchedItems]);
        setTotalCount(json?.data?.pagination?.totalCount || 0);
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

  useImperativeHandle(ref, () => ({ newPost }));

  const onLoadMorePosts = () => setPage(page + 1);

  const onRemovePost = (uid) => {
    setPosts(posts.filter((post) => post.uid !== uid));
    if (onItemRemoved) {
      onItemRemoved();
    }
  };

  const onEditPost = (uid, content) => {
    setPosts(posts.map((post) => post.uid === uid ? { ...post, content } : post));
  }

  if ((!parent && loadingPosts) && page === 0) {
    return (
      <Row style={{ marginTop: 20 }} justify="center"><Col><Spin size="large" /></Col></Row>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <Post
          key={post.uid}
          {...post}
          isolatedCommentUid={isolatedCommentUid}
          onRemovePost={onRemovePost}
          onEditPost={onEditPost}
        />
      ))}

      {!loadingPosts && posts.length === 0 && (
        <div style={{ padding: '40px 20px', background: '#fff', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
          <Empty
            description={parent ? "Ainda não existem comentários." : "Esta publicação não foi encontrada ou foi apagada."}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}

      {!loadingPosts && posts.length < totalCount && !isolatedUid && !isolatedCommentUid && (
        <Button type="link" onClick={onLoadMorePosts}>Mostrar mais</Button>
      )}

      {loadingPosts && page > 0 && (
        <Row justify="center" style={{ marginTop: 20 }}><Col><Spin size="large" /></Col></Row>
      )}
    </div>
  );
}

export default React.forwardRef(PostList);