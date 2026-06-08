import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Card, Spin, Pagination, Empty, Typography, Grid, Button, Space, Popconfirm, message, Switch, Tag } from 'antd';
import { UserAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import _service from '@netuno/service-client';

import UserProfileDisplay from '../../../components/UserProfileDisplay';

import usePeople from "../../../common/usePeople.js";

import ListHeaderFilters from "../../../components/ListHeaderFilters";

import "./index.less";


const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

function People() {
  const loggedUser = usePeople();
  const [loading, setLoading] = useState(true);
  const [peopleList, setPeopleList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    term: '',
    location: null
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

  useEffect(() => {
    fetchPeopleList('', null, 1);
  }, []);

  const fetchPeopleList = (term, location, page) => {
    setLoading(true);
    _service({
      url: 'people/list',
      data: {
        name: term,
        ...(location && { [location.type + "Uid"]: location.uid }),
        page,
      },
      success: (response) => {
        const { items, totalCount, pageSize } = response.json.data;
        setPeopleList(items);
        setPagination((currentPagination) => ({
          ...currentPagination,
          current: page,
          term,
          location,
          total: totalCount,
          size: pageSize
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
  }

  const handlePeopleSearch = (term) => {
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
  }

  const handleSearchClear = () => {
    setPagination({ ...pagination, current: 1, term: '' });
    fetchPeopleList('', pagination.location, 1);
  }

  const handleDeleteUser = (uid) => {
    loggedUser.remove(uid, {
      onSuccess: () => {
        messageApi.success('Utilizador apagado com sucesso.');
        fetchPeopleList(pagination.term, pagination.location, pagination.current);
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
          createButton={loggedUser.canCreateAnyUser() && {
            icon: <UserAddOutlined />,
            text: "Criar usuário",
            onClick: () => navigate('/people/create/user'),
          }}
          onSearch={handlePeopleSearch}
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
          <Card key={person.uid} className="people-card">
            <div className="people-card__content">

              <div className="people-card__info">
                <Link
                  to={`/u/${person.username}`}
                  className={`people-card__link ${!person.active && isSuperAdmin ? 'people-card__link--inactive' : ''}`}
                >
                  <UserProfileDisplay user={person} avatarStyle={{ width: `${screenSize}px`, height: `${screenSize}px` }} />
                </Link>
              </div>

              {loggedUser.canManageUser(person) && (
                <div className="people-card__actions">
                  {person.active === false && (
                    <Tag variant="filled" color="error" className="people-card__status-tag">
                      Inativo
                    </Tag>
                  )}

                  <Button
                    type="link"
                    onClick={() => navigate(`/e/${person.username}`)}
                    className="people-card__btn people-card__btn--edit"
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