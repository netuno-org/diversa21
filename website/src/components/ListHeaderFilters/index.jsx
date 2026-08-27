import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Input, Select, Row, Col, Space, Avatar, Divider } from 'antd';
import { PlusOutlined, FolderOpenOutlined, ArrowLeftOutlined } from "@ant-design/icons";

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
  searchPlaceholder = "Buscar por nome ...",
  hideLocation,
  searchValue,
  fullWidthSearch,
  extraActionButtons,
  extraFilters,
  categoryName,
  categoryDescription,
  description,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationOptions, setLocationOptions] = useState([])
  const hasHeaderTitle = title || createButton || extraActionButtons || categoryName;

  const navigate = useNavigate();

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
          {categoryName  &&
            <Button
              type="link"
              className="replies-header__back"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            >
              Voltar as Categorias
            </Button>
          }
          <Row align="middle" gutter={[16, 16]}>
            {title && (
              <Col xs={24} sm={(createButton || extraActionButtons) ? 12 : 24}>
                <Title>{title}</Title>
              </Col>
            )}
            {(createButton || extraActionButtons) && (
              <Col xs={24} sm={12}>
                <Space className="list-header-filters__actions" wrap>
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
          {description && (
            <Paragraph className="list-header-filters__description">
              {description}
            </Paragraph>
          )}
          {categoryName && (
            <>
              <Divider />
              <div className="list-header-filters__category">
                <Avatar
                  size={50}
                  className="list-header-filters__icon-material"
                  shape="square"
                >
                  <FolderOpenOutlined />
                </Avatar>
                <div className="list-header-filters__category-text">
                  <Text type="primary" className="list-header-filters__category-label">
                    Categoria Selecionada:
                  </Text>
                  <Text type="primary" className="list-header-filters__category-name">
                    {categoryName}
                  </Text>
                </div>
              </div>
              {categoryDescription && (
                <Paragraph className="list-header-filters__category-description">
                  {categoryDescription}
                </Paragraph>
              )}
            </>
          )}
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