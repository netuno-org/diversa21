import { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Spin, Pagination, Button, Modal, Avatar, List, Form, Input, DatePicker, Select, notification, Dropdown, Upload, Tooltip, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StarOutlined, CheckOutlined, MoreOutlined, UploadOutlined, AppstoreOutlined } from '@ant-design/icons';
import _service from '@netuno/service-client';
import useFilteredPaginatedList from '../../../common/useFilteredPaginatedList.js';
import ListHeaderFilters from '../../../components/ListHeaderFilters';
import usePeople from '../../../common/usePeople.js';
import dayjs from 'dayjs';
import 'dayjs/locale/pt';
import './index.less';
import { useNavigate } from 'react-router-dom';

dayjs.locale('pt');

const { Text, Title, Paragraph } = Typography;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const UserAvatar = ({ person, size, style }) => {
  const [failed, setFailed] = useState(false);

  if (!person) return null;

  const defaultSrc = '/images/profile-default.png';
  let src = defaultSrc;

  if (!failed && person.avatar) {
    const avatarStr = String(person.avatar);
    if (avatarStr.startsWith('http') || avatarStr.startsWith('data:')) {
      src = avatarStr;
    } else {
      src = _service.url(`/asset?uid=${person.uid}&type=avatar&entity=people&t=${Date.now()}`);
    }
  }

  return (
    <Tooltip title={person.name || 'Participante'}>
      <Avatar
        size={size}
        src={src}
        onError={() => {
          if (!failed) setFailed(true);
          return true;
        }}
        style={{
          ...style,
          backgroundColor: '#f0f2f5',
          border: style?.border || '1px solid #fff',
        }}
      />
    </Tooltip>
  );
};

function Events() {
  const loggedUser = usePeople();
  const [showGoingOnly, setShowGoingOnly] = useState(false);
  const [participantsModal, setParticipantsModal] = useState({ visible: false, event: null, loading: false, items: [] });
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [actionLoadingUid, setActionLoadingUid] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  
  const requestData = useMemo(() => ({
    goingOnly: showGoingOnly
  }), [showGoingOnly]);

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

  const processFormPayload = async (values) => {
    let coverImageBase64 = null;
    if (values.coverImage && values.coverImage.length > 0) {
      const fileObj = values.coverImage[0].originFileObj;
      if (fileObj) {
        coverImageBase64 = await getBase64(fileObj);
      } else if (values.coverImage[0].url) {
        coverImageBase64 = values.coverImage[0].url;
      }
    }
    return {
      ...values,
      city: values.city?.value || values.city,
      startDate: values.startDate ? values.startDate.format('YYYY-MM-DD HH:mm:ss') : null,
      coverImage: coverImageBase64,
    };
  };

  const handleCreateEvent = async (values) => {
    if (createLoading) return;
    setCreateLoading(true);
    const payload = await processFormPayload(values);
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
      coverImage: event.coverImage ? [{ uid: '-1', name: 'imagem-capa.jpg', status: 'done', url: event.coverImage }] : [],
    });
    setEditModalVisible(true);
  };

  const handleUpdateEvent = async (values) => {
    if (!currentEvent) return;
    setCreateLoading(true);
    const payload = await processFormPayload(values);
    payload.eventUid = currentEvent.uid;
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

  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    const date = dayjs(dateString);
    if (date.isSame(dayjs(), 'day')) {
      return `Hoje às ${date.format('HH:mm')}`;
    }
    const dayName = date.format('ddd').replace('.', '');
    const dayMonth = date.format('DD/MM');
    const time = date.format('HH:mm');
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${dayMonth} às ${time}`;
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const getCoverUrl = (coverImage) => {
    if (!coverImage) return null;
    if (coverImage.startsWith('http') || coverImage.startsWith('data:')) return coverImage;
    if (coverImage.startsWith('[') && coverImage.endsWith(']')) {
      try {
        const files = JSON.parse(coverImage);
        if (files.length > 0 && files[0].uid) {
          return `/_services/core/file/download?uid=${files[0].uid}`;
        }
      } catch (e) {}
    }
    return coverImage;
  };

  return (
    <div className="events-page">
      <ListHeaderFilters
        title="Descobrir eventos"
        description="Encontre eventos e atividades perto de si."
        onSearch={(v) => handleSearch(v ? v.trim() : '')}
        fullWidthSearch
        createButton={{
          icon: <PlusOutlined />,
          text: 'Criar Evento',
          onClick: () => {
            setCityOptions([]);
            form.resetFields();
            setCreateModalVisible(true);
          },
        }}
      />

      <Tabs
        activeKey={showGoingOnly ? "going" : "general"}
        onChange={(key) => {
          setShowGoingOnly(key === "going");
          if (pagination.current !== 1) {
            handlePaginationChange(1, pagination.size);
          }
        }}
        items={[
          {
            key: "general",
            label: (
              <span>
                <AppstoreOutlined style={{ marginRight: 8 }} />
                Geral
              </span>
            ),
          },
          {
            key: "going",
            label: (
              <span>
                <StarOutlined style={{ marginRight: 8 }} />
                Com interesse
              </span>
            ),
          },
        ]}
        style={{ marginTop: 16 }}
      />

      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          {pagination.total} {pagination.total === 1 ? 'Evento Encontrado' : 'Eventos Encontrados'}
          {showGoingOnly ? ' marcados com interesse' : ''}
        </Text>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
        {!loading && events.map((ev) => {
          const locationText = [
            ev.location, 
            ev.city?.name ? `${ev.city.name}${ev.state?.name ? `, ${ev.state.name}` : ''}` : null
          ].filter(Boolean).join(' - ') || 'Localização não especificada';
          
          const coverUrl = getCoverUrl(ev.coverImage);

          return (
            <Card 
              key={ev.uid} 
              bordered={false}
              hoverable
              styles={{ body: { padding: '14px 14px 18px 14px' } }}
              style={{ overflow: 'hidden', borderRadius: '10px', display: 'flex', flexDirection: 'column' }}
              cover={
                <div style={{ 
                  height: '150px', 
                  position: 'relative', 
                  backgroundImage: coverUrl ? `url(${coverUrl})` : 'linear-gradient(135deg, #8b6aa2 0%, #5d466c 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  {ev.canEdit && (
                    <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 10, right: 10 }}>
                      <Dropdown 
                        placement="bottomRight"
                        menu={{
                          items: [
                            { key: 'edit', label: 'Editar', icon: <EditOutlined />, onClick: (e) => { e.domEvent.stopPropagation(); openEditModal(ev); } },
                            { key: 'delete', label: 'Eliminar', danger: true, icon: <DeleteOutlined />, onClick: (e) => { e.domEvent.stopPropagation(); confirmDeleteEvent(ev); } }
                          ]
                        }} 
                        trigger={['click']}
                      >
                        <Button shape="circle" size="small" type="text" icon={<MoreOutlined style={{ color: '#fff', fontSize: '18px' }} />} style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: 'none' }} />
                      </Dropdown>
                    </div>
                  )}
                  {!coverUrl && <Title level={3} style={{ color: 'rgba(255,255,255,0.2)', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>EVENTO</Title>}
                </div>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <UserAvatar person={ev.host} size="small" />
                  <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>{ev.host?.name}</Text>
                </div>

                <Text style={{ color: '#8b6aa2', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                  {formatEventDate(ev.startDate)}
                </Text>
                
                <Title level={5} style={{ margin: '0 0 4px 0', fontSize: '16px', lineHeight: 1.3 }} ellipsis={{ rows: 2 }}>
                  {ev.name}
                </Title>
                
                <Text type="secondary" style={{ fontSize: '13px', marginBottom: '4px' }} ellipsis>
                  {locationText}
                </Text>

                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginTop: '2px', flexGrow: 1 }} onClick={() => openParticipants(ev)}>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    {ev.participantsCount || 0} {ev.participantsCount === 1 ? 'com interesse' : 'com interesse'}
                  </Text>
                  {ev.participantsPreview && ev.participantsPreview.length > 0 && (
                    <>
                      <Text type="secondary" style={{ fontSize: '13px', margin: '0 4px' }}>·</Text>
                      <Avatar.Group maxCount={3} size="small" maxStyle={{ color: '#fff', backgroundColor: '#8b6aa2' }}>
                        {ev.participantsPreview.map((p, idx) => (
                          <UserAvatar key={idx} person={p} size="small" style={{ border: '1px solid #fff' }} />
                        ))}
                      </Avatar.Group>
                    </>
                  )}
                </div>

                <Button 
                  type={ev.isGoing ? 'primary' : 'default'} 
                  loading={actionLoadingUid === ev.uid} 
                  onClick={(e) => toggleGoing(ev, e)}
                  block
                  icon={ev.isGoing ? <CheckOutlined /> : <StarOutlined />}
                  style={{ 
                    marginTop: 16, 
                    height: '36px', 
                    borderRadius: '6px', 
                    fontWeight: 600,
                    backgroundColor: ev.isGoing ? '#8b6aa2' : '#f0f2f5',
                    borderColor: 'transparent',
                    color: ev.isGoing ? '#fff' : '#050505'
                  }}
                >
                  {ev.isGoing ? 'Presença Confirmada' : 'Com interesse'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
        <Pagination total={pagination.total} current={pagination.current} pageSize={pagination.size} onChange={handlePaginationChange} />
      </div>

      <Modal title="Novo Evento" open={createModalVisible} onCancel={() => setCreateModalVisible(false)} onOk={() => form.submit()} confirmLoading={createLoading} okText="Criar Evento" destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={handleCreateEvent}>
          <Form.Item name="coverImage" label="Imagem de Capa" valuePropName="fileList" getValueFromEvent={normFile}>
            <Upload listType="picture" maxCount={1} beforeUpload={() => false} accept="image/*">
              <Button icon={<UploadOutlined />}>Selecionar Imagem</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="name" label="Nome do Evento" rules={[{ required: true, message: 'Insira o nome do evento!' }]}>
            <Input placeholder="Ex: Encontro de Comunidade" />
          </Form.Item>
          <Form.Item name="startDate" label="Data e Hora" rules={[{ required: true, message: 'Selecione a data e hora do evento!' }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} placeholder="Selecione data e hora" />
          </Form.Item>
          <Form.Item name="city" label="Cidade/Estado" rules={[{ required: true, message: 'Insira a localização' }]}>
            <Select labelInValue showSearch placeholder="Pesquisar cidade..." filterOption={false} onSearch={handleCitySearch} options={cityOptions} notFoundContent={null} />
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
          <Form.Item name="coverImage" label="Imagem de Capa" valuePropName="fileList" getValueFromEvent={normFile}>
            <Upload listType="picture" maxCount={1} beforeUpload={() => false} accept="image/*">
              <Button icon={<UploadOutlined />}>Atualizar Imagem</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="name" label="Nome do Evento" rules={[{ required: true, message: 'Insira o nome do evento!' }]}>
            <Input placeholder="Ex: Encontro de Comunidade" />
          </Form.Item>
          <Form.Item name="startDate" label="Data e Hora" rules={[{ required: true, message: 'Selecione a data e hora do evento!' }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} placeholder="Selecione data e hora" />
          </Form.Item>
          <Form.Item name="city" label="Cidade/Estado" rules={[{ required: true, message: 'Insira a localização' }]}>
            <Select labelInValue showSearch placeholder="Pesquisar cidade..." filterOption={false} onSearch={handleCitySearch} options={cityOptions} notFoundContent={null} />
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
              <List.Item.Meta 
                avatar={<UserAvatar person={p} size="large" />} 
                title={p.name} 
                description={p.username ? `@${p.username}` : ''} 
              />
            </List.Item>
          )} />
        )}
      </Modal>
    </div>
  );
}

export default Events;