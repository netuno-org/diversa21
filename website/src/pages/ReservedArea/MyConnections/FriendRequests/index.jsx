import React from 'react';
import { Link } from 'react-router-dom';
import { Spin, Empty, Card, Pagination, Typography, Button, Space, Popconfirm } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

import useFilteredPaginatedList from '../../../../common/useFilteredPaginatedList';
import useFriendActions from '../../../../common/useFriendActions';
import UserProfileDisplay from '../../../../components/UserProfileDisplay';

import '../../../../components/Friend/List/index.less';
import './index.less';

const { Text } = Typography;

function FriendRequests() {
  const {
    items: receivedRequests,
    loading,
    pagination,
    fetchList,
    handlePaginationChange,
  } = useFilteredPaginatedList({
    serviceUrl: 'friend/request/list',
  });

  const { run, isProcessing } = useFriendActions();

  const refetch = () => {
    fetchList({
      term: pagination.term,
      location: pagination.location,
    });
  };

  const handleAccept = (uid) => {
    run('accept', uid, { onSuccess: refetch });
  };

  const handleReject = (uid) => {
    run('reject', uid, { onSuccess: refetch });
  };

  if (loading && receivedRequests.length === 0) {
    return (
      <div className="friend-list__loading">
        <Spin size="large" />
      </div>
    );
  }

  const countLabel = pagination.total === 1
    ? '1 solicitação encontrada'
    : `${pagination.total} solicitações encontradas`;

  return (
    <div className="friend-list">
      <div className="friend-list__count">
        <Text type="secondary">{countLabel}</Text>
      </div>
      <div className="friend-list__items">
        {receivedRequests.map((request) => (
          <Card key={request.uid} className="friend-list__card" hoverable>
            <div className="friend-list__card-content">
              <Link to={`/u/${request.username}`} className="friend-list__link">
                <UserProfileDisplay
                  user={request}
                  avatarStyle={{ width: '60px', height: '60px', borderRadius: '8px' }}
                />
              </Link>
              <Space className="friend-list__card-actions">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleAccept(request.uid)}
                  loading={isProcessing(request.uid, 'accept')}
                  disabled={isProcessing(request.uid)}
                >
                  Aceitar
                </Button>
                <Popconfirm
                  title="Recusar solicitação"
                  description="Tem certeza que deseja recusar este pedido de amizade?"
                  onConfirm={() => handleReject(request.uid)}
                  okText="Sim"
                  cancelText="Não"
                >
                  <Button
                    className="profile__secondary-btn"
                    type="primary"
                    loading={isProcessing(request.uid, 'reject')}
                    icon={<CloseOutlined />}
                    disabled={isProcessing(request.uid)}
                  >
                    Recusar
                  </Button>
                </Popconfirm>
              </Space>
            </div>
          </Card>
        ))}
      </div>
      {receivedRequests.length === 0 && !loading && (
        <Empty description="Nenhuma solicitação de amizade encontrada." />
      )}
      {receivedRequests.length > 0 && (
        <div className="friend-list__pagination">
          <Pagination
            className="friends-list__pagination"
            align="center"
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

export default FriendRequests;
