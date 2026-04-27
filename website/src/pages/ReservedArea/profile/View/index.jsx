import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import _service from '@netuno/service-client';
import { UserOutlined, EnvironmentOutlined, CalendarOutlined, BankOutlined } from '@ant-design/icons';
import { Avatar, Card, Popover, Typography } from 'antd';
import { connect } from 'react-redux';

import PostList from '../../../../components/Post/List'

import './index.less';

const { Meta } = Card;
const { Text } = Typography;

function formatDatePtBr(dateValue) {
  if (!dateValue) {
    return '';
  }
  const [dateOnly] = (dateValue).split('T');
  const [year, month, day] = dateOnly.split('-');
  if (!year || !month || !day) {
    return dateValue;
  }
  return `${day}/${month}/${year}`;
}

function ProfileView({ loggedUserInfo }) {
  const [avatarUrl, setAvatarUrl] = useState("/images/profile-default.png");
  const birthDate = formatDatePtBr(loggedUserInfo?.birthDate);
  const [institution, setInstitution] = useState(null);

  useEffect(() => {
    if (!loggedUserInfo?.uid) {
      return;
    };
    if (loggedUserInfo.avatar) {
      setAvatarUrl(
        _service.url(`/people/avatar?uid=${loggedUserInfo.uid}`)
      );
    }
  }, [loggedUserInfo?.uid]);

  useEffect(() => {
    _service({
      method: 'GET',
      url: 'institution',
      data: {
        uid: loggedUserInfo?.institution
      },
      success: (response) => {
        setInstitution(response.json.data);
      }
    });
  }, [loggedUserInfo?.uid]);

  return (
    <div className="profile-view">
      <Card>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Meta
            style={{ height: '150px', textAlign: 'center' }}
            avatar={<Avatar src={avatarUrl} style={{ width: '145px', height: "145px" }} />}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text><UserOutlined /> {loggedUserInfo?.name}</Text>
            <Text><EnvironmentOutlined /> {loggedUserInfo?.city}, {loggedUserInfo?.state}</Text>
            <Text><CalendarOutlined /> {birthDate}</Text>
            <div>
              <Popover
                content={<div style={{ color: '#8B6AA2' }}>Clique para visitar a pagina da instituição!</div>}
                placement="rightTop"
                trigger="hover"
              >
                <Link to={`/institutions/${institution?.uid}`}>
                  <Text className='institution-text'><BankOutlined /> {institution?.name}</Text>
                </Link>
              </Popover>
            </div>
          </div>
        </div>
      </Card>
      <PostList author={loggedUserInfo?.uid} />
    </div>
  )
}
 
const mapStateToProps = store => {
  const { loggedUserInfo } = store.loggedUserInfoState;
  return {
    loggedUserInfo
  };
};

export default connect(mapStateToProps, {})(ProfileView);
