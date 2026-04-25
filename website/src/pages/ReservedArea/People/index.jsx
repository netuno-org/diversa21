import React, { useState, useEffect } from 'react';
import _service from '@netuno/service-client';
import { Link } from "react-router-dom";
import "./index.less";
import { AutoComplete, Input, Card, Avatar, Spin, Pagination, Empty, Select } from 'antd';
import { Typography } from "antd";
import { EnvironmentOutlined, GlobalOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title } = Typography;

function People() {
  const [filters, setFilters] = useState(true)
  const [userName, setUserName] = useState('');
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);
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
  }}, [filters]);

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
    } else {
      setUserName('');
      setFilters(true);
    }
  };
  const onChange = value => {
    console.log(`selected ${value}`);
  };
  const onSearch = value => {
    console.log('search:', value);
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
        options={options}
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
        onChange={onChange}
        options={[]}
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
            <p><EnvironmentOutlined /> {person.city}, {person.state}</p>
            <p><GlobalOutlined /> {person.country}</p>
            <p><CalendarOutlined /> {person.birthDate}</p>
          </div>
        </Card>
      ))}
      {
        peopleList.length === 0 && !loading ? (
         <div>
          <Pagination
            style={{ marginTop: '20px', display: 'none' }}
            align='center'
            total={people.length}
            current={pagination.current}
            pageSize={pagination.size}
            onChange={(current) => setPagination({ ...pagination, current})}
          />
          <div style={{ marginTop: '20px' }}>
            <Empty 
              description={"Nenhuma pessoa encontrada corresponde aos filtros aplicados." } 
            />
          </div>
         </div>
        ) : (
          <Pagination
          style={{ marginTop: '20px' }}
          align='center'
          total={people.length}
          current={pagination.current}
          pageSize={pagination.size}
          onChange={(current) => setPagination({ ...pagination, current})}
        />
        )
      }
    </div>
  );
}

export default People;