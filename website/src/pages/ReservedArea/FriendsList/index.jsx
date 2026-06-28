import React from 'react'
import { Card, Grid, Empty, Typography, Spin, Pagination } from 'antd';
import { Link } from 'react-router-dom';
import UserProfileDisplay from '../../../components/UserProfileDisplay';
import ListHeaderFilters from '../../../components/ListHeaderFilters';
import useFilteredPaginatedList from '../../../common/useFilteredPaginatedList';

import './index.less';

const { useBreakpoint } = Grid;
const { Text } = Typography;

function FriendsList() {
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
  const isLoading = loading && friendsList.length === 0;

  return (
    <div className="friends-list">
      <div className="friends-list__header">
        <ListHeaderFilters
          title="Amigos"
          onSearch={handleSearch}
          onLocationChange={handleLocationChange}
          onLocationClear={handleLocationClear}
          onSearchClear={handleSearchClear}
          searchValue={pagination.term}
        />
      </div>
      {isLoading && (
        <div className="friends-list__loading">
          <Spin size="large" />
        </div>
      )}
      {!isLoading && (
        <>
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
        </>
      )}
    </div>
  );
}
export default FriendsList;