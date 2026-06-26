import React, { useState, useEffect } from 'react';
import { Card, Empty, Spin, Pagination } from 'antd';
import { Link } from 'react-router-dom';
import _service from '@netuno/service-client';
import UserProfileDisplay from '../../UserProfileDisplay';
import './index.less';

function FriendList({ userUid }) {
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0
  });

  useEffect(() => {
    fetchFriends(1);
  }, [userUid]);

  const fetchFriends = (page) => {
    setLoading(true);
    _service({
      url: 'friend/list',
      data: {
        uid: userUid,
        page,
      },
      success: (response) => {
        const { items, pagination: respPagination } = response.json.data;
        setFriendsList(items || []);
        setPagination({
          current: page,
          size: respPagination.pageSize || 10,
          total: respPagination.totalCount || 0
        });
        setLoading(false);
      },
      fail: () => {
        setLoading(false);
      }
    });
  };

  if (loading && friendsList.length === 0) {
    return (
      <div className="friend-list__loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="friend-list">
      <div className="friend-list__items">
        {friendsList.map((friend) => (
          <Card key={friend.uid} className="friend-list__card" hoverable>
            <Link to={`/u/${friend.username}`} className="friend-list__link">
              <UserProfileDisplay user={friend} avatarStyle={{ width: '60px', height: '60px' }} />
            </Link>
          </Card>
        ))}
      </div>

      {friendsList.length === 0 && !loading && (
        <Empty description="Nenhum amigo encontrado." />
      )}

      {friendsList.length > 0 && (
        <div className="friend-list__pagination">
          <Pagination
            current={pagination.current}
            pageSize={pagination.size}
            total={pagination.total}
            onChange={fetchFriends}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}

export default FriendList;
