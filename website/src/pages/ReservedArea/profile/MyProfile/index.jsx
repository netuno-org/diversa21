import React, { useState, useEffect } from 'react';
import { Typography, Spin } from 'antd';
import { Avatar, Card, Button } from 'antd';
import _service from '@netuno/service-client';

const { Meta } = Card;
const { Text } = Typography;


function MyProfile({loggedUserInfo}) {

    const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");

    useEffect(() => {
        if (loggedUserInfo.avatar) {
            setAvatarUrl(
                _service.url(`/people/avatar?uid=${loggedUserInfo.uid}`)
            );
        }
    }, [loggedUserInfo]);


    return (
    <Card className="my-profile"
        style={{ width: '70%' }}
    >
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Meta
                style={{ height: '150px', textAlign: 'center' }}
                avatar={<Avatar src={avatarUrl} style={{ width: '100%', height: "100%" }} />}
            />
            <div style={{ display: 'flex', flexDirection: 'column'  }}>
                <Text>{loggedUserInfo.name}</Text>
                <Text>{loggedUserInfo.city}, {loggedUserInfo.state}</Text>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <Button  type="primary">Instituição</Button>
            <Button  type="primary">Meus posts</Button>
            </div>
        </div>
    </Card>
    )
}
export default MyProfile;