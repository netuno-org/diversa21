import React, { useState, useEffect } from 'react';
import _service from '@netuno/service-client';
import "./index.less";
import { AutoComplete, Input, Card, Avatar } from 'antd';
import { Typography } from "antd";

const { Title } = Typography;

function People() {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    _service({
      method: 'GET',
      url: 'people/list',
      success: (response) => {
        setPeople(response.json);
        console.log(response.json);
      }
    });
  }, []);

  const [options, setOptions] = useState([]);
  const handleSearch = value => {
    setOptions(value ? searchResult(value) : []);
  };
  const onSelect = value => {
    console.log('onSelect', value);
  };
  return (
    <div className={"people-search"}>
      <Title level={1}>Digite o nome da pessoa</Title>
      <AutoComplete
        popupMatchSelectWidth={252}
        style={{ width: 600 }}
        options={options}
        onSelect={onSelect}
        showSearch={{ onSearch: handleSearch }}
      >
        <Input.Search size="large" placeholder="Procurar pessoas" enterButton />
      </AutoComplete>
      {people.length > 0 && people.map((person) => (
        <Card className={"people-search-result"} key={person.uid}>
          <div className={"people-search-result-header"}>
            <Avatar size={64} src={_service.url(`/people/avatar?uid=${person.uid}`)} />
            <Title level={3}>{person.name}</Title>
          </div>
          <div className={"people-search-result-details"}>
            <p>{person.city}, {person.state}</p>
            <p>{person.country}</p>
            <p>{person.birthDate}</p>
          </div>
        </Card>

      ))}
    </div>
  );
}

export default People;