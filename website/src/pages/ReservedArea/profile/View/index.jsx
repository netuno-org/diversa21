import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import _service from '@netuno/service-client';
import { BankOutlined } from '@ant-design/icons';
import { Card, Popover, Spin } from 'antd';
import { connect } from 'react-redux';
import UserProfileDisplay from '../../../../components/UserProfileDisplay';
import PostList from '../../../../components/Post/List'

import './index.less';

function ProfileView({ loggedUserInfo }) {
  const [institution, setInstitution] = useState(null);

  let content = null;

  useEffect(() => {
    if (!loggedUserInfo) {
      return;
    }

    _service({
      method: 'GET',
      url: 'institution',
      data: {
        uid: loggedUserInfo.institution
      },
      success: (response) => {
        setInstitution(response.json.data);
      }
    });
  }, [loggedUserInfo]);

  if (!loggedUserInfo) {
    content = <Spin />;
  } else {
    content = (
      <div className="profile-view">
        <Card>
          <UserProfileDisplay user={loggedUserInfo} avatarSize={145}>
            <div>
              <Popover
                content={<div style={{ color: '#8B6AA2' }}>Clique para visitar a pagina da instituição!</div>}
                placement="rightTop"
                trigger="hover"
              >
                <Link to={`/institutions/${institution?.uid}`}>
                  <div className="institution-text">
                    <BankOutlined /> {institution?.name}
                  </div>
                </Link>
              </Popover>
            </div>
          </UserProfileDisplay>
        </Card>
        <PostList author={loggedUserInfo.uid} />
      </div>
    );
  }
  return content;
}

const mapStateToProps = store => {
  const { loggedUserInfo } = store.loggedUserInfoState;
  return {
    loggedUserInfo
  };
};

export default connect(mapStateToProps, {})(ProfileView);
