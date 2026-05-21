import { useState, useEffect, useMemo } from 'react';
import {
  Typography, Table, Tabs, Button,
  Empty, Space, Popconfirm, message, Form, Modal, Input, Select,
} from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { BiSolidLocationPlus } from "react-icons/bi";

import _service from '@netuno/service-client';

import useLocations from '../../../../common/useLocations.js';
import usePeople from '../../../../common/usePeople.js';

import ListHeaderFilters from '../../../../components/ListHeaderFilters/index.jsx';

import './index.less';

const { Text } = Typography;

function LocationList() {
  const {
    allCountries, allStates,
    filteredCountries, filteredStates, filteredCities,
    loading, reload, filters, setFilters
  } = useLocations();

  const loggedUser = usePeople();

  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [activeTab, setActiveTab] = useState('country');

  const [tableLoading, setTableLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });


  // Sync the form with the item being edited whenever the modal opens.
  useEffect(() => {
    if (isModalVisible) {
      if (editingItem) {
        form.setFieldsValue(editingItem);
      } else {
        form.resetFields();
      }
    }
  }, [isModalVisible, editingItem, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      setIsSaving(true);

      const isEditing = !!editingItem?.uid;
      let url = `location/${activeTab}`;

      const data = {
        name: values.name.trim()
      };

      if (isEditing) {
        data.uid = editingItem.uid;
      }

      if (activeTab === 'country') {
        data.code = values.code.trim().toUpperCase();
      } else if (activeTab === 'state') {
        data.code = values.code.trim().toUpperCase();
        data.countryUid = values.countryUid;
      } else if (activeTab === 'city') {
        data.stateUid = values.stateUid;
      }

      _service({
        url,
        method: editingItem ? 'PUT' : 'POST',
        data,
        success: ({ json }) => {
          if (json?.result) {
            messageApi.success(
              editingItem
                ? 'Registo atualizado com sucesso.'
                : 'Registo guardado com sucesso.');
            reload(activeTab);
            handleCloseModal();
          } else {
            const errorMsg = json?.error || 'Não foi possível guardar o registo.';
            messageApi.error(errorMsg);
          }
          setIsSaving(false);
        },
        fail: () => {
          messageApi.error('Falha de comunicação ao guardar o registo.');
          setIsSaving(false);
        },
      });
    } catch {
      return;
    }
  };

  const handleDelete = (uid) => {
    setIsDeleting(true);
    setTableLoading(true);

    _service({
      url: `location/${activeTab}`,
      method: 'DELETE',
      data: { uid },
      success: ({ json }) => {
        if (json?.result) {
          messageApi.success('Registo apagado com sucesso.');
          reload(activeTab);
        } else {
          messageApi.error(json?.error || 'Não foi possível apagar o registo.');
        }
        setIsDeleting(false);
        setTableLoading(false);
      },
      fail: (response) => {
        const json = response?.json;

        if (json?.error === 'country-has-states') {
          messageApi.error('Não é possível apagar: existem estados associados a este país.');
        } else if (json?.error === 'state-has-cities') {
          messageApi.error('Não é possível apagar: existem cidades associadas a este estado.');
        } else if (json?.error) {
          messageApi.error(json.error);
        } else {
          messageApi.error('Falha de comunicação ao apagar o registo.');
        }

        setIsDeleting(false);
        setTableLoading(false);
      },
    });
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

  // Jump to the tab that has a match.
  const jumpToMatchTable = (term) => {
    if (term && term.trim() !== '') {
      const q = term.toLowerCase();

      if ((activeTab === 'country' && allCountries.some(c => c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q)))
        || (activeTab === 'state' && allStates.some(s => s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q)))
        || (activeTab === 'city' && filteredCities.some(c => c.name?.toLowerCase().includes(q)))) {
        return;
      }

      if (allCountries.some(c => c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q))) {
        setActiveTab('country');
      } else if (allStates.some(s => s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q))) {
        setActiveTab('state');
      } else if (filteredCities.some(c => c.name?.toLowerCase().includes(q))) {
        setActiveTab('city');
      }
    }
  }

  // Triggered on submit/select: applies the search and jumps to the tab that has a match.
  const handleSearch = (term) => {
    setFilters(prev => ({ ...prev, term }));
    setPagination(prev => ({ ...prev, current: 1 }));
    jumpToMatchTable(term);
  };

  const handleSearchClear = () => {
    setFilters(prev => ({ ...prev, term: '' }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Keeps the search input controlled and updates the filter as the user types.
  const handleLocationChange = (option) => {
    setFilters(prev => ({ ...prev, location: option || null }));
    setPagination(prev => ({ ...prev, current: 1 }));

    if (option?.type === 'country') {
      setActiveTab('country');
    } else if (option?.type === 'state') {
      setActiveTab('state');
    } else if (option?.type === 'city') {
      setActiveTab('city');
    }
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
  }, [activeTab]);

  const totalText = (total) => {
    if (activeTab === 'country') {
      return total === 1 ? '1 país' : `${total} países`;
    }
    if (activeTab === 'state') {
      return total === 1 ? '1 estado' : `${total} estados`;
    }
    if (activeTab === 'city') {
      return total === 1 ? '1 cidade' : `${total} cidades`;
    }
    return `Total: ${total}`;
  };

  const currentData = activeTab === 'country' ? filteredCountries
    : activeTab === 'state' ? filteredStates
      : filteredCities;

  const renderTable = (data, type) => {
    const isLoading = loading[type] || tableLoading;

    if (!isLoading && data.length === 0) {
      return <Empty description="Nenhum registo encontrado." />;
    }

    return (
      <Table
        dataSource={data}
        columns={columns}
        rowKey="uid"
        loading={isLoading}
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
      {contextHolder}
      <div className="locations-search">
        <ListHeaderFilters
          title="Localidades"
          createButton={loggedUser.canManageLocations && {
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
        <Text type='secondary'>{totalText(currentData.length)}</Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={[
          { key: 'country', label: 'Países', children: renderTable(filteredCountries, 'country') },
          { key: 'state', label: 'Estados', children: renderTable(filteredStates, 'state') },
          { key: 'city', label: 'Cidades', children: renderTable(filteredCities, 'city') },
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
              rules={[
                { required: true, message: 'O código é obrigatório!' },
                { max: 3, message: 'O código não pode ter mais de 3 letras.' },
                { pattern: /^[a-zA-Z]+$/, message: 'Apenas letras são permitidas.' }
              ]}
            >
              <Input placeholder="Ex: PT, BR, SP" />
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
                options={allCountries.map(c => ({ value: c.uid, label: c.name }))}
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
                options={allStates.map(s => ({
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
