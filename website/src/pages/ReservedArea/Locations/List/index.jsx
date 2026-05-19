import { useState, useEffect, useMemo } from 'react';
import {
  Typography, Table, Tabs, Button,
  Empty, Space, Popconfirm, message, Form, Modal, Input, Select,
  Grid
} from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { BiSolidLocationPlus } from "react-icons/bi";

import _service from '@netuno/service-client';

import './index.less';

import ListHeaderFilters from '../../../../components/ListHeaderFilters/index.jsx';

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

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

  const [filters, setFilters] = useState({ search: '', location: null });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

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
        message.error('Falha de comunicação ao carregar as localidades.');
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

  const handleSave = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setIsSaving(true);

    let url = '';
    let data = {};

    if (activeTab === 'country') {
      url = 'location/country';
      data = { name: values.name, code: values.code };
    } else if (activeTab === 'state') {
      url = 'location/state';
      data = {
        name: values.name,
        code: values.code,
        country_id: values.countryUid,
      };
    } else if (activeTab === 'city') {
      url = 'location/city';
      data = {
        name: values.name,
        state_id: values.stateUid
      };
    }

    // if (editingItem?.uid) {
    //   data.uid = editingItem.uid;
    // }

    console.log('Saving state with:', data);
    _service({
      url,
      // method: editingItem ? 'PUT' : 'POST',
      method: 'POST',
      data,
      success: ({ json }) => {
        if (json?.result) {
          message.success('Registo guardado com sucesso.'
            // editingItem
            //   ? 'Registo atualizado com sucesso.'
            //   : 'Registo guardado com sucesso.'
          );
          loadLocations();
          handleCloseModal();
        } else {
          message.error('Não foi possível guardar o registo.');
        }
        setIsSaving(false);
      },
      fail: () => {
        message.error('Falha de comunicação ao guardar o registo.');
        setIsSaving(false);
      },
    });
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

  // Triggered on submit/select: applies the search and jumps to the tab that has a match.
  const handleSearch = (term) => {
    setFilters(prev => ({ ...prev, search: term }));
    setPagination(prev => ({ ...prev, current: 1 }));

    // Jump to the tab that has a match.
    if (term && term.trim() !== '') {
      const q = term.toLowerCase();

      if (countries.some(c => c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q))) {
        setActiveTab('country');
      } else if (states.some(s => s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q))) {
        setActiveTab('state');
      } else if (cities.some(c => c.name?.toLowerCase().includes(q))) {
        setActiveTab('city');
      }
    }
  };

  const handleSearchClear = () => {
    setFilters(prev => ({ ...prev, search: '' }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Keeps the search input controlled and updates the filter as the user types.
  const handleLocationChange = (option) => {
    setFilters(prev => ({ ...prev, location: option || null }));
    setPagination(prev => ({ ...prev, current: 1 }));

    if (option?.type === 'country') setActiveTab('country');
    else if (option?.type === 'state') setActiveTab('state');
    else if (option?.type === 'city') setActiveTab('city');
  };

  const handleLocationClear = () => {
    setFilters(prev => ({ ...prev, location: null }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTabChange = (key) => {
    setTableLoading(true);
    setActiveTab(key);
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(() => setTableLoading(false), 200);
  };

  const locationParts = useMemo(() => {
    if (!filters.location) return { country: null, state: null, city: null };

    const parts = (filters.location.label || '').split(' > ').map(p => p.trim());

    if (filters.location.type === 'country') return { country: parts[0], state: null, city: null };
    if (filters.location.type === 'state') return { country: parts[0], state: parts[1], city: null };
    if (filters.location.type === 'city') return { country: parts[0], state: parts[1], city: parts[2] };

    return { country: null, state: null, city: null };
  }, [filters.location]);

  const filteredCountries = useMemo(() => {
    let result = countries || [];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(c => c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q));
    }

    if (locationParts.country) result = result.filter(c => c.name === locationParts.country);

    return result;
  }, [countries, filters.search, locationParts]);

  const filteredStates = useMemo(() => {
    let result = states || [];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(s => s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q));
    }

    if (locationParts.country) result = result.filter(s => s.countryName === locationParts.country);
    if (locationParts.state) result = result.filter(s => s.name === locationParts.state);

    return result;
  }, [states, filters.search, locationParts]);

  const filteredCities = useMemo(() => {
    let result = cities || [];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(c => c.name?.toLowerCase().includes(q));
    }

    if (locationParts.country) result = result.filter(c => c.countryName === locationParts.country);
    if (locationParts.state) result = result.filter(c => c.stateName === locationParts.state);
    if (locationParts.city) result = result.filter(c => c.name === locationParts.city);

    return result;
  }, [cities, filters.search, locationParts]);

  // Builds the table columns dynamically based on the active tab.
  const columns = useMemo(() => {
    const baseColumns = [
      { title: 'Nome', dataIndex: 'name', key: 'name', render: (text) => <Text>{text}</Text> },
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
            <Button type="link" danger icon={<DeleteOutlined />} />
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
          showTotal: totalText,
        }}
      />
    );
  };

  return (
    <div className="locations-search-container">
      <div className="locations-search">
        <ListHeaderFilters
          title="Localidades"
          createButton={{
            icon: <BiSolidLocationPlus />,
            text: 'Novo registo',
            onClick: () => handleOpenModal(),
          }}
          onSearch={handleSearch}
          onSearchClear={handleSearchClear}
          onLocationChange={handleLocationChange}
          onLocationClear={handleLocationClear}
        />
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

          {(activeTab === 'country' || activeTab === 'state') && (
            <Form.Item
              name="code"
              label="Código"
              rules={[{ required: true, message: 'O código é obrigatório!' }]}
            >
              <Input />
            </Form.Item>
          )}

          {activeTab === 'state' && (
            <Form.Item
              name="countryUid"
              label="País"
              rules={[{ required: true, message: 'O país é obrigatório!' }]}
            >
              <Select
                placeholder="Selecione um país"
                options={countries.map(c => ({ value: c.uid, label: c.name }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          )}

          {activeTab === 'city' && (
            <Form.Item
              name="stateUid"
              label="Estado"
              rules={[{ required: true, message: 'O estado é obrigatório!' }]}
            >
              <Select
                placeholder="Selecione um estado"
                options={states.map(s => ({
                  value: s.uid,
                  label: `${s.name} | ${s.countryName}`,
                }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default LocationList;