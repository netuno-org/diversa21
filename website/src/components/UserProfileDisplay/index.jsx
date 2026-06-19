import { useState, useEffect } from 'react';
import { Avatar } from 'antd';
import { UserOutlined, EnvironmentOutlined, CalendarOutlined, SafetyOutlined } from '@ant-design/icons';
import { BsFillHouseGearFill } from "react-icons/bs";
import { RiFileEditLine } from "react-icons/ri";

import _service from '@netuno/service-client';
import dayjs from 'dayjs';

import './index.less';

function UserProfileDisplay({ user, avatarStyle, children }) {
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");
  const iconSize = 16

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
      <Avatar style={avatarStyle} src={avatarUrl} shape="square"/>
      <div className="user-profile-display-content">
        <div><UserOutlined /> {user.name}</div>
        {user.group.code !== "member" && (
          <div
            style={{
              color:
                user.group.code === "review"
                  ? "#50a063"
                  : user.group.code === "management"
                    ? "#4e5fa0"
                    : "#d0990f",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {user.group.code === "super-admin" ? (
              <SafetyOutlined  />
            ) : user.group.code === "management" ? (
              <BsFillHouseGearFill size={iconSize} />
            ) : (
              <RiFileEditLine size={iconSize} />
            )}
            {user.group.name}
          </div>
        )}
        <div><EnvironmentOutlined /> {user.city.name}, {user.state.name}, {user.country.name}</div>
        <div><CalendarOutlined /> {dayjs().diff(dayjs(user.birthDate), 'year')} anos</div>
        {children}
      </div>
    </div>
  );
}

export default UserProfileDisplay;
