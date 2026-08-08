import { useEffect, useMemo, useState } from "react";
import { Card, Empty, Typography, Row, Col, Select, Spin, Pagination, Tag, Modal, Form, Input, Button } from "antd";
import { EnvironmentOutlined, LinkOutlined, InstagramOutlined, PlusOutlined } from "@ant-design/icons";
import _service from "@netuno/service-client";
import usePeople from "../../../common/usePeople.js";
import useFilteredPaginatedList from '../../../common/useFilteredPaginatedList.js';
import ListHeaderFilters from "../../../components/ListHeaderFilters";

import "./index.less";

const { Paragraph, Text, Title } = Typography;

function Services() {
  const loggedUser = usePeople();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [serviceForm] = Form.useForm();
  const [cityOptions, setCityOptions] = useState([]);
  
  const [serviceDetails, setServiceDetails] = useState(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const canCreateService = ['super-admin', 'management'].includes(loggedUser?.data?.group?.code);

  const requestData = useMemo(
    () => ({
      ...(selectedCategory ? { categoryUid: selectedCategory.uid } : {}),
      _refresh: refreshTrigger 
    }),
    [selectedCategory, refreshTrigger]
  );

  const {
    items: services,
    loading,
    pagination,
    handlePaginationChange,
    handleSearch,
    handleLocationChange,
    handleLocationClear,
    handleSearchClear,
  } = useFilteredPaginatedList({
    serviceUrl: 'service/list',
    requestData,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = (name = '') => {
    setCategoriesLoading(true);
    _service({
      url: 'service_category/list',
      method: 'GET',
      data: { name },
      success: ({ json }) => {
        setCategories(json?.data || []);
        setCategoriesLoading(false);
      },
      fail: () => {
        setCategories([]);
        setCategoriesLoading(false);
      },
    });
  };

  const handleCategoryChange = (categoryUid) => {
    const category = categories.find((item) => item.uid === categoryUid) || null;
    setSelectedCategory(category);
    if (pagination.current !== 1) {
      handlePaginationChange(1, pagination.size);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      setCategoryError('Nome da categoria é obrigatório');
      return;
    }
    setCategoryError('');
    setSavingCategory(true);
    const payload = {
      name: categoryName.trim(),
      description: categoryDescription.trim(),
    };

    _service({
      url: 'service_category', 
      method: 'POST',
      data: payload,
      success: ({ json }) => {
        if (json?.result) {
          fetchCategories();
          setCategoryName('');
          setCategoryDescription('');
          setCategoryModalVisible(false);
        }
        setSavingCategory(false);
      },
      fail: (err) => {
        const json = err?.json;
        setCategoryError(json?.error || json?.message || 'Erro ao criar categoria');
        setSavingCategory(false);
      },
    });
  };

  const handleCitySearch = (value) => {
    if (!value) {
      setCityOptions([]);
      return;
    }
    _service({
      url: `location/city/search?name=${value}`,
      success: ({ json }) => {
        setCityOptions(json.data.map(city => ({ label: city.label, value: city.uid })));
      },
      fail: () => setCityOptions([])
    });
  };

  const handleCreateService = async () => {
    try {
      const values = await serviceForm.validateFields();
      setSavingService(true);
      
      _service({
        url: 'service',
        method: 'POST',
        data: {
          name: values.name,
          category: values.category,
          city: values.city?.value || values.city,
          description: values.description,
          phone: values.phone,
          website: values.website,
          instagram: values.instagram
        },
        success: ({ json }) => {
          if (json?.result) {
            setServiceModalVisible(false);
            serviceForm.resetFields();
            
            if (pagination.current !== 1) {
              handlePaginationChange(1, pagination.size);
            }
            setRefreshTrigger(prev => prev + 1); 
          }
          setSavingService(false);
        },
        fail: (err) => {
          console.error('Falha ao criar serviço', err);
          setSavingService(false);
        }
      });
    } catch (error) {
      console.log('Validação do formulário falhou:', error);
    }
  };

  return (
    <div className="services-list">
      <div className="services-list__header">
        <ListHeaderFilters
          title="Prestação de Serviços"
          createButton={canCreateService ? {
            icon: <PlusOutlined />,
            text: "Novo Serviço",
            onClick: () => setServiceModalVisible(true),
          } : null}
          onSearch={handleSearch}
          onLocationChange={handleLocationChange}
          onLocationClear={handleLocationClear}
          onSearchClear={handleSearchClear}
          searchPlaceholder="Buscar por nome do serviço"
        />
        <div className="services-list__filters">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={10} lg={8}>
              <Select
                value={selectedCategory?.uid}
                allowClear
                showSearch
                loading={categoriesLoading}
                placeholder="Filtrar por categoria"
                onChange={handleCategoryChange}
                options={categories.map((category) => ({
                  label: category.name,
                  value: category.uid,
                }))}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Col>
            {loggedUser.canManageServiceCategories() && (
              <Col>
                <Button type="dashed" icon={<PlusOutlined />} onClick={() => setCategoryModalVisible(true)}>
                  Nova categoria
                </Button>
              </Col>
            )}
          </Row>
        </div>
      </div>

      <div className="services-list__count">
        <Text type="secondary">
          {pagination.total} {pagination.total !== 1 ? 'serviços' : 'serviço'} encontrado{pagination.total !== 1 ? 's' : ''}
          {selectedCategory ? ` na categoria "${selectedCategory.name}"` : ''}
        </Text>
      </div>

      {loading && (
        <div className="services-list__loading">
          <Spin size="large" />
        </div>
      )}

      <div className="services-list__items">
        {!loading && services.map((service) => (
          <Card
            key={service.uid}
            className="services-list__card"
            hoverable
            onClick={() => setServiceDetails(service)}
          >
            <div className="services-list__card-content">
              <div className="services-list__card-main">
                <div className="services-list__card-title">
                  <Title level={4} className="services-list__title">
                    {service.name}
                  </Title>
                  {service.category?.name && (
                    <Tag className="services-list__category-tag">{service.category.name}</Tag>
                  )}
                </div>
                <div className="services-list__card-location">
                  <EnvironmentOutlined />{' '}
                  {service.city?.name}, {service.state?.name} / {service.country?.name}
                </div>
                {service.description && (
                  <Paragraph className="services-list__description" ellipsis={{ rows: 3, tooltip: true }}>
                    {service.description}
                  </Paragraph>
                )}
              </div>
              <div className="services-list__card-meta">
                {service.phone && (
                  <div className="services-list__meta-item">
                    <strong>Telefone:</strong> {service.phone}
                  </div>
                )}
                {service.website && (
                  <div className="services-list__meta-item">
                    <LinkOutlined />{' '}
                    <a
                      href={service.website.startsWith('http') ? service.website : `https://${service.website}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Site
                    </a>
                  </div>
                )}
                {service.instagram && (
                  <div className="services-list__meta-item">
                    <InstagramOutlined />{' '}
                    <a
                      href={`https://instagram.com/${service.instagram.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      @{service.instagram.replace(/^@/, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="services-list__footer">
        <Pagination
          className={`services-list__pagination ${services.length === 0 && !loading ? 'services-list__pagination--hidden' : ''}`}
          align="center"
          total={pagination.total}
          current={pagination.current}
          pageSize={pagination.size}
          onChange={handlePaginationChange}
        />
        {!loading && services.length === 0 && (
          <div className="services-list__empty">
            <Empty description="Nenhum serviço encontrado para os filtros aplicados." />
          </div>
        )}
      </div>

      <Modal
        title={serviceDetails ? serviceDetails.name : ''}
        open={!!serviceDetails}
        onCancel={() => setServiceDetails(null)}
        footer={null}
        destroyOnHidden
      >
        {serviceDetails && (
          <div className="services-list__details">
            {serviceDetails.category?.name && (
              <Tag className="services-list__detail-tag">{serviceDetails.category.name}</Tag>
            )}
            <div className="services-list__detail-line">
              <EnvironmentOutlined />{' '}
              {serviceDetails.city?.name}, {serviceDetails.state?.name} / {serviceDetails.country?.name}
            </div>
            {serviceDetails.description && (
              <Paragraph>{serviceDetails.description}</Paragraph>
            )}
            {serviceDetails.phone && (
              <div className="services-list__detail-line">
                <strong>Telefone:</strong> {serviceDetails.phone}
              </div>
            )}
            {serviceDetails.website && (
              <div className="services-list__detail-line">
                <LinkOutlined />{' '}
                <a
                  href={serviceDetails.website.startsWith('http') ? serviceDetails.website : `https://${serviceDetails.website}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {serviceDetails.website}
                </a>
              </div>
            )}
            {serviceDetails.instagram && (
              <div className="services-list__detail-line">
                <InstagramOutlined />{' '}
                <a
                  href={`https://instagram.com/${serviceDetails.instagram.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{serviceDetails.instagram.replace(/^@/, '')}
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="Novo Anúncio de Serviço"
        open={serviceModalVisible}
        onCancel={() => {
          setServiceModalVisible(false);
          serviceForm.resetFields();
        }}
        onOk={handleCreateService}
        confirmLoading={savingService}
        okText="Publicar"
        destroyOnHidden
        width={700}
      >
        <Form form={serviceForm} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Nome" name="name" rules={[{ required: true, message: 'Insira o nome do serviço' }]}>
                <Input placeholder="Nome do serviço ou profissional" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Categoria" name="category" rules={[{ required: true, message: 'Selecione uma categoria' }]}>
                <Select
                  showSearch
                  placeholder="Selecione..."
                  options={categories.map(c => ({ label: c.name, value: c.uid }))}
                  filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Cidade/Estado" name="city" rules={[{ required: true, message: 'Insira a localização' }]}>
                <Select
                  labelInValue
                  showSearch
                  placeholder="Pesquisar cidade..."
                  filterOption={false}
                  onSearch={handleCitySearch}
                  options={cityOptions}
                  notFoundContent={null}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Telefone" name="phone">
                <Input placeholder="Contacto telefónico" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Descrição" name="description" rules={[{ required: true, message: 'A descrição é obrigatória' }]}>
            <Input.TextArea rows={4} placeholder="Descreva os serviços prestados..." />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Website" name="website">
                <Input prefix={<LinkOutlined />} placeholder="https://" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Instagram" name="instagram">
                <Input prefix={<InstagramOutlined />} placeholder="@utilizador" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Criar categoria de serviço"
        open={categoryModalVisible}
        onCancel={() => {
          setCategoryModalVisible(false);
          setCategoryName('');
          setCategoryDescription('');
          setCategoryError('');
        }}
        onOk={handleCreateCategory}
        okButtonProps={{ disabled: !categoryName.trim() }}
        confirmLoading={savingCategory}
        okText="Criar"
        destroyOnHidden
      >
        <Form layout="vertical">
          <Form.Item label="Nome da categoria" required validateStatus={categoryError ? "error" : ""} help={categoryError}>
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              onBlur={() => !categoryName.trim() && setCategoryError('Nome da categoria é obrigatório')}
              placeholder="Ex: Saúde"
            />
          </Form.Item>
          <Form.Item label="Descrição">
            <Input.TextArea
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              rows={3}
              placeholder="Breve descrição da categoria"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Services;