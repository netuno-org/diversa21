import { useState, useEffect, useMemo } from 'react';
import {
  Typography, Table, Tabs, Button,
  Empty, Space, Popconfirm, message, Form, Modal, Input
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import _service from '@netuno/service-client';

import './index.less';
import ListHeader from '../../../../components/ListHeader/index.jsx';

const { Text } = Typography;

function LocationList() {
  const [form] = Form.useForm();

  const [activeTab, setActiveTab] = useState('country');
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ search: '', country: null, state: null, city: '' });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const [locationOptions, setLocationOptions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Fetch all locations
  const loadLocations = () => {
    setLoading(true);
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
            newCountries.push({ uid: item.uid, name: countryName, code: item.code });
          } else if (item.type === 'state') {
            newStates.push({ uid: item.uid, name: stateName, countryName, code: item.code });
          } else if (item.type === 'city') {
            newCities.push({ uid: item.uid, name: cityName, stateName, countryName });
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
  };

  useEffect(() => {
    loadLocations();
  }, []);

  // Sync the form with the item being edited whenever the modal opens.
  useEffect(() => {
    if (isModalVisible) {
      if (editingItem) form.setFieldsValue(editingItem);
      else form.resetFields();
    }
  }, [isModalVisible, editingItem, form]);

  // TODO: validate the form, call _service, refresh state and show feedback.
  const handleSave = () => {
    setIsSaving(true);
    console.log('Guardar Registo...');

    // Simulated async work
    setTimeout(() => {
      setIsSaving(false);
      handleCloseModal();
    }, 500);
  };

  // TODO: call _service DELETE, remove item from local state and show feedback.
  const handleDelete = (uid) => {
    setIsDeleting(true);
    setTableLoading(true);
    console.log('Apagar Registo UID:', uid);

    // Simulated async work
    setTimeout(() => {
      setIsDeleting(false);
      setTableLoading(false);
    }, 500);
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  // Keeps the search input controlled and updates the filter as the user types.
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Triggered on submit/select: applies the search and jumps to the tab that has a match.
  const handleSearch = (value) => {
    setSearchTerm(value);
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));

    if (value && value.trim() !== '') {
      const searchLower = value.toLowerCase();

      if (countries.some(c => c.name?.toLowerCase().includes(searchLower) || c.code?.toLowerCase().includes(searchLower))) {
        setActiveTab('country');
      }
      else if (states.some(s => s.name?.toLowerCase().includes(searchLower) || s.code?.toLowerCase().includes(searchLower))) {
        setActiveTab('state');
      }
      else if (cities.some(c => c.name?.toLowerCase().includes(searchLower))) {
        setActiveTab('city');
      }
    }
  };

  // Fetches location suggestions for the Select dropdown as the user types.
  const handleLocationSelectSearch = (value) => {
    if (value.trim() === '') {
      setLocationOptions([]);
      return;
    }
    _service({
      url: `location/search?query=${value}`,
      success: (response) => {
        const options = response.json.data.map(location => ({
          value: location.label,
          label: location.label,
          uid: location.uid,
          type: location.type
        }));
        setLocationOptions(options);
      },
      fail: () => {
        setLocationOptions([]);
      }
    });
  };

  // Splits the "País > Estado > Cidade" label and updates filters + active tab according to the location type.
  const handleLocationChange = (value, option) => {
    setSelectedLocation(option);

    if (option) {
      const parts = option.label.split(' > ').map(p => p.trim());

      if (option.type === 'country') {
        setFilters(prev => ({ ...prev, country: parts[0], state: null, city: '' }));
        setActiveTab('country');
      }
      else if (option.type === 'state') {
        setFilters(prev => ({ ...prev, country: parts[0], state: parts[1], city: '' }));
        setActiveTab('state');
      }
      else if (option.type === 'city') {
        setFilters(prev => ({ ...prev, country: parts[0], state: parts[1], city: parts[2] }));
        setActiveTab('city');
      }
    } else {
      setFilters(prev => ({ ...prev, country: null, state: null, city: '' }));
    }

    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Resets the location Select and clears all related filters.
  const handleLocationClear = () => {
    setLocationOptions([]);
    setSelectedLocation(null);
    setSearchTerm('');
    setFilters(prev => ({ ...prev, search: '', country: null, state: null, city: '' }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTabChange = (key) => {
    setTableLoading(true);
    setActiveTab(key);
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(() => setTableLoading(false), 200);
  };

  const filteredCountries = useMemo(() => {
    let result = countries || [];
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(c => c.name?.toLowerCase().includes(searchLower) || c.code?.toLowerCase().includes(searchLower));
    }
    if (filters.country) result = result.filter(c => c.name === filters.country);
    return result;
  }, [countries, filters]);

  const filteredStates = useMemo(() => {
    let result = states || [];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(s => s.name?.toLowerCase().includes(searchLower) || s.code?.toLowerCase().includes(searchLower));
    }

    if (filters.country) result = result.filter(s => s.countryName === filters.country);

    if (filters.state) result = result.filter(s => s.name === filters.state);

    return result;
  }, [states, filters]);

  const filteredCities = useMemo(() => {
    let result = cities || [];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(c => c.name?.toLowerCase().includes(searchLower));
    }

    if (filters.country) result = result.filter(c => c.countryName === filters.country);
    if (filters.state) result = result.filter(c => c.stateName === filters.state);
    if (filters.city) result = result.filter(c => c.name === filters.city);

    return result;
  }, [cities, filters]);

  // Builds the table columns dynamically based on the active tab.
  const columns = useMemo(() => {
    const baseColumns = [
      { title: 'Nome', dataIndex: 'name', key: 'name', render: (text) => <Text>{text}</Text> }
    ];

    if (activeTab === 'country' || activeTab === 'state') {
      baseColumns.push({ title: 'Código', dataIndex: 'code', key: 'code' });
    }
    if (activeTab === 'city') {
      baseColumns.push({ title: 'Estado', dataIndex: 'stateName', key: 'stateName', render: (text) => <Text>{text}</Text> });
    }
    if (activeTab === 'state' || activeTab === 'city') {
      baseColumns.push({ title: 'País', dataIndex: 'countryName', key: 'countryName', render: (text) => <Text>{text}</Text> });
    }

    baseColumns.push({
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
            okButtonProps={{ loading: isDeleting }}
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

    return baseColumns;
  }, [activeTab, isDeleting]);

  const totalText = (total) => {
    if (activeTab === 'country') return total === 1 ? '1 país' : `${total} países`;
    if (activeTab === 'state') return total === 1 ? '1 estado' : `${total} estados`;
    if (activeTab === 'city') return total === 1 ? '1 cidade' : `${total} cidades`;
    return `Total: ${total}`;
  };

  // Returns the filtered dataset for the currently active tab.
  const getCurrentData = () => {
    if (activeTab === 'country') return filteredCountries;
    if (activeTab === 'state') return filteredStates;
    if (activeTab === 'city') return filteredCities;
    return [];
  };

  const currentData = getCurrentData();

  const renderTable = (data) => {
    if (!loading && !tableLoading && data.length === 0) {
      return <Empty description="Nenhum registo encontrado." />;
    }

    return (
      <Table
        dataSource={data}
        columns={columns}
        rowKey="uid"
        loading={loading || tableLoading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          placement: ['bottomCenter'],
          showTotal: totalText
        }}
      />
    );
  };

  return (
    <div className="locations-search-container">
      <div className="locations-search">
        <ListHeader
          title='Localizações'
          createButton={
            <ListHeader.Button
              icon={<PlusOutlined />}
              text="Novo registo"
              onClick={() => handleOpenModal()}
            />
          }
        >
          <div className='search-input-container'>
            <ListHeader.Input
              autoCompleteProps={{
                placeholder: 'Buscar por nome',
                popupMatchSelectWidth: 252,
                onSelect: handleSearch
              }}
              inputProps={{
                onSearch: handleSearch,
                onChange: handleSearchChange,
                enterButton: true,
                value: searchTerm,
              }}
            />

            <ListHeader.Select
              notFoundContent={null}
              placeholder="Cidade, Estado ou País"
              options={locationOptions}
              showSearch={true}
              onSearch={handleLocationSelectSearch}
              onChange={handleLocationChange}
              onClear={handleLocationClear}
              value={selectedLocation ? selectedLocation.value : undefined}
            />
          </div>
        </ListHeader>
      </div>

      <div className="results-info">
        <Text>{totalText(currentData.length)}</Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
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
          <Form.Item
            name="name"
            label="Nome"
            rules={[{ required: true, message: 'O nome é obrigatório!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default LocationList;