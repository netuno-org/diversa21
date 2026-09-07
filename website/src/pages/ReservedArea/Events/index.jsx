import { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Spin, Pagination, Button, Modal, Avatar, List, Space, Form, Input, notification } from 'antd';
import { EnvironmentOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import _service from '@netuno/service-client';
import useFilteredPaginatedList from '../../../common/useFilteredPaginatedList.js';
import ListHeaderFilters from '../../../components/ListHeaderFilters';
import usePeople from '../../../common/usePeople.js';
import './index.less';
import { useNavigate } from 'react-router-dom';

const { Text, Title, Paragraph } = Typography;

function Events() {
  const loggedUser = usePeople();
  const [participantsModal, setParticipantsModal] = useState({ visible: false, event: null, loading: false, items: [] });
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [actionLoadingUid, setActionLoadingUid] = useState(null);
  const [form] = Form.useForm();
  
  const requestData = useMemo(() => ({}), []);

  const { items: events, loading, pagination, handlePaginationChange, handleSearch, fetchList } = useFilteredPaginatedList({
    serviceUrl: 'events/list',
    requestData,
  });

  const navigate = useNavigate();

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
    _service({
      url: 'events',
      method: 'POST',
      data: values,
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <ListHeaderFilters
            title="Eventos"
            description="Crie e descubra eventos — veja quem vai participar e confirme presença."
            onSearch={(v) => handleSearch(v ? v.trim() : '')}
            fullWidthSearch
          />
        </div>
        <div style={{ marginLeft: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setCreateModalVisible(true)}>
            Criar Evento
          </Button>
        </div>
      </div>

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
              <div className="events-page__meta-item"><EnvironmentOutlined /> <Text>{ev.city?.name || ev.location || ''}</Text></div>
            </div>

            {ev.description && <Paragraph className="events-page__description" ellipsis={{ rows: 3 }}>{ev.description}</Paragraph>}

            <div className="events-page__actions">
              <Space>
                <Button 
                  type={ev.isGoing ? 'primary' : 'default'} 
                  loading={actionLoadingUid === ev.uid} 
                  onClick={(e) => toggleGoing(ev, e)}
                >
                  {ev.isGoing ? 'Presença Confirmada' : 'Vou'}
                </Button>
                <Button type="link" onClick={() => openParticipants(ev)}>{ev.participantsCount || 0} participantes</Button>
              </Space>
            </div>
          </Card>
        ))}
      </div>

      <div className="events-page__footer">
        <Pagination total={pagination.total} current={pagination.current} pageSize={pagination.size} onChange={handlePaginationChange} />
      </div>

      <Modal title="Criar Novo Evento" open={createModalVisible} onCancel={() => setCreateModalVisible(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleCreateEvent}>
          <Form.Item name="name" label="Nome do Evento" rules={[{ required: true, message: 'Insira o nome do evento!' }]}>
            <Input placeholder="Ex: Encontro de Comunidade" />
          </Form.Item>
          <Form.Item name="location" label="Localização">
            <Input placeholder="Ex: Auditório Principal" />
          </Form.Item>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={4} placeholder="Descreve o evento..." />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setCreateModalVisible(false)}>Cancelar</Button>
              <Button type="primary" htmlType="submit" loading={createLoading}>Criar</Button>
            </Space>
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