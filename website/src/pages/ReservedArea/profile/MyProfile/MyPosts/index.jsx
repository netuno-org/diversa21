import React, { useEffect, useState } from 'react';
import _service from '@netuno/service-client';
import { EditOutlined, MessageOutlined } from '@ant-design/icons';
import { Tabs,  Pagination  } from 'antd';
import Post from '../../../../../components/Post/';

function MyPosts({ loggedUserInfo }) {

    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    
    const startIndex = (currentPage - 1) * 3;
    const endIndex = startIndex + 3;
    const paginatedPosts = posts.slice(startIndex, endIndex);

    useEffect(() => {
        _service({
            method: 'GET',
            url: "/post",
            data: { authorUid: loggedUserInfo.uid },
            success: (response) => {
                if (response.json) {
                    setPosts(response.json);
                    setCurrentPage(1);
                }
            },
            fail: (error) => {
                console.log("Service Error", error);
            }
        });

    }, [loggedUserInfo]);

    const onRemovePost = (uid) => {
        setPosts((currentPosts) => currentPosts.filter((post) => post.uid !== uid));
    };

    const onEditPost = (uid, content) => {
        setPosts((currentPosts) =>
            currentPosts.map((post) =>
                post.uid === uid ? { ...post, content } : post
            )
        );
    };

    const tabItems = [
        {
            key: '1',
            label: 'Meus posts',
            children: posts.length > 0 ? (
                <>
                    {paginatedPosts.map((post) => (
                        <Post
                            key={post.uid}
                            loggedUserInfo={loggedUserInfo}
                            onRemovePost={onRemovePost}
                            onEditPost={onEditPost}
                            {...post}
                        />
                    ))}
                    <Pagination
                        style={{ marginTop: '20px' }}
                        align='center'
                        total={posts.length}
                        current={currentPage}
                        pageSize={3}
                        onChange={setCurrentPage}
                    />
                </>
            ) : (
                <p>Nenhum post encontrado</p>
            ),
            icon: <MessageOutlined />,
        },
        {
            key: '2',
            label: 'Minhas participações em posts',
            children: 'Minhas participações em posts',
            icon: <EditOutlined />,
        },
    ];

    return (
        <Tabs
            style={{ marginTop: '20px' }}
            defaultActiveKey="1"
            items={tabItems}
        />
    );
}
export default MyPosts;