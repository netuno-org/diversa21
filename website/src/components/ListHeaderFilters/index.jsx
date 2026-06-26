import React, { useState } from "react";

import { Typography, Button, Input, Select, Row, Col } from 'antd';
import { PlusOutlined } from "@ant-design/icons";

import _service from "@netuno/service-client";
import usePeople from "../../common/usePeople.js";

import './index.less'

const { Title } = Typography;

function ListHeaderFilters({
  title,
  createButton /* {icon, onClick, text} */,
  onSearch /* (searchTerm) => { ... } */,
  onLocationChange /* () => { ... } */,
  onLocationClear /* () => { ... } */,
  onSearchClear,
  hideInputs
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationOptions, setLocationOptions] = useState([])
  const hasHeaderTitle = title || createButton;

  // const loggedUser = usePeople();

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === '') {
      onSearch && onSearch('');
    }
  };

  const handleLocationSearch = (value) => {
    if (value.trim() === '') {
      setLocationOptions([]);
      return;
    }
    _service({
      url: `location/search?query=${value}`,
      success: ({ json }) => {
        const options = json.data.map(location => ({
          value: location.uid,
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

  const handleLocationClear = () => {
    setLocationOptions([]);
    onLocationClear && onLocationClear();
  };

  return (
    <div>
      {hasHeaderTitle && (
        <div className="list-header-filters__header">
          <Row align="middle" gutter={[16, 16]}>
            {title && (
              <Col xs={12} sm={12}>
                <Title>{title}</Title>
              </Col>
            )}
            {createButton && (
              <Col xs={12} sm={12}>
                <Button
                  type="primary"
                  icon={(createButton && createButton.icon) || <PlusOutlined />}
                  onClick={createButton && createButton.onClick}
                >
                  {(createButton && createButton.text) || 'Adicionar Novo'}
                </Button>
              </Col>
            )}
          </Row>
        </div>
      )}
      {!hideInputs && (
        <div className="list-header-filters__inputs">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Input.Search
                placeholder="Buscar por nome"
                onSearch={() => onSearch && onSearch(searchTerm)}
                onChange={handleSearchChange}
                onClear={onSearchClear}
                enterButton={true}
                allowClear
                value={searchTerm} />
            </Col>
            <Col xs={24} md={12}>
              <Select style={{ width: '100%' }}
                notFoundContent={null}
                placeholder="Cidade, estado ou país"
                options={locationOptions}
                showSearch={{
                  filterOption: false,
                  onSearch: handleLocationSearch
                }}
                onChange={(v, option) => onLocationChange && onLocationChange(option)}
                onClear={handleLocationClear}
                allowClear
              />
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}

export default ListHeaderFilters;