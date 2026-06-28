import React, { useMemo } from 'react';
import { Card, Empty, Spin, Pagination, Typography } from 'antd';
import { Link } from 'react-router-dom';
import UserProfileDisplay from '../../UserProfileDisplay';
import ListHeaderFilters from '../../ListHeaderFilters';
import useFilteredPaginatedList from '../../../common/useFilteredPaginatedList';
import './index.less';

const { Text } = Typography;

function FriendList({ userUid }) {
  
  const requestData = useMemo(() => {
    if (!userUid) {
      return {};
    }
  
    return {
      uid: userUid,
    };
  }, [userUid]);

  const {
    items: friendsList,
    loading,
    pagination,
    handlePaginationChange,
    handleSearch,
    handleLocationChange,
    handleLocationClear,
    handleSearchClear,
  } = useFilteredPaginatedList({
    serviceUrl: 'friend/list',
    requestData,
  });

  if (loading && friendsList.length === 0) {
    return (
      <div className="friend-list__loading">
        <Spin size="large" />
      </div>
    );
  }
  return (
    <div className="friend-list">
      <div className="friend-list__header">
        <ListHeaderFilters
         onSearch={handleSearch}
         onLocationChange={handleLocationChange}
         onLocationClear={handleLocationClear}
         onSearchClear={handleSearchClear}
         searchValue={pagination.term}
        />
      </div>
      <div className="friend-list__count">
        <Text type="secondary">
          {pagination.total} {pagination.total !== 1 ? 'amigos' : 'amigo'} encontrado{pagination.total !== 1 ? 's' : ''}
        </Text>
      </div>
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
          className={`friends-list__pagination ${friendsList.length === 0 && !loading ? 'friends-list__pagination--hidden' : ''}`}
          align='center'
          total={pagination.total}
          current={pagination.current}
          pageSize={pagination.size}
          onChange={handlePaginationChange}
        />
        </div>
      )}
    </div>
  );
}

export default FriendList;
