import React, { useState, useEffect } from 'react';
import _service from '@netuno/service-client';
import { Link } from "react-router-dom";
import "./index.less";
import { AutoComplete, Input, Card, Avatar, Spin, Pagination } from 'antd';
import { Typography } from "antd";
import { EnvironmentOutlined, GlobalOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title } = Typography;

function People() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);
  const [peopleList, setPeopleList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 3
  });

  useEffect(() => {
    _service({
      method: 'GET',
      url: 'people/list',
      success: (response) => {
        setPeople(response.json);
        setLoading(false);
        setPagination({ ...pagination, current: 1 });
      },
      fail: () => {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    const { current } = pagination;
    const startIndex = (current - 1) * 3;
    const endIndex = startIndex + 3;
    const peopleList = people.slice(startIndex, endIndex);
    setPeopleList(peopleList);
  }, [pagination]);

  const handleSearch = (e) => {
    console.log('handleSearch', e);
    
  };
  const onSelect = value => {
    console.log('onSelect', value);
  };

  return (
    <div className={"people-search"}>
      <Title level={1}>Digite o nome da pessoa</Title>
      <AutoComplete
        popupMatchSelectWidth={252}
        style={{ width: '60%' }}
        options={options}
        onSelect={onSelect}
        showSearch={{ onSearch: handleSearch }}
      >
        <Input.Search size="large" placeholder="Procurar pessoas por nome, cidade, estado ou país " enterButton />
      </AutoComplete>
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
      <Pagination
      style={{ marginTop: '20px' }}
      align='center'
      total={people.length}
      current={pagination.current}
      pageSize={pagination.size}
      onChange={(current) => setPagination({ ...pagination, current})}
    />
    </div>
  );
}

export default People;