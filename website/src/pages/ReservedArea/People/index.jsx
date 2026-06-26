import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Card, Spin, Pagination, Empty, Typography, Grid, Button, Space, Popconfirm, message, Switch, Tag } from 'antd';
import { UserAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import UserProfileDisplay from '../../../components/UserProfileDisplay';

import usePeople from "../../../common/usePeople.js";
import useFilteredPaginatedList from '../../../common/useFilteredPaginatedList';

import ListHeaderFilters from "../../../components/ListHeaderFilters";

import "./index.less";


const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

function People() {
  const loggedUser = usePeople();
  const {
    items: peopleList,
    loading,
    pagination,
    handlePaginationChange,
    handleSearch,
    handleLocationChange,
    handleLocationClear,
    handleSearchClear,
    refresh,
  } = useFilteredPaginatedList({
    serviceUrl: 'people/list',
  });
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
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

  const handleDeleteUser = (uid) => {
    loggedUser.remove(uid, {
      onSuccess: () => {
        messageApi.success('Utilizador apagado com sucesso.');
        refresh();
      }
    });
  };

  const isSuperAdmin = loggedUser.data?.group?.code === 'super-admin';

  return (
    <div className="people-list">
      {contextHolder}

      <div className="people-list__header">
        <ListHeaderFilters
          title="Pessoas"
          createButton={(loggedUser.canCreateAnyUser() || loggedUser.canCreateMember(loggedUser.data?.institution)) && {
            icon: <UserAddOutlined />,
            text: "Criar usuário",
            onClick: () => navigate('/people/create/user'),
          }}
          onSearch={handleSearch}
          onLocationChange={handleLocationChange}
          onLocationClear={handleLocationClear}
          onSearchClear={handleSearchClear}
        />
      </div>

      {loading && (
        <div className="people-list__loading">
          <Spin size="large" />
        </div>
      )}

      <div className="people-list__count">
        <Text type="secondary">
          {pagination.total} {pagination.total !== 1 ? 'perfis' : 'perfil'} encontrado{pagination.total !== 1 ? 's' : ''}
        </Text>
      </div>

      <div className="people-list__items">
        {!loading && peopleList.map((person) => (
          <Card key={person.uid} className="people-list__card">
            <div className="people-list__card-content">

              <div className="people-list__card-info">
                <Link
                  to={`/u/${person.username}`}
                  className={`people-list__card-link ${!person.active && isSuperAdmin ? 'people-list__card-link--inactive' : ''}`}
                >
                  <UserProfileDisplay user={person} avatarStyle={{ width: `${screenSize}px`, height: `${screenSize}px` }} />
                </Link>
              </div>

              {loggedUser.canManageUser(person) && (
                <div className="people-list__card-actions">
                  {person.active === false && (
                    <Tag variant="filled" color="error" className="people-list__card-status-tag">
                      Inativo
                    </Tag>
                  )}

                  <Button
                    type="link"
                    onClick={() => navigate(`/e/${person.username}`)}
                    className="people-list__card-btn people-list__card-btn--edit"
                  >
                    <EditOutlined />
                  </Button>
                </div>
              )}

            </div>
          </Card>
        ))}
      </div>

      <div className="people-list__footer">
        <Pagination
          className={`people-list__pagination ${peopleList.length === 0 && !loading ? 'people-list__pagination--hidden' : ''}`}
          align='center'
          total={pagination.total}
          current={pagination.current}
          pageSize={pagination.size}
          onChange={handlePaginationChange}
        />
        {peopleList.length === 0 && !loading && (
          <div className="people-list__empty">
            <Empty description="Nenhuma pessoa encontrada corresponde aos filtros aplicados." />
          </div>
        )}
      </div>
    </div>
  );
}

export default People;
