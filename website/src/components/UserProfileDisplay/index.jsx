import { useState, useEffect } from 'react';
import { Avatar, Button, Tag } from 'antd';
import { UserOutlined, EnvironmentOutlined, CalendarOutlined, SafetyOutlined, EditOutlined } from '@ant-design/icons';
import { BsFillHouseGearFill } from "react-icons/bs";
import { RiFileEditLine } from "react-icons/ri";

import _service from '@netuno/service-client';
import dayjs from 'dayjs';
import usePeople from '../../common/usePeople';

import './index.less';
import { useNavigate } from 'react-router-dom';

function UserProfileDisplay({ user, avatarStyle, children }) {
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");

  const loggedUser = usePeople();
  const navigate = useNavigate()

  const isLoggedSuperAdmin = loggedUser.data?.group?.code === 'super-admin';
  const isOwnProfile = loggedUser.data?.uid === user?.uid;
  const canShowEditButton =
    loggedUser.canManageUser(user) && !(isLoggedSuperAdmin && isOwnProfile);

  const iconSize = 16

  useEffect(() => {
    if (user && user.avatar) {
      setAvatarUrl(_service.url(`/asset?uid=${user.uid}&type=avatar&entity=people`));
    }
  }, [user]);

  if (!user) {
    return null;
  }
  return (
    <div className="user-profile-display">
      <Avatar style={avatarStyle} src={avatarUrl} shape="square" />
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
              <SafetyOutlined />
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
      {canShowEditButton && (
        <div className="user-profile-display__actions">
          {user.active === false && (
            <Tag variant="filled" color="error" className="people-list__card-status-tag" style={{ borderRadius: '32px' }}>
              Inativo
            </Tag>
          )}
          <Button
            type="link"
            onClick={() => navigate(`/e/${user.username}`)}
            className="people-list__card-btn people-list__card-btn--edit"
          >
            <EditOutlined />
          </Button>
        </div>
      )}
    </div>
  );
}

export default UserProfileDisplay;
