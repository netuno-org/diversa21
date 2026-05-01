import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import _service from '@netuno/service-client';
import { BankOutlined } from '@ant-design/icons';
import { Card, Popover, Spin } from 'antd';
import { connect } from 'react-redux';
import UserProfileDisplay from '../UserProfileDisplay';
import PostList from '../Post/List'

import './index.less';

function Profile({ user }) {
  const [institution, setInstitution] = useState(null);

  let content = null;

  useEffect(() => {
    if (!user) {
      return;
    }

    _service({
      method: 'GET',
      url: 'institution',
      data: {
        uid: user.institution
      },
      success: (response) => {
        setInstitution(response.json.data);
      }
    });
  }, [user]);

  if (!user) {
    content = <Spin />;
  } else {
    content = (
      <div className="profile">
        <Card>
          <UserProfileDisplay user={user} avatarSize={145}>
            <div>
              <Popover
                content={<div style={{ color: '#8B6AA2' }}>Clique para visitar a pagina da instituição!</div>}
                placement="rightTop"
                trigger="hover"
              >
                <Link to={`/institutions/${institution?.uid}`}>
                  <div className="institution-text">
                    {
                      institution?.uid ? (
                        <>
                          <BankOutlined /> {institution?.name}
                        </>
                      ) : (<Spin size="small" />)
                    }
                  </div>
                </Link>
              </Popover>
            </div>
          </UserProfileDisplay>
        </Card>
        <PostList author={user.uid} />
      </div>
    );
  }
  return content;
}

export default Profile;
