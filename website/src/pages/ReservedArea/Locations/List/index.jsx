import { useState, useEffect, useMemo } from 'react';
import {
  Typography, Table, Tabs, Button, Spin,
  Empty, Space, Popconfirm, message, Form, Modal, Input, Select
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';

import _service from '@netuno/service-client';
import './index.less';

const { Title, Text } = Typography;
const { Option } = Select;

function LocationList() {
  const [form] = Form.useForm();

  const [activeTab, setActiveTab] = useState('country');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [filters, setFilters] = useState({ search: '', country: null, state: null, city: '' });


  // Fetch all locations
  useEffect(() => {
    _service({
      url: 'location/search',
      method: 'GET',
      data: { query: '' },
      success: ({ json }) => {
        const items = Array.isArray(json?.data) ? json.data : [];

        const newCountries = [];
        const newStates = [];
        const newCities = [];

        items.forEach(item => {
          // Returns labels formatted as "País > Estado > Cidade".
          const [countryName, stateName, cityName] = (item.label || "")
            .split(' > ')
            .map(part => part?.trim());

          if (item.type === 'country') {
            newCountries.push({
              uid: item.uid,
              name: countryName,
              code: item.code
            });
          }
          else if (item.type === 'state') {
            newStates.push({
              uid: item.uid,
              name: stateName,
              countryName: countryName,
              code: item.code
            });
          }
          else if (item.type === 'city') {
            newCities.push({
              uid: item.uid,
              name: cityName,
              stateName: stateName,
              countryName: countryName
            });
          }
        });
        setCountries(newCountries);
        setStates(newStates);
        setCities(newCities);

        setLoading(false);
      },
      fail: () => {
        message.error('Falha de comunicação ao carregar as localizações.');
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (isModalVisible && editingItem) {
      form.setFieldsValue(editingItem);
    } else if (isModalVisible) {
      form.resetFields();
    }
  }, [isModalVisible, editingItem, form]);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  // TODO: validate the form, call _service, refresh state and show feedback.
  const handleSave = () => handleCloseModal();

  // TODO: call _service DELETE, remove item from local state and show feedback.
  const handleDelete = (uid) => {
    console.log('Apagar Registo UID:', uid);
  };

  const filteredCountries = useMemo(() => {
    if (!filters.search) return countries;

    const q = filters.search.toLowerCase();

    return countries.filter(c =>
      c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q)
    );
  }, [countries, filters.search]);

  const filteredStates = useMemo(() => {
    let result = states;

    if (filters.search) {
      const q = filters.search.toLowerCase();

      result = result.filter(s =>
        s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q)
      );
    }

    if (filters.country) {
      result = result.filter(s => s.countryName === filters.country);
    }

    return result;
  }, [states, filters.search, filters.country]);

  const filteredCities = useMemo(() => {
    let result = cities;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(c => c.name?.toLowerCase().includes(q));
    }

    if (filters.country) {
      result = result.filter(c => c.countryName === filters.country);
    }

    if (filters.state) {
      result = result.filter(c => c.stateName === filters.state);
    }

    if (filters.city) {
      const q = filters.city.toLowerCase();
      result = result.filter(c => c.name?.toLowerCase().includes(q));
    }

    return result;
  }, [cities, filters.search, filters.country, filters.state, filters.city]);

  const hasFilters = !!(filters.search || filters.country || filters.state || filters.city);

  const columns = useMemo(() => {
    const cols = [
      {
        title: 'Nome',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <Text strong>{text}</Text>
      }
    ];

    if (activeTab !== 'city') {
      cols.push({ title: 'Código', dataIndex: 'code', key: 'code' });
    }

    if (activeTab === 'city') {
      cols.push({ title: 'Estado', dataIndex: 'stateName', key: 'stateName' });
    }

    if (activeTab !== 'country') {
      cols.push({ title: 'País', dataIndex: 'countryName', key: 'countryName' });
    }

    cols.push({
      title: 'Ações',
      key: 'actions',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          />

          <Popconfirm
            title="Tem a certeza que deseja apagar?"
            onConfirm={() => handleDelete(record.uid)}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    });
    return cols;
  }, [activeTab]);

  const totalText = (total) => {
    if (activeTab === 'country') return total === 1 ? '1 país' : `${total} países`;
    if (activeTab === 'state') return total === 1 ? '1 estado' : `${total} estados`;
    if (activeTab === 'city') return total === 1 ? '1 cidade' : `${total} cidades`;
    return `Total: ${total}`;
  };

  const renderTable = (data) => {
    if (loading) {
      return <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Spin size="large" />
      </div>;
    }

    if (data.length === 0) {
      return <Empty description="Nenhum registo encontrado." />;
    }

    return (
      <>
        <div className="results-info" style={{ marginBottom: 16 }}>
          <Text type="secondary">
            {data.length} {data.length !== 1 ? 'registos encontrados' : 'registo encontrado'}
          </Text>
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="uid"
          pagination={{
            pageSize: 10,
            placement: ['bottomCenter'],
            showTotal: totalText
          }}
        />
      </>
    );
  };

  return (
    <section className="locations-list">
      <div className="list-header">
        <div className="title-wrapper">
          <Title level={1}>Localizações</Title>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
        >
          Nov{activeTab === 'country' ? 'o País' : activeTab === 'state' ? 'o Estado' : 'a Cidade'}
        </Button>
      </div>

      <div className="filters-section">
        <Space wrap size="middle">
          <Input.Search
            placeholder="Buscar por nome..."
            allowClear
            enterButton={<SearchOutlined />}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            style={{ width: 280 }}
            value={filters.search}
          />

          <Select
            placeholder="País"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => {
              setFilters(prev => ({ ...prev, country: value, state: null, city: '' }));
              if (value) setActiveTab('state');
            }}
            value={filters.country || undefined}
            showSearch
            optionFilterProp="children"
          >
            {countries.map(c => (
              <Option key={c.uid} value={c.name}>{c.name}</Option>
            ))}
          </Select>

          <Select
            placeholder="Estado"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => {
              setFilters(prev => ({ ...prev, state: value, city: '' }));
              if (value) setActiveTab('city');
            }}
            value={filters.state || undefined}
            disabled={!filters.country}
            showSearch
            optionFilterProp="children"
          >
            {states.filter(s => s.countryName === filters.country).map(s => (
              <Option key={s.uid} value={s.name}>{s.name}</Option>
            ))}
          </Select>

          <Input
            placeholder="Cidade"
            allowClear
            style={{ width: 180 }}
            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
            value={filters.city}
            disabled={!filters.state && !filters.country}
          />

          {hasFilters && (
            <Button type="link" onClick={() => setFilters({ search: '', country: null, state: null, city: '' })}>
              Limpar filtros
            </Button>
          )}
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'country', label: 'Países', children: renderTable(filteredCountries) },
          { key: 'state', label: 'Estados', children: renderTable(filteredStates) },
          { key: 'city', label: 'Cidades', children: renderTable(filteredCities) },
        ]}
      />

      <Modal
        title={editingItem ? 'Editar Registo' : 'Novo Registo'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={handleCloseModal}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={isSaving}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nome" rules={[{ required: true, message: 'O nome é obrigatório!' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
export default LocationList;