import { useState, useEffect, useMemo } from 'react';
import {
  Typography, Table, Tabs, Button, Spin,
  Empty, Space, Popconfirm, message, Form, Modal, Input
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentFilled } from '@ant-design/icons';

import _service from '@netuno/service-client';
import './index.less';

const { Title, Text } = Typography;

function LocationList() {
  const [form] = Form.useForm();

  const [activeTab, setActiveTab] = useState('country');
  const [loading, setLoading] = useState(true);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
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

        console.log("Dados que carregaram do BackEnd", items);

        items.forEach(item => {
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
        message.error(`Falha de comunicação ao carregar as localizações.`);
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (isModalVisible) {
      if (editingItem) {
        form.setFieldsValue(editingItem);
      } else {
        form.resetFields();
      }
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

  const handleSave = async () => {
    handleCloseModal();
  };

  const handleDelete = (uid) => {
    console.log('Apagar Registo UID:', uid);
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: 'Nome',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <Text strong>{text}</Text>
      }
    ];

    if (activeTab === 'country' || activeTab === 'state') {
      baseColumns.push({
        title: 'Código',
        dataIndex: 'code',
        key: 'code',
      });
    }

    if (activeTab === 'city') {
      baseColumns.push({
        title: 'Estado',
        dataIndex: 'stateName',
        key: 'stateName',
      });
    }

    if (activeTab === 'state' || activeTab === 'city') {
      baseColumns.push({
        title: 'País',
        dataIndex: 'countryName',
        key: 'countryName',
      });
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
  }, [activeTab]);

  const renderTable = (data) => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Spin size="large" />
        </div>
      );
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
            showTotal: (total) => {
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
            }
          }}
        />
      </>
    );
  };


  return (
    <section className="locations-list">
      <div className="list-header">
        <div className='title-wrapper'>
          <Title level={1}>Localizações</Title>
        </div>
        {(
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            Nov{activeTab === 'country' ? 'o País' : activeTab === 'state' ? 'o Estado' : 'a Cidade'}
          </Button>
        )}
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'country', label: 'Países', children: renderTable(countries) },
          { key: 'state', label: 'Estados', children: renderTable(states) },
          { key: 'city', label: 'Cidades', children: renderTable(cities) },
        ]}
      />

      <Modal
        title={editingItem ? `Editar Registo` : `Novo Registo`}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={handleCloseModal}
        okText="Guardar"
        cancelText="Cancelar"
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
    </section>
  );
}

export default LocationList;