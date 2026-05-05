import { Link } from 'react-router-dom';
import _service from '@netuno/service-client';
import { BankOutlined } from '@ant-design/icons';
import { Card, Popover, Spin, Grid } from 'antd';
import UserProfileDisplay from '../UserProfileDisplay';
import PostList from '../Post/List'

import './index.less';

const { useBreakpoint } = Grid;

function Profile({ user }) {
  const screens = useBreakpoint();
  const screenSize = screens.xl
    ? 170
    : screens.lg
      ? 160
      : screens.md
        ? 140
        : screens.sm
          ? 110
          : 70
  let content = null;

  if (!user) {
    content = <Spin />;
  } else {
    content = (
      <div className="profile">
        <Card>
          <UserProfileDisplay user={user} avatarStyle={{
            width: `${screenSize}px`,
            height: `${screenSize}px`,
          }}>
            <div className="info-user-container">
              <Popover
                content={<div className="institution-text-popover">Clique para visitar a pagina da instituição</div>}
                placement="bottom"
                trigger="hover"
              >
                <div className="institution-text">
                  <Link to={`/institutions/${user.institution.uid}`}>
                    {
                      user.institution.uid ? (
                        <>
                          <p><BankOutlined /> {user.institution.name}</p>
                        </>
                      ) : (<Spin size="small" />)
                    }
                  </Link>
                </div>
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
