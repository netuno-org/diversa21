import React, { useState } from 'react'
import _service from '@netuno/service-client';
import { Link } from 'react-router-dom';
import useFilteredPaginatedList from '../../../../common/useFilteredPaginatedList';
import { Spin, Empty, Card, Pagination, Typography, Button, Popconfirm, notification, Space } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import UserProfileDisplay from '../../../../components/UserProfileDisplay';

import '../../../../components/Friend/List/index.less';
import './index.less';

const { Text } = Typography;

function FriendRequests() {
  const [processingRequest, setProcessingRequest] = useState(null);
  const {
    items: receivedRequests,
    loading,
    pagination,
    handlePaginationChange,
    refresh,
  } = useFilteredPaginatedList({
    serviceUrl: 'friend/request/list',
  });

  const requestFriendAction = ({
    uid,
    action,
    method,
    successMessage,
    successDescription,
    errorMessage,
    errorDescription,
  }) => {
    setProcessingRequest({ uid, action });

    _service({
      method,
      url: "/friend",
      data: {
        uid,
      },
      success: () => {
        setProcessingRequest(null);
        notification.success({
          message: successMessage,
          description: successDescription,
        });
        refresh();
      },
      fail: (error) => {
        setProcessingRequest(null);
        console.error(error);
        notification.error({
          message: errorMessage,
          description: errorDescription,
        });
      }
    });
  };

  const handleAcceptRequest = (uid) => {
    requestFriendAction({
      uid,
      action: 'accept',
      method: "PUT",
      successMessage: "Pedido aceito",
      successDescription: "O pedido de amizade foi aceito com sucesso.",
      errorMessage: "Erro ao aceitar pedido",
      errorDescription: "Não foi possível aceitar o pedido de amizade."
    });
  };

  const handleRejectRequest = (uid) => {
    requestFriendAction({
      uid,
      action: 'reject',
      method: "DELETE",
      successMessage: "Pedido recusado",
      successDescription: "O pedido de amizade foi recusado com sucesso.",
      errorMessage: "Erro ao recusar pedido",
      errorDescription: "Não foi possível recusar o pedido de amizade."
    });
  };

  if (loading && receivedRequests.length === 0) {
    return (
      <div className="friend-list__loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="friend-list">
      <div className="friend-list__count">
        <Text type="secondary">
          {pagination.total} {pagination.total !== 1 ? 'pedidos de amizade' : 'pedido de amizade'} encontrado{pagination.total !== 1 ? 's' : ''}
        </Text>
      </div>
      <div className="friend-list__items">
        {receivedRequests.map((request) => (
          <Card key={request.uid} className="friend-list__card" hoverable>
            <div className="friend-list__card-content">
              <Link to={`/u/${request.username}`} className="friend-list__link">
                <UserProfileDisplay user={request} avatarStyle={{ width: '60px', height: '60px' }} />
              </Link>
              <Space className="friend-list__card-actions">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleAcceptRequest(request.uid)}
                  loading={processingRequest?.uid === request.uid && processingRequest?.action === 'accept'}
                >
                  Aceitar
                </Button>
                <Popconfirm
                  title="Deseja recusar o pedido de amizade?"
                  onConfirm={() => handleRejectRequest(request.uid)}
                  okText="Sim"
                  cancelText="Não"
                >
                  <Button
                    className="profile__secondary-btn"
                    type="primary"
                    loading={processingRequest?.uid === request.uid && processingRequest?.action === 'reject'}
                    icon={<CloseOutlined />}
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
            className={`friends-list__pagination ${receivedRequests.length === 0 && !loading ? 'friends-list__pagination--hidden' : ''}`}
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

export default FriendRequests;
