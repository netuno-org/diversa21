import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Card, Avatar, Spin, Pagination, Empty, Typography, Grid } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import _service from '@netuno/service-client';

import UserProfileDisplay from '../../../components/UserProfileDisplay';

import usePeople from "../../../common/usePeople.js";

import "./index.less";
import ListHeader from '../../../components/ListHeader/index.jsx';

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

function People() {
  const loggedUser = usePeople();
  const [locationOptions, setLocationOptions] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [peopleTerm, setPeopleTerm] = useState('');
  const [peopleList, setPeopleList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0
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
          ? 110
          : 60

  useEffect(() => {
    fetchPeopleList('', null, 1);
  }, []);

  const fetchPeopleList = (term, location, page) => {
    setLoading(true);
    let url = `people/list?name=${term}`
    if (location) {
      url += `&${location.type}Uid=${location.uid}`
    }
    url += `&page=${page}`
    _service({
      url,
      success: (response) => {
        const { items, totalCount, pageSize } = response.json;
        setPeopleList(items);
        setPagination(prev => ({
          ...prev,
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
    setPagination(prev => ({ ...prev, current: page, size: pageSize }));
    fetchPeopleList(peopleTerm, selectedLocation, page);
  }

  const handlePeopleSearch = (value) => {
    setPeopleTerm(value);
    setPagination({ ...pagination, current: 1 });
    fetchPeopleList(value, selectedLocation, 1);
  };

  const handlePeopleChange = (value) => {
    setPeopleTerm(value.target.value);
  };

  const handleLocationSearch = value => {
    if (value.trim() === '') {
      setLocationOptions([]);
      return;
    }
    _service({
      url: `location/search?query=${value}`,
      success: (response) => {
        const options = response.json.data.map(location => ({
          value: location.label,
          label: location.label,
          uid: location.uid,
          type: location.type
        }))
        setLocationOptions(options);
      },
      fail: () => {
        setLocationOptions([]);
      }
    })
  };

  const handleLocationChange = (value, option) => {
    setSelectedLocation(option);
    setPagination({ ...pagination, current: 1 });
    fetchPeopleList(peopleTerm, option, 1);
  };

  const handleLocationClear = () => {
    setLocationOptions([]);
    setPagination({ ...pagination, current: 1 });
    setSelectedLocation('');
    fetchPeopleList(peopleTerm, locationOptions, 1);
  }

  const onSelect = value => {
    console.log('onSelect', value);
  };

  return (
    <div className="people-search-container">
      <div className="people-search">
        <ListHeader
          title='Pessoas'
          createButton={
            loggedUser.canCreateAnyUser() && (
              <ListHeader.Button
                icon={<UserAddOutlined />}
                text="Criar usuário"
                onClick={() => navigate('/people/create/user')}
              />
            )
          }
        >
          <div className='search-input-container'>
            <ListHeader.Input
              autoCompleteProps={{
                placeholder: 'Buscar por nome',
                popupMatchSelectWidth: 252,
                onSelect: onSelect
              }}
              inputProps={{
                onSearch: handlePeopleSearch,
                onChange: handlePeopleChange,
                enterButton: true,
                value: peopleTerm,

              }}
            />
            <ListHeader.Select
              notFoundContent={null}
              placeholder="Cidade, estado ou país"
              options={locationOptions}
              showSearch={true}
              onSearch={handleLocationSearch}
              onChange={handleLocationChange}
              onClear={handleLocationClear}
            />
          </div>
        </ListHeader>
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
