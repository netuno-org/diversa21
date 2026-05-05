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
  const [filters, setFilters] = useState(true)
  const [peopleName, setPeopleName] = useState('');
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [peopleList, setPeopleList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 3
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
    let url = `people/list?name=${peopleName}`
    if (selectedLocation) {
      url += `&${selectedLocation.type}Uid=${selectedLocation.uid}`
    }
    if (filters) {
      _service({
        url,
        success: (response) => {
          setPeople(response.json);
          setFilters(false);
          setLoading(false);
          setPagination({ ...pagination, current: 1 });
        },
        fail: () => {
          setLoading(false);
        }
      })
    };
  }, [filters]);

  useEffect(() => {
    const { current } = pagination;
    const startIndex = (current - 1) * 3;
    const endIndex = startIndex + 3;
    const peopleList = people.slice(startIndex, endIndex);
    setPeopleList(peopleList);
  }, [pagination]);

  const handleSearch = (value) => {
    if (value) {
      setPeopleName(value);
      setFilters(true);
      setLoading(true);
    } else {
      setPeopleName('');
      setFilters(true);
      setLoading(true);
    }
  };

  const handleLocationSearch = value => {
    if(!value || value.trim().length < 3) {
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

  const handleChange = (value, option) => {
    setSelectedLocation(option);
  };

  const handleLocationClear = () => {
    setLocationOptions([]);
    setSelectedLocation('');
  }

  const onSelect = value => {
    console.log('onSelect', value);
  };

  return (
    <div className={"people-search-container"}>
      <Title>Procurar pessoas</Title>
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
            onSearch={handleSearch}
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
          onChange={handleChange}
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
          total={people.length}
          current={pagination.current}
          pageSize={pagination.size}
          onChange={(current) => setPagination({ ...pagination, current })}
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
