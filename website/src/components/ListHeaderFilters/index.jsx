import React, { useEffect, useState } from "react";

import { Typography, Button, Input, Select, Row, Col, Space, Avatar } from 'antd';
import { PlusOutlined, FolderOpenOutlined, TagsOutlined } from "@ant-design/icons";

import _service from "@netuno/service-client";
import usePeople from "../../common/usePeople.js";

import './index.less'

const { Title, Text, Paragraph } = Typography;

function ListHeaderFilters({
  title,
  createButton /* {icon, onClick, text} */,
  onSearch /* (searchTerm) => { ... } */,
  onLocationChange /* () => { ... } */,
  onLocationClear /* () => { ... } */,
  onSearchClear,
  hideInputs,
  searchPlaceholder = "Buscar por nome",
  hideLocation,
  searchValue,
  fullWidthSearch,
  extraActionButtons,
  extraFilters,
  categoryName,
  topicName,
  topicContent
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationOptions, setLocationOptions] = useState([])
  const hasHeaderTitle = title || createButton || extraActionButtons;

  // const loggedUser = usePeople();

  useEffect(() => {
    if (searchValue !== undefined) {
      setSearchTerm(searchValue);
    }
  }, [searchValue]);

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
              <Col xs={(createButton || extraActionButtons) ? 12 : 24} sm={(createButton || extraActionButtons) ? 12 : 24}>
                <Title>{title}</Title>
              </Col>
            )}
            {(createButton || extraActionButtons) && (
              <Col xs={12} sm={12}>
                <Space wrap style={{ justifyContent: 'flex-end', width: '100%' }}>
                  {extraActionButtons}
                  {createButton && (
                    <Button
                      type="primary"
                      icon={(createButton && createButton.icon) || <PlusOutlined />}
                      onClick={createButton && createButton.onClick}
                    >
                      {(createButton && createButton.text) || 'Adicionar Novo'}
                    </Button>
                  )}
                </Space>
              </Col>
            )}
          </Row>
        </div>
      )}
      {categoryName && (
        <div className="support-community__category">
          <Avatar
            size={50}
            className="support-community__icon-material"
            shape="square"
          >
            <FolderOpenOutlined />
          </Avatar>
          <div className="support-community__category-text">
            <Text type="secondary" className="support-community__category-label">
              Categoria selecionada:
            </Text>
            <Text type="secondary" className="support-community__category-name">
              {categoryName}
            </Text>
          </div>
        </div>
      )}
      {topicName && (
        <div className="support-community__category">
          <Avatar
            size={50}
            className="support-community__icon-material"
            shape="square"
          >
            <TagsOutlined />
          </Avatar>
          <div className="support-community__category-text">
            <Text type="secondary" className="support-community__category-label">
              Tópico selecionado:
            </Text>
            <Text type="secondary" className="support-community__category-name">
              {topicName}
            </Text>
            {topicContent && (
              <Paragraph
                type="secondary"
                ellipsis={{ rows: 2, tooltip: true }}
                className="support-community__category-description"
              >
                {topicContent}
              </Paragraph>
            )}
          </div>
        </div>
      )}
      {!hideInputs && (
        <div className="list-header-filters__inputs">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={fullWidthSearch ? 24 : (hideLocation ? 24 : 12)}>
              <Input.Search
                placeholder={searchPlaceholder}
                onSearch={() => onSearch && onSearch(searchTerm)}
                onChange={handleSearchChange}
                onClear={onSearchClear}
                enterButton={true}
                allowClear
                value={searchTerm} />
            </Col>
            {!hideLocation && (
              <Col xs={24} md={fullWidthSearch ? 12 : 12}>
                <Select
                  style={{ width: '100%' }}
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
            )}
            {extraFilters && (
              <Col xs={24} md={fullWidthSearch ? 12 : 12}>
                {extraFilters}
              </Col>
            )}
          </Row>
        </div>
      )}
    </div>
  );
}

export default ListHeaderFilters;