import { useEffect, useMemo, useState, Fragment } from 'react';
import { Card, Typography, Spin, Pagination, Button, Modal, Avatar, List, Form, Input, DatePicker, Select, notification, Dropdown, Upload, Tooltip, Tabs, Divider, Space, Tag, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StarOutlined, CheckOutlined, MoreOutlined, UploadOutlined, AppstoreOutlined, CalendarOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';
import _service from '@netuno/service-client';
import useFilteredPaginatedList from '../../../common/useFilteredPaginatedList.js';
import ListHeaderFilters from '../../../components/ListHeaderFilters';
import usePeople from '../../../common/usePeople.js';
import dayjs from 'dayjs';
import 'dayjs/locale/pt';
import './index.less';
import { useNavigate, useSearchParams } from 'react-router-dom';

dayjs.locale('pt');

const { Text, Title, Paragraph } = Typography;

const UserAvatar = ({ person, size, className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (!person) return null;

  let src = '/images/profile-default.png';

  if (!failed && person.avatar) {
    const avatarStr = String(person.avatar);
    if (avatarStr.startsWith('http') || avatarStr.startsWith('data:')) {
      src = avatarStr;
    } else {
      src = _service.url(`/asset?uid=${person.uid}&type=avatar&entity=people`);
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
  const [searchParams, setSearchParams] = useSearchParams();
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

  useEffect(() => {
    const uidFromUrl = searchParams.get('uid');
    if (uidFromUrl && !loading && events.length > 0) {
      const foundEvent = events.find(e => e.uid === uidFromUrl);
      if (foundEvent && (!eventDetails || eventDetails.uid !== uidFromUrl)) {
        setEventDetails(foundEvent);
      }
    } else if (!uidFromUrl && eventDetails) {
      setEventDetails(null);
    }
  }, [searchParams, events, loading]);

  const handleOpenModal = (ev) => {
    setEventDetails(ev);
    searchParams.set('uid', ev.uid);
    setSearchParams(searchParams);
  };

  const handleCloseModal = () => {
    setEventDetails(null);
    searchParams.delete('uid');
    setSearchParams(searchParams);
  };

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

    if (values.cover_image && values.cover_image.length > 0) {
      const fileObj = values.cover_image[0].originFileObj;
      if (fileObj) {
        formData.append('cover_image', fileObj); 
      }
    } else if (currentEvent && (currentEvent.cover_image || currentEvent.coverImage)) {
      formData.append('clear_cover_image', 'true');
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

  const getCoverUrl = (event) => {
    if (!event || !event.uid) return null;

    const rawCoverValue = event.cover_image || event.coverImage;
    if (!rawCoverValue) return null;

    const coverImageStr = String(rawCoverValue);

    if (coverImageStr.startsWith('http') || coverImageStr.startsWith('data:')) {
      return coverImageStr;
    }

    return _service.url(`/asset?uid=${event.uid}&type=cover_image&entity=event`);
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
    
    const url = getCoverUrl(event);
    let realFileName = 'imagem.jpg';
    const rawCover = event.cover_image || event.coverImage;
    
    if (rawCover) {
      const strCover = String(rawCover);
      if (strCover.startsWith('[')) {
        try {
          const parsed = JSON.parse(strCover);
          if (parsed.length > 0 && parsed[0].name) {
            realFileName = parsed[0].name;
          }
        } catch(e) {}
      } else if (!strCover.startsWith('http') && !strCover.startsWith('data:')) {
        realFileName = strCover;
      }
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
      cover_image: url ? [{ uid: '-1', name: realFileName, status: 'done', url: url }] : [],
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
           handleCloseModal(); 
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
              handleCloseModal();
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
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
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

  return (
    <div className="events-page">
      <ListHeaderFilters
        title="Eventos"
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
          
          const coverUrl = getCoverUrl(ev);

          return (
            <Card 
              key={ev.uid} 
              bordered={false}
              hoverable
              onClick={() => handleOpenModal(ev)}
              className="events-page__card"
              cover={
                <div className="events-page__card-cover">
                  <div className="events-page__card-cover-fallback">
                    <Title level={3} className="events-page__placeholder">EVENTO</Title>
                  </div>
                  
                  {coverUrl && (
                    <img
                      src={coverUrl}
                      alt={ev.name}
                      className="events-page__card-cover-image"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}

                  {ev.canEdit && (
                    <div className="events-page__card-cover-actions" onClick={(e) => e.stopPropagation()}>
                      <Dropdown 
                        placement="bottomRight"
                        menu={{
                          items: [
                            { key: 'edit', label: 'Editar', icon: <EditOutlined />, onClick: (e) => { e.domEvent.stopPropagation(); e.domEvent.preventDefault(); openEditModal(ev); } },
                            { key: 'delete', label: 'Eliminar', danger: true, icon: <DeleteOutlined />, onClick: (e) => { e.domEvent.stopPropagation(); e.domEvent.preventDefault(); confirmDeleteEvent(ev); } }
                          ]
                        }} 
                        trigger={['click']}
                      >
                        <Button shape="circle" size="small" icon={<MoreOutlined />} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} />
                      </Dropdown>
                    </div>
                  )}
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
        onCancel={handleCloseModal} 
        width={750}
        destroyOnHidden
        styles={{ body: { padding: 0, backgroundColor: '#f5f5f5' } }}
        bodyStyle={{ padding: 0, backgroundColor: '#f5f5f5' }}
        footer={[
          <Button key="close" onClick={handleCloseModal}>Fechar</Button>,
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
          <div className="events-page__view">
            
            <div className="events-page__view-cover">
              <div className="events-page__view-cover-fallback">EVENTO</div>
              {getCoverUrl(eventDetails) && (
                <img 
                  src={getCoverUrl(eventDetails)} 
                  alt="Capa do Evento" 
                  className="events-page__view-cover-image"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>

            <Card className="events-page__view-card" bordered={false}>
              <Title level={3} className="events-page__view-name">{eventDetails.name}</Title>

              <Space size="large" className="events-page__view-details" wrap>
                <div className="events-page__view-detail-item">
                  <UserAvatar person={eventDetails.host} size="small" />
                  <Text type="secondary">
                    Organizado por <strong style={{ color: '#000' }}>{eventDetails.host?.name}</strong>
                  </Text>
                </div>

                <div className="events-page__view-detail-item">
                  <CalendarOutlined />
                  <Text type="secondary">{formatFullDate(eventDetails.startDate)}</Text>
                </div>

                <div className="events-page__view-detail-item">
                  <EnvironmentOutlined />
                  <Text type="secondary">
                    {[eventDetails.city?.name, eventDetails.state?.name].filter(Boolean).join(', ') || 'Sem cidade definida'}
                    {eventDetails.location && ` • ${eventDetails.location}`}
                  </Text>
                </div>
              </Space>

              <Divider />

              <div className="events-page__view-about">
                <Title level={4}>Sobre</Title>
                <p>
                  {(eventDetails.description || 'Este evento ainda não adicionou uma descrição.')
                    .split('\n')
                    .map((line, index, array) => (
                      <Fragment key={index}>
                        {line}
                        {index < array.length - 1 && <br />}
                      </Fragment>
                    ))}
                </p>
              </div>
            </Card>

            <div className="events-page__view-tabs">
              <Tabs
                defaultActiveKey="participants"
                size="large"
                items={[
                  {
                    key: 'participants',
                    label: (
                      <Space>
                        <TeamOutlined style={{ fontSize: 18 }} />
                        <span>Participantes <Tag color="#8A6AA2" variant="solid" style={{ borderRadius: '32px' }}>{eventDetails.participantsCount}</Tag></span>
                      </Space>
                    ),
                    children: (
                      <div className="events-page__view-tabs-content">
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
                          <Empty description="Ainda ninguém confirmou presença. Seja o primeiro!" />
                        )}
                      </div>
                    )
                  }
                ]}
              />
            </div>

          </div>
        )}
      </Modal>

      <Modal title="Novo Evento" open={createModalVisible} onCancel={() => setCreateModalVisible(false)} onOk={() => form.submit()} confirmLoading={createLoading} okText="Criar Evento" destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={handleCreateEvent}>
          <Form.Item name="cover_image" label="Imagem de Capa" valuePropName="fileList" getValueFromEvent={normFile}>
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
          <Form.Item name="cover_image" label="Imagem de Capa" valuePropName="fileList" getValueFromEvent={normFile}>
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