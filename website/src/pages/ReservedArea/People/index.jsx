import React, { useState, useEffect } from 'react';
import _service from '@netuno/service-client';
import { Link } from "react-router-dom";
import { AutoComplete, Input, Card, Avatar, Spin, Pagination, Empty, Select } from 'antd';
import { Typography } from "antd";
import UserProfileDisplay from '../../../components/UserProfileDisplay';

import "./index.less";

const { Title } = Typography;

function People() {
  const [stateOptions, setStateOptions] = useState([])
  const [filters, setFilters] = useState(true)
  const [peopleName, setPeopleName] = useState('');
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [peopleList, setPeopleList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 3
  });

  useEffect(() => {
    if (peopleName || peopleName === '') {
      const urlFinal = peopleName ? `people/list?name=${peopleName}` : 'people/list'
      if (filters) {
        _service({
          method: 'GET',
          url: `${urlFinal}`,
          success: (response) => {
            const uniqueStates = [...new Set(response.json.map(p => p.state))].filter(Boolean)
            const options = uniqueStates.map(state => ({
              label: state,
              value: state
            }))
            setStateOptions(options)
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
    }
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

  const onSearch = value => {
    //console.log('search:', value);
  };
  const onSelect = value => {
    console.log('onSelect', value);
  };

  return (
    <div className={"people-search-container"}>
      <Title>Procurar pessoas</Title>
      <div className={"people-search-input"}>
        <AutoComplete
          popupMatchSelectWidth={252}
          style={{ width: '50%' }}
          onSelect={onSelect}
        >
          <Input.Search
            placeholder="Buscar por nome"
            enterButton
            onSearch={handleSearch}
          />
        </AutoComplete>
        <Select
          showSearch={{ optionFilterProp: 'label', onSearch }}
          placeholder="País, Cidade ou Estado"
          options={stateOptions}
          style={{ width: '20%' }}
        />
      </div>
      {loading && (
        <div style={{ marginTop: 24 }}>
          <Spin size="large" />
        </div>
      )}
      {!loading && peopleList.map((person) => (
        <div style={{ width: '100%' }}>
          <Card className={"people-search-result"} key={person.uid}>
            <Link to={`/u/${person.username}`}>
              <UserProfileDisplay user={person} avatarSize={86}>
                <div className={"country-title"}> {person.country}</div>
              </UserProfileDisplay>
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
