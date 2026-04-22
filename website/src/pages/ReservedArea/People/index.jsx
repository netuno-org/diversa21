import React, { useState, useEffect } from 'react';
import _service from '@netuno/service-client';
import { Link } from "react-router-dom";
import "./index.less";
import { AutoComplete, Input, Card, Avatar, Spin } from 'antd';
import { Typography } from "antd";
import { EnvironmentOutlined, GlobalOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title } = Typography;

function People() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    _service({
      method: 'GET',
      url: 'people/list',
      success: (response) => {
        setPeople(response.json);
        setLoading(false);
      },
      fail: () => {
        setLoading(false);
      }
    });
  }, []);

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
      {!loading && people.map((person) => (
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
    </div>
  );
}

export default People;