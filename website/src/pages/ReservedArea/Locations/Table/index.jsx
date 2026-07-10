import { useState, useMemo } from 'react';
import { Table, Button, Space, Popconfirm, Typography, Empty, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

import _service from '@netuno/service-client';

const { Text } = Typography;

function LocationTable({
  activeTab,
  data,
  loading,
  pagination,
  setPagination,
  onEdit,
  onDeleteSuccess
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const [deletingUid, setDeletingUid] = useState(null);

  const handleDelete = (uid) => {
    setDeletingUid(uid);
    _service({
      // The endpoint dynamically adapts to the current tab (e.g., 'location/country')
      url: `location/${activeTab}`,
      method: 'DELETE',
      data: { uid },
      success: ({ json }) => {
        if (json?.result) {
          messageApi.success('Registro apagado com sucesso.');
          onDeleteSuccess() && onDeleteSuccess();
        } else {
          messageApi.error(json?.error || 'Não foi possível apagar o registro.');
        }
        setDeletingUid(null);
      },
      fail: (response) => {
        const json = response?.json;

        // Catch custom backend database constraint errors to show friendly messages
        if (json?.error === 'country-has-states') {
          messageApi.error('Não é possível apagar: existem estados associados a este país.');
        } else if (json?.error === 'state-has-cities') {
          messageApi.error('Não é possível apagar: existem cidades associadas a este estado.');
        } else {
          messageApi.error(json?.error || 'Falha de comunicação ao apagar o registro.');
        }
        setDeletingUid(null);
      },
    });
  };

  // Dynamically constructs the table columns based on the selected geographic level
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

    // Action buttons
    baseColumns.push({
      title: 'Ações',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          <Popconfirm
            title="Tem a certeza que deseja apagar?"
            placement='topRight'
            onConfirm={() => handleDelete(record.uid)}
            okButtonProps={{ loading: deletingUid === record.uid }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    });

    return baseColumns;
  }, [activeTab, deletingUid, onEdit]);

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

  if (!loading && data.length === 0) {
    return (
      <>
        {contextHolder}
        <Empty description="Nenhum registro encontrado." />
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <Table
        dataSource={data}
        columns={columns}
        rowKey="uid"
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          placement: ['bottomCenter'],
          showTotal: totalText,
        }}
      />
    </>
  );
}

export default LocationTable;