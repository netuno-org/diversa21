import React, { useEffect, useState } from 'react';
import _service from '@netuno/service-client';
import { EditOutlined, MessageOutlined } from '@ant-design/icons';
import { Tabs,  Pagination  } from 'antd';
import Post from '../../../../../components/Post/';

function MyPosts({ loggedUserInfo }) {
    const [allPosts, setAllPosts] = useState([]);
    const [paginatedPosts, setPaginatedPosts] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        size: 3
    });

    useEffect(() => {
        if (!loggedUserInfo?.uid) {
            return;
        }
        _service({
            method: 'GET',
            url: "post",
            data: { authorUid: loggedUserInfo.uid },
            success: (response) => {
                if (response.json) {
                    setAllPosts(response.json);
                    setPagination({...pagination, current: 1});
                }
            },
            fail: (error) => {
                console.log("Service Error", error);
            }
        });

    }, [loggedUserInfo?.uid]);

    useEffect(() => {
        const {current} = pagination;
        const startIndex = (current - 1) * 3;
        const endIndex = startIndex + 3;
        const posts = allPosts.slice(startIndex, endIndex);
        setPaginatedPosts(posts);
    }, [pagination]);

    const onRemovePost = (uid) => {
        setAllPosts((currentPosts) => currentPosts.filter((post) => post.uid !== uid));
    };

    const onEditPost = (uid, content) => {
        setAllPosts((currentPosts) =>
            currentPosts.map((post) =>
                post.uid === uid ? { ...post, content } : post
            )
        );
    };

    const tabItems = [
        {
            key: '1',
            label: 'Meus posts',
            children: allPosts.length > 0 ? (
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
                        total={allPosts.length}
                        current={pagination.current}
                        pageSize={pagination.size}
                        onChange={(current) => setPagination({...pagination, current})}
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