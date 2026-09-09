import { useState, useEffect } from 'react';
import { Avatar, Tag } from 'antd';
import { UserOutlined, EnvironmentOutlined, CalendarOutlined, SafetyOutlined } from '@ant-design/icons';
import { BsFillHouseGearFill } from "react-icons/bs";
import { RiFileEditLine } from "react-icons/ri";

import _service from '@netuno/service-client';
import dayjs from 'dayjs';
import usePeople from '../../common/usePeople';
import ContentActions from '../ContentActions';

import './index.less';
import { useNavigate } from 'react-router-dom';

function UserProfileDisplay({ user, avatarStyle, children }) {
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");

  const loggedUser = usePeople();
  const navigate = useNavigate()

  const isOwnProfile = loggedUser.data?.uid === user?.uid;
  const canViewEditButton = isOwnProfile || loggedUser.canManageUser(user);

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
      <div
        className="user-profile-display__actions"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {user.active === false && (
          <Tag variant="filled" color="error" style={{ borderRadius: '32px' }}>
            Inativo
          </Tag>
        )}
        <ContentActions
          entityType="people"
          entityUid={user.uid}
          canViewEditButton={canViewEditButton}
          canViewDeletePostButton={false}
          canViewReportButton={!isOwnProfile}
          editLabel="Editar perfil"
          reportLabel="Denunciar perfil"
          onEdit={() => navigate(isOwnProfile ? "/profile/edit" : `/e/${user.username}`)}
        />
      </div>
    </div>
  );
}

export default UserProfileDisplay;
