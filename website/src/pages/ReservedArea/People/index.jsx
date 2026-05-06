import React, { useState, useEffect } from 'react';
import _service from '@netuno/service-client';
import { Link } from "react-router-dom";
import { AutoComplete, Input, Card, Avatar, Spin, Pagination, Empty, Select } from 'antd';
import { Typography, Grid } from "antd";
import UserProfileDisplay from '../../../components/UserProfileDisplay';

import "./index.less";

const { Title } = Typography;
const { useBreakpoint } = Grid;

function People() {
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
        const { items, totalCount } = response.json;
        setPeopleList(items);
        setPagination(prev => ({ 
              ...prev, 
              total: totalCount 
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
    <div className={"people-search-container"}>
      <Title>Pessoas</Title>
      <div className={"people-search-input"}>
        <AutoComplete
          popupMatchSelectWidth={252}
          style={{ width: '60%' }}
          onSelect={onSelect}
        >
          <Input.Search
            style={{ width: '100%' }}
            placeholder="Buscar por nome"
            enterButton
            onSearch={handlePeopleSearch}
            onChange={handlePeopleChange}
          />
        </AutoComplete>
        <Select
          className={"people-search-select"}
          showSearch
          notFoundContent={null}
          filterOption={false}
          onSearch={handleLocationSearch}
          placeholder="Cidade, Estado ou País"
          options={locationOptions}
          onChange={handleLocationChange}
          allowClear
          onClear={handleLocationClear}
          style={{ width: '40%'}}
        />
      </div>
      {loading && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <Spin size="large" />
        </div>
      )}
      {!loading && peopleList.map((person) => (
        <div style={{ width: '100%' }}>
          <Card className={"people-search-result"} key={person.uid}>
            <Link to={`/u/${person.username}`}>
              <UserProfileDisplay user={person} avatarStyle={{ width: `${screenSize}px`, height: `${screenSize}px` }} />
            </Link>
          </Card>
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
