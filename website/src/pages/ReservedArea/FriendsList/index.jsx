import React, { useState, useEffect } from 'react'
import _service from '@netuno/service-client';
import { Card, Grid } from 'antd';
import { Link } from 'react-router-dom';
import UserProfileDisplay from '../../../components/UserProfileDisplay';

const { useBreakpoint } = Grid;

function FriendsList() {
  const [friendsList, setFriendsList] = useState([]);

  const screens = useBreakpoint();
  const screenSize = screens.xl
    ? 100
    : screens.lg
      ? 100
      : screens.md
        ? 100
        : screens.sm
          ? 90
          : 70

  useEffect(() => {
    _service({
      method: 'GET',
      url: 'friend/list',
      success: ({ json }) => {
        setFriendsList(json.data.items);
      },
      fail: ({ error }) => {
        console.error(error);
      }
    });
  }, []);

  return (
    <div>
      {
        friendsList.map((user) => (
          <Card key={user.uid} className="people-list__card">
            <div className="people-list__card-content">

              <div className="people-list__card-info">
                <Link
                  to={`/u/${user.username}`}
                >
                  <UserProfileDisplay user={user} avatarStyle={{ width: `${screenSize}px`, height: `${screenSize}px` }} />
                </Link>
              </div>
            </div>
          </Card>
        ))
      }
    </div>
  );
}
export default FriendsList;