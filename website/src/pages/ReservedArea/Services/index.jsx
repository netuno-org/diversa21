import { useEffect, useMemo, useState } from "react";
import { Card, Empty, Typography, Row, Col, Select, Spin, Pagination, Tag, Modal, Form, Input, Button, message as staticMessage, Popconfirm, App } from "antd";
import { EnvironmentOutlined, LinkOutlined, InstagramOutlined, PlusOutlined, ShareAltOutlined, DeleteOutlined, EditOutlined, HeartOutlined, HeartFilled, CalendarOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import _service from "@netuno/service-client";
import usePeople from "../../../common/usePeople.js";
import useFilteredPaginatedList from '../../../common/useFilteredPaginatedList.js';
import ListHeaderFilters from "../../../components/ListHeaderFilters";

import "./index.less";

const { Paragraph, Text, Title } = Typography;

function Services() {
  const { message } = App.useApp();
  const loggedUser = usePeople();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [showFavorites, setShowFavorites] = useState(false);
  
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [serviceForm] = Form.useForm();
  const [editingService, setEditingService] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  
  const [serviceDetails, setServiceDetails] = useState(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const serviceIdFromUrl = searchParams.get('id');
  const [fetchingDetail, setFetchingDetail] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const canCreateService = ['super-admin', 'management'].includes(loggedUser?.data?.group?.code);

  const requestData = useMemo(
    () => ({
      ...(selectedCategory ? { categoryUid: selectedCategory.uid } : {}),
      ...(showFavorites ? { favoritesOnly: true } : {}),
      _refresh: refreshTrigger 
    }),
    [selectedCategory, showFavorites, refreshTrigger]
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

  useEffect(() => {
    if (serviceIdFromUrl && !serviceDetails && !fetchingDetail) {
      const foundService = services?.find((s) => s.uid === serviceIdFromUrl);

      if (foundService) {
        setServiceDetails(foundService);
      } else if (!loading) {
        setFetchingDetail(true);
        _service({
          url: 'service/list',
          data: { uid: serviceIdFromUrl },
          success: ({ json }) => {
            if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
              setServiceDetails(json.data[0]);
            } else if (json?.data && json.data.uid) {
              setServiceDetails(json.data);
            }
            setFetchingDetail(false);
          },
          fail: () => {
            setFetchingDetail(false);
            message.error('Não foi possível carregar os detalhes do serviço partilhado.');
          }
        });
      }
    }
  }, [serviceIdFromUrl, services, serviceDetails, fetchingDetail, loading]);

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleCategoryChange = (categoryUid) => {
    const category = categories.find((item) => item.uid === categoryUid) || null;
    setSelectedCategory(category);
    if (pagination.current !== 1) {
      handlePaginationChange(1, pagination.size);
    }
  };

  const handleOpenService = (service) => {
    setServiceDetails(service);
    setSearchParams({ id: service.uid }, { replace: true });
  };

  const handleCloseService = () => {
    setServiceDetails(null);
    searchParams.delete('id');
    setSearchParams(searchParams, { replace: true });
  };

  const handleToggleFavorite = (service, e) => {
    if (e) e.stopPropagation();
    const actionMethod = service.isFavorite ? 'DELETE' : 'POST';
    _service({
      url: 'service/favorite',
      method: actionMethod,
      data: { serviceUid: service.uid },
      success: ({ json }) => {
        if (json?.result) {
          message.success(service.isFavorite ? 'Removido dos favoritos.' : 'Adicionado aos favoritos!');
          setRefreshTrigger(prev => prev + 1);
        }
      },
      fail: () => {
        message.error('Ocorreu um erro ao atualizar os favoritos.');
      }
    });
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

  const handleDeleteCategory = (categoryUid) => {
    _service({
      url: 'service_category',
      method: 'DELETE',
      data: { uid: categoryUid },
      success: ({ json }) => {
        if (json?.result) {
          message.success('Categoria apagada com sucesso!');
          setSelectedCategory(null);
          fetchCategories();
          setRefreshTrigger(prev => prev + 1);
        } else {
          message.error(json?.error || 'Erro ao apagar categoria.');
        }
      },
      fail: (err) => {
        const json = err?.json;
        message.error(json?.error || 'Erro de comunicação ao apagar a categoria.');
      }
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
      
      const isEdit = !!editingService;
      _service({
        url: 'service',
        method: isEdit ? 'PUT' : 'POST',
        data: {
          ...(isEdit ? { uid: editingService.uid } : {}),
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
            setEditingService(null);
            serviceForm.resetFields();
            message.success(isEdit ? 'Serviço editado com sucesso!' : 'Serviço publicado com sucesso!');
            
            if (!isEdit && pagination.current !== 1) {
              handlePaginationChange(1, pagination.size);
            }
            setRefreshTrigger(prev => prev + 1); 
          }
          setSavingService(false);
        },
        fail: (err) => {
          console.error(isEdit ? 'Falha ao editar serviço' : 'Falha ao criar serviço', err);
          message.error(isEdit ? 'Erro ao editar serviço.' : 'Erro ao criar serviço.');
          setSavingService(false);
        }
      });
    } catch (error) {
      console.log('Validação do formulário falhou:', error);
    }
  };

  const handleEditClick = (service, e) => {
    if (e) e.stopPropagation();
    setEditingService(service);
    setCityOptions([{ label: `${service.city?.name}, ${service.state?.name} / ${service.country?.name}`, value: service.city?.uid }]);
    setServiceModalVisible(true);
    
    setTimeout(() => {
      serviceForm.setFieldsValue({
        name: service.name,
        category: service.category?.uid,
        city: { label: `${service.city?.name}, ${service.state?.name} / ${service.country?.name}`, value: service.city?.uid },
        phone: service.phone,
        description: service.description,
        website: service.website,
        instagram: service.instagram
      });
    }, 50);
  };

  const handleDeleteService = (uid, e) => {
    if (e) e.stopPropagation();
    _service({
      url: 'service',
      method: 'DELETE',
      data: { uid },
      success: ({ json }) => {
        if (json?.result) {
          message.success('Serviço removido com sucesso!');
          setRefreshTrigger(prev => prev + 1);
        }
      },
      fail: (err) => {
        console.error('Falha ao remover serviço', err);
        message.error('Erro ao remover o serviço.');
      }
    });
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
          
          extraActionButtons={
            loggedUser.canManageServiceCategories() ? (
              <Button 
                type="primary"
                icon={<PlusOutlined />} 
                onClick={() => setCategoryModalVisible(true)}
              >
                Nova categoria
              </Button>
            ) : null
          }
          
          onSearch={handleSearch}
          onLocationChange={handleLocationChange}
          onLocationClear={handleLocationClear}
          onSearchClear={handleSearchClear}
          searchPlaceholder="Buscar por nome do serviço"
          
          fullWidthSearch={true}
          
          extraFilters={
            <div className="services-list__filters-wrapper">
              
              <div className="services-list__filters-main">
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
                  className="services-list__filters-select"
                />
                {selectedCategory && loggedUser.canManageServiceCategories() && (
                  <Popconfirm
                    title="Apagar categoria?"
                    description="Apenas categorias sem serviços podem ser apagadas."
                    onConfirm={() => handleDeleteCategory(selectedCategory.uid)}
                    okText="Sim"
                    cancelText="Não"
                  >
                    <Button danger icon={<DeleteOutlined />} title="Apagar categoria selecionada" />
                  </Popconfirm>
                )}
              </div>
              
              <Button 
                type={showFavorites ? "primary" : "default"}
                danger={showFavorites}
                icon={showFavorites ? <HeartFilled /> : <HeartOutlined />}
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  if (pagination.current !== 1) {
                    handlePaginationChange(1, pagination.size);
                  }
                }}
              >
                Favoritos
              </Button>
            </div>
          }
        />
      </div>

      <div className="services-list__count">
        <Text type="secondary">
          {pagination.total} {pagination.total !== 1 ? 'serviços' : 'serviço'} encontrado{pagination.total !== 1 ? 's' : ''}
          {selectedCategory ? ` na categoria "${selectedCategory.name}"` : ''}
          {showFavorites ? ` nos seus favoritos` : ''}
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
            onClick={() => handleOpenService(service)}
          >
            <div className="services-list__card-content">
              <div className="services-list__card-header">
                <Title level={4} className="services-list__title">
                  {service.name}
                </Title>
                <div className="services-list__card-actions" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    type="text" 
                    size="small"
                    icon={service.isFavorite ? <HeartFilled className="services-list__heart-filled" /> : <HeartOutlined className="services-list__heart-outlined" />} 
                    onClick={(e) => handleToggleFavorite(service, e)}
                    className="services-list__favorite-btn"
                  />
                  {canCreateService && (
                    <>
                      <Button type="text" size="small" className="services-list__action-btn" onClick={(e) => handleEditClick(service, e)}>
                        <EditOutlined />
                      </Button>
                      <Popconfirm
                        title="Remover serviço?"
                        description="Esta ação é irreversível"
                        onConfirm={(e) => handleDeleteService(service.uid, e)}
                        okText="Sim"
                        cancelText="Não"
                      >
                        <Button danger type="text" size="small" className="services-list__action-btn">
                          <DeleteOutlined />
                        </Button>
                      </Popconfirm>
                    </>
                  )}
                </div>
              </div>

              <div className="services-list__card-subheader">
                {service.category?.name && (
                  <Tag className="services-list__category-tag">{service.category.name}</Tag>
                )}
                <div className="services-list__card-location">
                  <EnvironmentOutlined />
                  <Text type="secondary">
                    {service.city?.name}, {service.state?.name}
                  </Text>
                </div>
                {service.createdAt && (
                  <div className="services-list__card-location">
                    <CalendarOutlined />
                    <Text type="secondary" className="services-list__date-text">
                      Adicionado a {formatDate(service.createdAt)}
                    </Text>
                  </div>
                )}
              </div>
              
              {service.description && (
                <Paragraph className="services-list__description" ellipsis={{ rows: 3 }}>
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
                  <LinkOutlined />
                  <a
                    href={service.website.startsWith('http') ? service.website : `https://${service.website}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {service.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {service.instagram && (
                <div className="services-list__meta-item">
                  <InstagramOutlined />
                  <a
                    href={`https://instagram.com/${service.instagram.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    @{service.instagram.replace(/^@/, '')}
                  </a>
                </div>
              )}
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
        onCancel={handleCloseService}
        footer={[
          <Button 
            key="close" 
            type="primary" 
            onClick={handleCloseService}
          >
            Fechar
          </Button>
        ]}
        destroyOnHidden
      >
        {serviceDetails && (
          <div className="services-list__details">
            
            <div className="services-list__card-subheader">
              {serviceDetails.category?.name && (
                <Tag className="services-list__category-tag">{serviceDetails.category.name}</Tag>
              )}
              <div className="services-list__card-location">
                <EnvironmentOutlined />
                <Text type="secondary">
                  {serviceDetails.city?.name}, {serviceDetails.state?.name} / {serviceDetails.country?.name}
                </Text>
              </div>

              {serviceDetails.createdAt && (
                <div className="services-list__card-location">
                  <CalendarOutlined />
                  <Text type="secondary" className="services-list__date-text">
                    Adicionado a {formatDate(serviceDetails.createdAt)}
                  </Text>
                </div>
              )}
            </div>

            {serviceDetails.description && (
              <Paragraph className="services-list__description">
                {serviceDetails.description}
              </Paragraph>
            )}

            <div className="services-list__card-meta">
              {serviceDetails.phone && (
                <div className="services-list__meta-item">
                  <strong>Telefone:</strong> {serviceDetails.phone}
                </div>
              )}
              {serviceDetails.website && (
                <div className="services-list__meta-item">
                  <LinkOutlined />{' '}
                  <a
                    href={serviceDetails.website.startsWith('http') ? serviceDetails.website : `https://${serviceDetails.website}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {serviceDetails.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {serviceDetails.instagram && (
                <div className="services-list__meta-item">
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

          </div>
        )}
      </Modal>

      <Modal
        title={editingService ? "Editar Anúncio de Serviço" : "Novo Anúncio de Serviço"}
        open={serviceModalVisible}
        onCancel={() => {
          setServiceModalVisible(false);
          setEditingService(null);
          serviceForm.resetFields();
        }}
        onOk={handleCreateService}
        confirmLoading={savingService}
        okText={editingService ? "Guardar" : "Publicar"}
        destroyOnHidden
        width={700}
      >
        <Form form={serviceForm} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nome"
                name="name"
                rules={[
                  { required: true, message: 'Insira o nome do serviço' },
                  { max: 100, message: 'O nome não pode ter mais de 100 caracteres' }
                ]}
              >
                <Input maxLength={100} showCount placeholder="Nome do serviço ou profissional" />
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
              <Form.Item
                label="Telefone"
                name="phone"
                rules={[
                  { max: 30, message: 'O telefone não pode ter mais de 30 caracteres' }
                ]}
              >
                <Input maxLength={30} placeholder="Contacto telefónico" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Descrição"
            name="description"
            rules={[
              { required: true, message: 'A descrição é obrigatória' },
              { max: 250, message: 'A descrição não pode ter mais de 250 caracteres' }
            ]}
          >
            <Input.TextArea maxLength={250} showCount rows={4} placeholder="Descreva os serviços prestados..." />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Website"
                name="website"
                rules={[
                  { max: 150, message: 'O website não pode ter mais de 150 caracteres' }
                ]}
              >
                <Input maxLength={150} showCount prefix={<LinkOutlined />} placeholder="https://" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Instagram"
                name="instagram"
                rules={[
                  { max: 150, message: 'O instagram não pode ter mais de 150 caracteres' }
                ]}
              >
                <Input maxLength={150} showCount prefix={<InstagramOutlined />} placeholder="@utilizador" />
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

export default () => (
  <App>
    <Services />
  </App>
);