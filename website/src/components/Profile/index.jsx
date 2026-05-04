import { Link } from 'react-router-dom';
import _service from '@netuno/service-client';
import { BankOutlined } from '@ant-design/icons';
import { Card, Popover, Spin } from 'antd';
import UserProfileDisplay from '../UserProfileDisplay';
import PostList from '../Post/List'

import './index.less';

function Profile({ user }) {
  let content = null;

  if (!user) {
    content = <Spin />;
  } else {
    content = (
      <div className="profile">
        <Card>
          <UserProfileDisplay user={user} avatarSize={145}>
            <div>
              <Popover
                content={<div style={{ color: '#8B6AA2' }}>Clique para visitar a pagina da instituição</div>}
                placement="rightTop"
                trigger="hover"
              >
                <Link to={`/institutions/${user.institution.uid}`}>
                  <div className="institution-text">
                    {
                      user.institution.uid ? (
                        <>
                          <BankOutlined /> {user.institution.name}
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
