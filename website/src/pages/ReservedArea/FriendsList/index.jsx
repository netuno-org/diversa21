import React, { useState, useEffect } from 'react'
import _service from '@netuno/service-client';
import { Card, Grid, Empty, Typography, Spin, Pagination } from 'antd';
import { Link } from 'react-router-dom';
import UserProfileDisplay from '../../../components/UserProfileDisplay';
import ListHeaderFilters from '../../../components/ListHeaderFilters';

import './index.less';

const { useBreakpoint } = Grid;
const { Text } = Typography;

function FriendsList() {
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    term: '',
    location: null
  });

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
    fetchPeopleList('', null, 1);
  }, []);

  const fetchPeopleList = (term, location, page) => {
    setLoading(true);
    _service({
      url: 'friend/list',
      data: {
        name: term,
        ...(location && { [location.type + "Uid"]: location.uid }),
        page,
      },
      success: (response) => {
        const { items, pagination } = response.json.data;
        setFriendsList(items);
        setPagination((currentPagination) => ({
          ...currentPagination,
          current: page,
          term,
          location,
          total: pagination.totalCount,
          size: pagination.pageSize
        }));
        setLoading(false);
      },
      fail: () => {
        setLoading(false);
      }
    })
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ ...pagination, current: page, size: pageSize });
    fetchPeopleList(pagination.term, pagination.location, page);
  };

  const handleFriendsSearch = (term) => {
    setPagination({ ...pagination, current: 1, term });
    fetchPeopleList(term, pagination.location, 1);
  };

  const handleLocationChange = (option) => {
    setPagination({ ...pagination, current: 1, location: option });
    fetchPeopleList(pagination.term, option, 1);
  };

  const handleLocationClear = () => {
    setPagination({ ...pagination, current: 1, location: null });
    fetchPeopleList(pagination.term, null, 1);
  };

  const handleSearchClear = () => {
    setPagination({ ...pagination, current: 1, term: '' });
    fetchPeopleList('', pagination.location, 1);
  };

  return (
    <div className="friends-list">
      <div className="friends-list__header">
        <ListHeaderFilters
          title="Amigos"
          onSearch={handleFriendsSearch}
          onLocationChange={handleLocationChange}
          onLocationClear={handleLocationClear}
          onSearchClear={handleSearchClear}
        />
      </div>
      {loading && (
        <div className="friends-list__loading">
          <Spin size="large" />
        </div>
      )}
      <div className="friends-list__count">
        <Text type="secondary">
          {pagination.total} {pagination.total !== 1 ? 'amigos' : 'amigo'} encontrado{pagination.total !== 1 ? 's' : ''}
        </Text>
      </div>
      <div className="friends-list__items">
        {!loading && friendsList.map((user) => (
          <Card key={user.uid} className="friends-list__card">
            <div className="friends-list__card-content">
              <div className="friends-list__card-info">
                <Link to={`/u/${user.username}`} className={`friends-list__card-link ${!user.active && isSuperAdmin ? 'friends-list__card-link--inactive' : ''}`}>
                  <UserProfileDisplay user={user} avatarStyle={{ width: `${screenSize}px`, height: `${screenSize}px` }} />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="friends-list__footer">
        <Pagination
          className={`friends-list__pagination ${friendsList.length === 0 && !loading ? 'friends-list__pagination--hidden' : ''}`}
          align='center'
          total={pagination.total}
          current={pagination.current}
          pageSize={pagination.size}
          onChange={handlePaginationChange}
        />
        {friendsList.length === 0 && !loading && (
          <div className="friends-list__empty">
            <Empty description="Nenhum amigo encontrado corresponde aos filtros aplicados." />
          </div>
        )}
      </div>
    </div>
  );
}
export default FriendsList;