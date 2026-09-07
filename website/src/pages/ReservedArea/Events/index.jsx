import { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Spin, Pagination, Button, Modal, Avatar, List, Space, Form, Input, DatePicker, Select, notification } from 'antd';
import { EnvironmentOutlined, CalendarOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import _service from '@netuno/service-client';
import useFilteredPaginatedList from '../../../common/useFilteredPaginatedList.js';
import ListHeaderFilters from '../../../components/ListHeaderFilters';
import usePeople from '../../../common/usePeople.js';
import dayjs from 'dayjs';
import './index.less';
import { useNavigate } from 'react-router-dom';

const { Text, Title, Paragraph } = Typography;

function Events() {
  const loggedUser = usePeople();
  const [participantsModal, setParticipantsModal] = useState({ visible: false, event: null, loading: false, items: [] });
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [actionLoadingUid, setActionLoadingUid] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  
  const requestData = useMemo(() => ({}), []);

  const { items: events, loading, pagination, handlePaginationChange, handleSearch, fetchList } = useFilteredPaginatedList({
    serviceUrl: 'events/list',
    requestData,
  });

  const navigate = useNavigate();

  const handleCitySearch = (value) => {
    if (!value) {
      setCityOptions([]);
      return;
    }
    _service({
      url: `location/city/search?name=${value}`,
      success: ({ json }) => {
        setCityOptions(json.data.map((city) => ({ label: city.label, value: city.uid })));
      },
      fail: () => setCityOptions([]),
    });
  };

  const openParticipants = (event) => {
    setParticipantsModal({ visible: true, event, loading: true, items: [] });
    _service({
      url: 'events/participants',
      data: { eventUid: event.uid },
      success: ({ json }) => {
        let list = [];
        if (Array.isArray(json?.data)) {
          list = json.data;
        } else if (Array.isArray(json)) {
          list = json;
        } else if (json?.result && Array.isArray(json.result)) {
          list = json.result;
        }
        setParticipantsModal({ visible: true, event, loading: false, items: list });
      },
      fail: () => setParticipantsModal({ visible: true, event, loading: false, items: [] }),
    });
  };

  const closeParticipants = () => setParticipantsModal({ visible: false, event: null, loading: false, items: [] });

  const handleCreateEvent = (values) => {
    if (createLoading) return;
    setCreateLoading(true);
    const payload = {
      ...values,
      city: values.city?.value || values.city,
      startDate: values.startDate ? values.startDate.format('YYYY-MM-DD HH:mm:ss') : null,
    };
    _service({
      url: 'events',
      method: 'POST',
      data: payload,
      success: () => {
        setCreateLoading(false);
        setCreateModalVisible(false);
        form.resetFields();
        notification.success({ message: 'Evento criado com sucesso!' });
        fetchList({ term: pagination.term, location: pagination.location, page: 1 });
      },
      fail: () => {
        setCreateLoading(false);
        notification.error({ message: 'Erro ao criar o evento.' });
      },
    });
  };

  const openEditModal = (event) => {
    setCurrentEvent(event);
    if (event.city?.name) {
      setCityOptions([
        {
          label: `${event.city?.name}, ${event.state?.name} / ${event.country?.name}`,
          value: event.city?.uid,
        },
      ]);
    }
    editForm.setFieldsValue({
      name: event.name,
      location: event.location,
      city: event.city?.uid ? {
        label: `${event.city?.name}, ${event.state?.name} / ${event.country?.name}`,
        value: event.city?.uid,
      } : undefined,
      startDate: event.startDate ? dayjs(event.startDate) : null,
      description: event.description,
    });
    setEditModalVisible(true);
  };

  const handleUpdateEvent = (values) => {
    if (!currentEvent) return;
    setCreateLoading(true);
    const payload = {
      eventUid: currentEvent.uid,
      ...values,
      city: values.city?.value || values.city,
      startDate: values.startDate ? values.startDate.format('YYYY-MM-DD HH:mm:ss') : null,
    };
    _service({
      url: 'events',
      method: 'PUT',
      data: payload,
      success: () => {
        setCreateLoading(false);
        setEditModalVisible(false);
        setCurrentEvent(null);
        editForm.resetFields();
        notification.success({ message: 'Evento atualizado com sucesso!' });
        fetchList({ term: pagination.term, location: pagination.location, page: pagination.current });
      },
      fail: () => {
        setCreateLoading(false);
        notification.error({ message: 'Erro ao atualizar o evento.' });
      },
    });
  };

  const confirmDeleteEvent = (event) => {
    Modal.confirm({
      title: 'Eliminar Evento',
      content: `Tem a certeza que pretende eliminar o evento "${event.name}"?`,
      okText: 'Sim',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        _service({
          url: 'events',
          method: 'DELETE',
          data: { eventUid: event.uid },
          success: () => {
            notification.success({ message: 'Evento eliminado com sucesso!' });
            fetchList({ term: pagination.term, location: pagination.location, page: pagination.current });
          },
          fail: () => {
            notification.error({ message: 'Erro ao eliminar o evento.' });
          },
        });
      },
    });
  };

  const toggleGoing = (event, e) => {
    if (e) e.stopPropagation();
    setActionLoadingUid(event.uid);
    const method = event.isGoing ? 'DELETE' : 'POST';
    _service({
      url: 'events/attendance',
      method,
      data: method === 'POST' ? { eventUid: event.uid, status: 'going' } : { eventUid: event.uid },
      success: () => {
        setActionLoadingUid(null);
        fetchList({ term: pagination.term, location: pagination.location, page: pagination.current });
      },
      fail: () => {
        setActionLoadingUid(null);
        notification.error({ message: 'Erro ao atualizar presença.' });
      },
    });
  };

  return (
    <div className="events-page">
      <ListHeaderFilters
        title="Eventos"
        description="Crie e descubra eventos — veja quem vai participar e confirme presença."
        onSearch={(v) => handleSearch(v ? v.trim() : '')}
        fullWidthSearch
        createButton={{
          icon: <PlusOutlined />,
          text: 'Novo Evento',
          onClick: () => {
            setCityOptions([]);
            form.resetFields();
            setCreateModalVisible(true);
          },
        }}
      />

      {loading && (
        <div className="events-page__loading"><Spin size="large" /></div>
      )}

      <div className="events-page__list">
        {!loading && events.map((ev) => (
          <Card key={ev.uid} className="events-page__card">
            <div className="events-page__card-header">
              <Title level={4} className="events-page__title">{ev.name}</Title>
              <div className="events-page__host">
                <Avatar src={ev.host?.avatar ? `/asset?uid=${ev.host.uid}&type=avatar&entity=people` : '/images/profile-default.png'} />
                <Text>{ev.host?.name}</Text>
              </div>
            </div>

            <div className="events-page__meta">
              <div className="events-page__meta-item"><CalendarOutlined /> <Text>{ev.startDate ? new Date(ev.startDate).toLocaleString() : ''}</Text></div>
              <div className="events-page__meta-item">
                <EnvironmentOutlined /> 
                <Text>
                  {[
                    ev.city?.name ? `${ev.city.name}${ev.state?.name ? `, ${ev.state.name}` : ''}${ev.country?.name ? ` / ${ev.country.name}` : ''}` : null,
                    ev.location
                  ].filter(Boolean).join(' — ') || 'Localização não especificada'}
                </Text>
              </div>
            </div>

            {ev.description && <Paragraph className="events-page__description" ellipsis={{ rows: 3 }}>{ev.description}</Paragraph>}

            <div className="events-page__actions" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              <Button 
                type={ev.isGoing ? 'primary' : 'default'} 
                loading={actionLoadingUid === ev.uid} 
                onClick={(e) => toggleGoing(ev, e)}
                block
              >
                {ev.isGoing ? 'Presença Confirmada' : 'Vou'}
              </Button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => openParticipants(ev)}>
                  {ev.participantsPreview && ev.participantsPreview.length > 0 ? (
                    <Avatar.Group maxCount={3} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }} style={{ marginRight: 8 }}>
                      {ev.participantsPreview.map((p, idx) => (
                        <Avatar key={idx} src={p.avatar ? `/asset?uid=${p.uid}&type=avatar&entity=people` : '/images/profile-default.png'} />
                      ))}
                    </Avatar.Group>
                  ) : null}
                  <Button type="link" style={{ padding: 0 }}>
                    {ev.participantsCount || 0} {ev.participantsCount === 1 ? 'participante' : 'participantes'}
                  </Button>
                </div>
                {ev.canEdit && (
                  <Space size="small">
                    <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openEditModal(ev); }} />
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); confirmDeleteEvent(ev); }} />
                  </Space>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="events-page__footer">
        <Pagination total={pagination.total} current={pagination.current} pageSize={pagination.size} onChange={handlePaginationChange} />
      </div>

      <Modal title="Novo Evento" open={createModalVisible} onCancel={() => setCreateModalVisible(false)} onOk={() => form.submit()} confirmLoading={createLoading} okText="Criar Evento" destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={handleCreateEvent}>
          <Form.Item name="name" label="Nome do Evento" rules={[{ required: true, message: 'Insira o nome do evento!' }]}>
            <Input placeholder="Ex: Encontro de Comunidade" />
          </Form.Item>
          <Form.Item name="startDate" label="Data e Hora" rules={[{ required: true, message: 'Selecione a data e hora do evento!' }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} placeholder="Selecione data e hora" />
          </Form.Item>
          <Form.Item name="city" label="Cidade/Estado" rules={[{ required: true, message: 'Insira a localização' }]}>
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
          <Form.Item name="location" label="Local / Morada">
            <Input placeholder="Ex: Auditório Principal" />
          </Form.Item>
          <Form.Item name="description" label="Descrição" rules={[{ required: true, message: 'A descrição é obrigatória' }]}>
            <Input.TextArea rows={4} placeholder="Descreve o evento..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Editar Evento" open={editModalVisible} onCancel={() => setEditModalVisible(false)} onOk={() => editForm.submit()} confirmLoading={createLoading} okText="Guardar" destroyOnHidden>
        <Form form={editForm} layout="vertical" onFinish={handleUpdateEvent}>
          <Form.Item name="name" label="Nome do Evento" rules={[{ required: true, message: 'Insira o nome do evento!' }]}>
            <Input placeholder="Ex: Encontro de Comunidade" />
          </Form.Item>
          <Form.Item name="startDate" label="Data e Hora" rules={[{ required: true, message: 'Selecione a data e hora do evento!' }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} placeholder="Selecione data e hora" />
          </Form.Item>
          <Form.Item name="city" label="Cidade/Estado" rules={[{ required: true, message: 'Insira a localização' }]}>
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
          <Form.Item name="location" label="Local / Morada">
            <Input placeholder="Ex: Auditório Principal" />
          </Form.Item>
          <Form.Item name="description" label="Descrição" rules={[{ required: true, message: 'A descrição é obrigatória' }]}>
            <Input.TextArea rows={4} placeholder="Descreve o evento..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={participantsModal.event ? `Participantes — ${participantsModal.event.name}` : 'Participantes'} open={participantsModal.visible} onCancel={closeParticipants} footer={null}>
        {participantsModal.loading ? (
          <div style={{ textAlign: 'center' }}><Spin /></div>
        ) : (
          <List dataSource={participantsModal.items} renderItem={(p) => (
            <List.Item>
              <List.Item.Meta avatar={<Avatar src={p.avatar ? `/asset?uid=${p.uid}&type=avatar&entity=people` : '/images/profile-default.png'} />} title={p.name} description={p.username ? `@${p.username}` : ''} />
            </List.Item>
          )} />
        )}
      </Modal>
    </div>
  );
}

export default Events;