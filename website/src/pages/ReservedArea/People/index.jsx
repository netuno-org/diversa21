import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Card, Avatar, Spin, Pagination, Empty, Typography, Grid } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
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
        ...(location && {[location.type + "Uid"]: location.uid}),
        page,
      },
      success: (response) => {
        const { items, totalCount, pageSize } = response.json;
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
    setPagination({ ...pagination, current: 1, term: ''});
    fetchPeopleList('', pagination.location, 1);
  }

  return (
    <div className="people-search-container">
      <div className="people-search">
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
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <Spin size="large" />
        </div>
      )}
      <div className="results-info">
        <Text type="secondary">
          {pagination.total} {pagination.total !== 1 ? 'perfis' : 'perfil'} encontrado{pagination.total !== 1 ? 's' : ''}
        </Text>
      </div>
      {!loading && peopleList.map((person) => (
        <div key={person.uid} style={{ width: '100%' }}>
          <Link to={`/u/${person.username}`}>
            <Card className="people-search-result-card" key={person.uid}>
              <UserProfileDisplay user={person} avatarStyle={{ width: `${screenSize}px`, height: `${screenSize}px` }} />
            </Card>
          </Link>
        </div>
      ))}
      <div style={{ width: '100%' }}>
        <Pagination
          style={{ ...(peopleList.length === 0 && !loading ? { marginTop: '20px', display: 'none' } : { marginTop: '20px' }) }}
          align='center'
          total={pagination.total}
          current={pagination.current}
          pageSize={pagination.size}
          onChange={handlePaginationChange}
        />
        {peopleList.length === 0 && !loading && (
          <div style={{ marginTop: '20px' }}>
            <Empty
              description={"Nenhuma pessoa encontrada corresponde aos filtros aplicados."}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default People;
