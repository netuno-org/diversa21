import React, { useState, useEffect } from 'react';
import _service from '@netuno/service-client';
import { Link } from "react-router-dom";
import "./index.less";
import { AutoComplete, Input, Card, Avatar, Spin, Pagination, Empty, Select } from 'antd';
import { Typography } from "antd";
import { EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title } = Typography;

function People() {
  const [stateOptions, setStateOptions] = useState([])
  const [filters, setFilters] = useState(true)
  const [userName, setUserName] = useState('');
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [peopleList, setPeopleList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 3
  });

  useEffect(() => {
    if (userName || userName === '') {
      const urlFinal = userName ? `people/list?name=${userName}` : 'people/list'
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
      setUserName(value);
      setFilters(true);
      setLoading(true);
    } else {
      setUserName('');
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
    <div className={"people-search"}>
      <Title level={1}>Procurar pessoas</Title>
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
        <Card className={"people-search-result"} key={person.uid}>
          <div>
            <Link to={`/u/${person.username}`} className={"people-search-result-header"}>
              <Avatar size={64} src={_service.url(`/people/avatar?uid=${person.uid}`)} />
              <Title level={3}>{person.name}</Title>
            </Link>
          </div>
          <div className={"people-search-result-details"}>
            <div className={"people-search-result-details-location"}>
              <p><EnvironmentOutlined /> {person.city}, {person.state}</p>
              <p className={"country-title"}> {person.country}</p>
            </div>
            <p><CalendarOutlined /> {person.birthDate}</p>
          </div>
        </Card>
      ))}
      <div>
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