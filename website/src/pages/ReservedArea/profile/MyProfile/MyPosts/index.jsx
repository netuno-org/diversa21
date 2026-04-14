import React, { useEffect, useState } from 'react';
import _service from '@netuno/service-client';
import { EditOutlined, MessageOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';

const tabItems = [
    {
        key: '1',
        label: 'Meus posts',
        children: 'Meus posts',
        icon: <MessageOutlined />,
    },
    {
        key: '2',
        label: 'Minhas participacões em posts',
        children: 'Minhas participacões em posts',
        icon: <EditOutlined />,
    },
];

function MyPosts({ loggedUserInfo }) {
    const [postTitle, setPostTitle] = useState('Meus posts');
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if(postTitle === "Meus posts") {
            _service({
                method: 'GET',
                url: "/post",
                data: { authorUid: loggedUserInfo },
                  success: (response) => {
                    if (response.json) {
                        console.log("Service Response", response.json);
                        setPosts(response.json);
                        console.log(posts);
                    }
                },
                fail: (error) => {
                    console.log("Service Error", error);
                }
            });
        }
    }, []);


    return (
        <Tabs
            style={{ marginTop: '20px' }}
            defaultActiveKey="1"
            items={tabItems}
        />
    );
}
export default MyPosts;