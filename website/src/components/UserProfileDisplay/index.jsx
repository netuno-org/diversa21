import { Avatar } from 'antd';
import { UserOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import _service from '@netuno/service-client';
import dayjs from 'dayjs';

function UserProfileDisplay({ user, avatarSize, children }) {

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Avatar size={avatarSize} src={_service.url(`/people/avatar?uid=${user.uid}`)} />
      <div>
        <div><UserOutlined /> {user.name}</div>
        <div><EnvironmentOutlined /> {user.city}, {user.state}</div>
        <div><CalendarOutlined /> {dayjs(user.birthDate).format('LL')}</div>
        {children}
      </div>
    </div>
  );
}

export default UserProfileDisplay;