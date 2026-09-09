import { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Spin, Pagination, Button, Modal, Avatar, List, Form, Input, DatePicker, Select, notification, Dropdown, Upload, Tooltip, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StarOutlined, CheckOutlined, MoreOutlined, UploadOutlined, AppstoreOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
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

const UserAvatar = ({ person, size, className = '' }) => {
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
        className={`events-page__avatar ${className}`}
        onError={() => {
          if (!failed) setFailed(true);
          return true;
        }}
      />
    </Tooltip>
  );
};

function Events() {
  const loggedUser = usePeople();
  const [showGoingOnly, setShowGoingOnly] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
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

  const processFormPayload = (values, currentEvent) => {
    const formData = new FormData();
    
    if (values.name) formData.append('name', values.name);
    if (values.description) formData.append('description', values.description);
    if (values.location) formData.append('location', values.location);
    if (values.city) formData.append('city', values.city?.value || values.city);
    if (values.startDate) formData.append('startDate', values.startDate.format('YYYY-MM-DD HH:mm:ss'));

    if (values.coverImage && values.coverImage.length > 0) {
      const fileObj = values.coverImage[0].originFileObj;
      if (fileObj) {
        formData.append('coverImage', fileObj); 
      }
    } else if (currentEvent && currentEvent.coverImage) {
      formData.append('clearCoverImage', 'true');
    }
    
    return formData;
  };

  const handleCreateEvent = async (values) => {
    if (createLoading) return;
    setCreateLoading(true);
    const payload = processFormPayload(values, null);
    
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
    
    const url = getCoverUrl(event.coverImage);
    
    editForm.setFieldsValue({
      name: event.name,
      location: event.location,
      city: event.city?.uid ? {
        label: `${event.city?.name}, ${event.state?.name} / ${event.country?.name}`,
        value: event.city?.uid,
      } : undefined,
      startDate: event.startDate ? dayjs(event.startDate) : null,
      description: event.description,
      coverImage: url ? [{ uid: '-1', name: 'capa.jpg', status: 'done', url: url }] : [],
    });
    setEditModalVisible(true);
  };

  const handleUpdateEvent = async (values) => {
    if (!currentEvent) return;
    setCreateLoading(true);
    
    const payload = processFormPayload(values, currentEvent);
    payload.append('eventUid', currentEvent.uid);

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
        
        if (eventDetails && eventDetails.uid === currentEvent.uid) {
           setEventDetails(null); 
        }
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
            if (eventDetails && eventDetails.uid === event.uid) {
              setEventDetails(null);
            }
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

        if (eventDetails && eventDetails.uid === event.uid) {
          setEventDetails(prev => ({ 
            ...prev, 
            isGoing: !prev.isGoing,
            participantsCount: prev.isGoing ? prev.participantsCount - 1 : prev.participantsCount + 1
          }));
        }

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

  const formatFullDate = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).format('dddd, DD [de] MMMM [de] YYYY [às] HH:mm');
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
        className="events-page__tabs"
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
                Participar
              </span>
            ),
          },
        ]}
      />

      <div className="events-page__results-count">
        <Text type="secondary">
          {pagination.total} {pagination.total === 1 ? 'Evento Encontrado' : 'Eventos Encontrados'}
          {showGoingOnly ? ' que vou participar' : ''}
        </Text>
      </div>

      {loading && (
        <div className="events-page__loading"><Spin size="large" /></div>
      )}

      <div className="events-page__grid">
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
              onClick={() => setEventDetails(ev)}
              className="events-page__card"
              cover={
                <div 
                  className="events-page__card-cover"
                  style={{ backgroundImage: coverUrl ? `url(${coverUrl})` : 'linear-gradient(135deg, #8b6aa2 0%, #5d466c 100%)' }}
                >
                  {ev.canEdit && (
                    <div className="events-page__card-cover-actions" onClick={(e) => e.stopPropagation()}>
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
                        <Button shape="circle" size="small" icon={<MoreOutlined />} />
                      </Dropdown>
                    </div>
                  )}
                  {!coverUrl && <Title level={3} className="events-page__placeholder">EVENTO</Title>}
                </div>
              }
            >
              <div className="events-page__card-content">
                
                <div className="events-page__card-host">
                  <UserAvatar person={ev.host} size="small" />
                  <Text type="secondary" className="events-page__card-host-name">{ev.host?.name}</Text>
                </div>

                <Text className="events-page__card-date">
                  {formatEventDate(ev.startDate)}
                </Text>
                
                <Title level={5} className="events-page__card-title" ellipsis={{ rows: 2 }}>
                  {ev.name}
                </Title>
                
                <Text type="secondary" className="events-page__card-location" ellipsis>
                  {locationText}
                </Text>

                <div className="events-page__card-participants">
                  <Text type="secondary" className="events-page__card-participants-text">
                    {ev.participantsCount || 0} {ev.participantsCount === 1 ? 'participante' : 'participantes'}
                  </Text>
                  {ev.participantsPreview && ev.participantsPreview.length > 0 && (
                    <>
                      <Text type="secondary" className="events-page__card-participants-dot">·</Text>
                      <Avatar.Group size="small">
                        {ev.participantsPreview.slice(0, 3).map((p, idx) => (
                          <UserAvatar key={idx} person={p} size="small" className="events-page__avatar--bordered" />
                        ))}
                        {ev.participantsCount > 3 && (
                          <Avatar size="small" style={{ backgroundColor: '#8b6aa2', color: '#fff', border: '1px solid #fff' }}>
                            +{ev.participantsCount - 3}
                          </Avatar>
                        )}
                      </Avatar.Group>
                    </>
                  )}
                </div>

                <Button 
                  className={`events-page__rsvp-btn ${ev.isGoing ? 'events-page__rsvp-btn--going' : ''}`}
                  loading={actionLoadingUid === ev.uid} 
                  onClick={(e) => toggleGoing(ev, e)}
                  block
                  icon={ev.isGoing ? <CheckOutlined /> : <StarOutlined />}
                >
                  {ev.isGoing ? 'Presença Confirmada' : 'Participar'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="events-page__footer">
        <Pagination total={pagination.total} current={pagination.current} pageSize={pagination.size} onChange={handlePaginationChange} />
      </div>

      <Modal 
        title="Detalhes do Evento" 
        open={!!eventDetails} 
        onCancel={() => setEventDetails(null)} 
        width={650}
        destroyOnHidden
        footer={[
          <Button key="close" onClick={() => setEventDetails(null)}>Fechar</Button>,
          <Button 
            key="rsvp" 
            className={`events-page__details-rsvp-btn ${eventDetails?.isGoing ? 'events-page__details-rsvp-btn--going' : ''}`}
            loading={actionLoadingUid === eventDetails?.uid} 
            onClick={() => toggleGoing(eventDetails)}
            icon={eventDetails?.isGoing ? <CheckOutlined /> : <StarOutlined />}
          >
            {eventDetails?.isGoing ? 'Presença Confirmada' : 'Participar'}
          </Button>
        ]}
      >
        {eventDetails && (
          <div className="events-page__details">
            <div 
              className="events-page__details-cover"
              style={{ backgroundImage: getCoverUrl(eventDetails.coverImage) ? `url(${getCoverUrl(eventDetails.coverImage)})` : 'linear-gradient(135deg, #8b6aa2 0%, #5d466c 100%)' }}
            >
              {!getCoverUrl(eventDetails.coverImage) && <Title level={2} className="events-page__placeholder">EVENTO</Title>}
            </div>

            <Title level={3} className="events-page__details-title">{eventDetails.name}</Title>

            <div className="events-page__details-host">
              <UserAvatar person={eventDetails.host} size="default" />
              <div className="events-page__details-host-info">
                <Text type="secondary" className="events-page__details-host-label">Organizado por</Text>
                <Text className="events-page__details-host-name">{eventDetails.host?.name}</Text>
              </div>
            </div>

            <div className="events-page__details-meta">
              <div className="events-page__details-meta-item">
                <CalendarOutlined className="events-page__details-meta-icon" />
                <div className="events-page__details-meta-text">
                  <Text className="events-page__details-meta-value">{formatFullDate(eventDetails.startDate)}</Text>
                  <Text type="secondary">Horário local</Text>
                </div>
              </div>

              <div className="events-page__details-meta-item">
                <EnvironmentOutlined className="events-page__details-meta-icon" />
                <div className="events-page__details-meta-text">
                  <Text className="events-page__details-meta-value">
                    {[eventDetails.city?.name, eventDetails.state?.name].filter(Boolean).join(', ') || 'Sem cidade definida'}
                  </Text>
                  <Text type="secondary">{eventDetails.location || 'Detalhes do local não especificados'}</Text>
                </div>
              </div>
            </div>

            {eventDetails.description && (
              <div className="events-page__details-about">
                <Title level={5} className="events-page__details-about-title">Sobre o evento</Title>
                <Paragraph className="events-page__details-about-text">
                  {eventDetails.description}
                </Paragraph>
              </div>
            )}

            <div className="events-page__details-participants">
              <Title level={5} className="events-page__details-participants-title">
                Participantes ({eventDetails.participantsCount})
              </Title>
              
              {eventDetails.participantsPreview && eventDetails.participantsPreview.length > 0 ? (
                <>
                  <div className="events-page__details-participants-grid">
                    {eventDetails.participantsPreview.map((p, idx) => (
                      <div key={idx} className="events-page__details-participants-item">
                        <UserAvatar person={p} size="default" />
                        <Text className="events-page__details-participants-name" ellipsis>{p.name}</Text>
                      </div>
                    ))}
                  </div>
                  {eventDetails.participantsCount > 10 && (
                    <div 
                      className="events-page__details-participants-more"
                      onClick={(e) => { e.stopPropagation(); openParticipants(eventDetails); }}
                    >
                      Ver todos os {eventDetails.participantsCount} participantes...
                    </div>
                  )}
                </>
              ) : (
                <Text type="secondary">Ainda ninguém confirmou presença. Seja o primeiro!</Text>
              )}
            </div>

          </div>
        )}
      </Modal>

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
            <DatePicker showTime format="YYYY-MM-DD HH:mm" className="events-page__form-full-width" placeholder="Selecione data e hora" />
          </Form.Item>
          <Form.Item name="city" label="Cidade/Estado" rules={[{ required: true, message: 'Insira a localização' }]}>
            <Select labelInValue showSearch placeholder="Pesquisar cidade..." filterOption={false} onSearch={handleCitySearch} options={cityOptions} notFoundContent={null} />
          </Form.Item>
          <Form.Item name="location" label="Local / Endereço">
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
            <DatePicker showTime format="YYYY-MM-DD HH:mm" className="events-page__form-full-width" placeholder="Selecione data e hora" />
          </Form.Item>
          <Form.Item name="city" label="Cidade/Estado" rules={[{ required: true, message: 'Insira a localização' }]}>
            <Select labelInValue showSearch placeholder="Pesquisar cidade..." filterOption={false} onSearch={handleCitySearch} options={cityOptions} notFoundContent={null} />
          </Form.Item>
          <Form.Item name="location" label="Local / Endereço">
            <Input placeholder="Ex: Auditório Principal" />
          </Form.Item>
          <Form.Item name="description" label="Descrição" rules={[{ required: true, message: 'A descrição é obrigatória' }]}>
            <Input.TextArea rows={4} placeholder="Descreve o evento..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={participantsModal.event ? `Participantes — ${participantsModal.event.name}` : 'Participantes'} open={participantsModal.visible} onCancel={closeParticipants} footer={null}>
        {participantsModal.loading ? (
          <div className="events-page__loading"><Spin /></div>
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