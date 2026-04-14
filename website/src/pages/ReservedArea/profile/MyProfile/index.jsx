import React, { useState, useEffect } from 'react';
import _service from '@netuno/service-client';
import { UserOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import { Avatar, Card, Button, Typography } from 'antd';
import MyPosts from './MyPosts';

const { Meta } = Card;
const { Text } = Typography;

function MyProfile({ loggedUserInfo }) {
    const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");

    const [year, mount, day] = loggedUserInfo.birthDate.split('-');
    const birthDate = `${day}/${mount}/${year}`;

    useEffect(() => {
        if (loggedUserInfo.avatar) {
            setAvatarUrl(
                _service.url(`/people/avatar?uid=${loggedUserInfo.uid}`)
            );
        }
    }, [loggedUserInfo]);

    return (

        <div className="my-profile" style={{ width: '70%' }}>

            <Card>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Meta
                        style={{ height: '150px', textAlign: 'center' }}
                        avatar={<Avatar src={avatarUrl} style={{ width: '100%', height: "100%" }} />}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text><UserOutlined /> {loggedUserInfo.name}</Text>
                        <Text><EnvironmentOutlined /> {loggedUserInfo.city}, {loggedUserInfo.state}</Text>
                        <Text><CalendarOutlined /> {birthDate}</Text>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                        <Button type="primary">Instituição</Button>
                    </div>
                </div>
            </Card>
            <MyPosts loggedUserInfo={loggedUserInfo.uid} />
        </div>
    )
}
export default MyProfile;