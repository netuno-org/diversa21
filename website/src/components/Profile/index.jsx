import { useNavigate, Link } from 'react-router-dom';
import { BankOutlined, EditOutlined } from '@ant-design/icons';
import { Card, Button, Popover, Spin, Grid, Col } from 'antd';
import UserProfileDisplay from '../UserProfileDisplay';
import PostList from '../Post/List'

import './index.less';

const { useBreakpoint } = Grid;

function Profile({ user }) {

  const navigate = useNavigate();
  const screens = useBreakpoint();

  const handleClick = () => {
    navigate(`/e/${user.username}`);
  }

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
    content = <div
      style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 20 }}
    >
      <Spin size="large" />
    </div>;
  } else {
    content = (
      <div className="profile">
        <Card>
          <div className="edit-profile-button">
            <Col>
              <Button block type="primary" onClick={handleClick}>
                {screens.lg ? 'Editar Perfil' : <EditOutlined />}
              </Button>
            </Col>
          </div>
          <UserProfileDisplay user={user} avatarStyle={{
            width: `${screenSize}px`,
            height: `${screenSize}px`,
          }}>
            <div className="info-user-container">
              {
                screens.lg ? (
                  <Popover
                    content={<div className="institution-text-popover">Clique para visitar a pagina da instituição</div>}
                    placement="bottom"
                    trigger="hover"
                  >
                    <div className="institution-text">
                      <Link to={`/institutions/${user.institution.uid}`}>
                        <p><BankOutlined /> {user.institution.name}</p>
                      </Link>
                    </div>
                  </Popover>
                ) : (
                  <div className="institution-text">
                    <Link to={`/institutions/${user.institution.uid}`}>
                      <p><BankOutlined /> {user.institution.name}</p>
                    </Link>
                  </div>
                )
              }
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
