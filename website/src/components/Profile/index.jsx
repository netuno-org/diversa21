import { useNavigate, Link } from 'react-router-dom';
import { EditOutlined } from '@ant-design/icons';
import { RiCommunityLine } from "react-icons/ri";
import { Card, Button, Popover, Spin, Grid, Col } from 'antd';
import UserProfileDisplay from '../UserProfileDisplay';
import PostList from '../Post/List'

import usePeople from "../../common/usePeople.js";

import './index.less';

const { useBreakpoint } = Grid;

function Profile({ user }) {
  const loggedUser = usePeople();
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
          ? 90
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
        <Card className="profile-card">
          {loggedUser.canManageUser(user) &&
            <div className="edit-profile-button">
              <Col>
                <Button block type="primary" onClick={handleClick}>
                  {
                    screens.lg ? (
                      <>
                        <EditOutlined />
                        {' '}Editar Perfil
                      </>
                    ) : (
                      <EditOutlined />
                    )
                  }
                </Button>
              </Col>
            </div>
          }
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
                        <p><RiCommunityLine /> {user.institution.name}</p>
                      </Link>
                    </div>
                  </Popover>
                ) : (
                  <div className="institution-text">
                    <Link to={`/institutions/${user.institution.uid}`}>
                      <p><RiCommunityLine /> {user.institution.name}</p>
                    </Link>
                  </div>
                )
              }
              <div> 
                <p> {user.description}</p>
              </div>
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
