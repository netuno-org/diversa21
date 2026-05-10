import { useState, useEffect } from 'react';
import { Avatar } from 'antd';
import { UserOutlined, TeamOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import _service from '@netuno/service-client';
import dayjs from 'dayjs';

function UserProfileDisplay({ user, avatarStyle, children }) {
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");

  useEffect(() => {
    if (user && user.avatar) {
      setAvatarUrl(_service.url(`/people/avatar?uid=${user.uid}`));
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Avatar style={avatarStyle} src={avatarUrl} />
      <div>
        <div><UserOutlined /> {user.name}</div>
        { user.group.code !== "member" &&
          <div
            style={{ color:
              user.group.code == "review" ? "green" :
              user.group.code == "management" ? "blue" : "red" }} > 
            <TeamOutlined /> {user.group.name}
          </div>
        }
        <div><EnvironmentOutlined /> {user.city.name}, {user.state.name}, {user.country.name}</div>
        <div><CalendarOutlined /> {dayjs(user.birthDate).format('LL')}</div>
        {children}
      </div>
    </div>
  );
}

export default UserProfileDisplay;
