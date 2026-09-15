import { useEffect, useMemo, useState, Fragment } from 'react';
import { Card, Typography, Spin, Pagination, Button, Modal, Form, Input, DatePicker, Select, notification, Upload, Tabs, Divider, Space, Tag, Empty } from 'antd';
import { PlusOutlined, StarOutlined, CheckOutlined, UploadOutlined, AppstoreOutlined, CalendarOutlined, EnvironmentOutlined, TeamOutlined, HistoryOutlined } from '@ant-design/icons';
import _service from '@netuno/service-client';
import useFilteredPaginatedList from '../../../common/useFilteredPaginatedList.js';
import ListHeaderFilters from '../../../components/ListHeaderFilters';
import EventCard, { UserAvatar, getCoverUrl } from '../../../components/EventCard';
import usePeople from '../../../common/usePeople.js';
import dayjs from 'dayjs';
import 'dayjs/locale/pt';
import './index.less';
import { useNavigate, useSearchParams } from 'react-router-dom';

dayjs.locale('pt');

const { Text, Title } = Typography;

function Events() {
  const loggedUser = usePeople();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTab, setCurrentTab] = useState('general');
  const [eventDetails, setEventDetails] = useState(null);
  
  const [detailParticipants, setDetailParticipants] = useState([]);
  const [detailParticipantsPage, setDetailParticipantsPage] = useState(1);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [actionLoadingUid, setActionLoadingUid] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const canCreateEvent = ["super-admin", "management"].includes(loggedUser?.data?.group?.code);

  const requestData = useMemo(() => ({
    tab: currentTab,
    goingOnly: currentTab === 'going'
  }), [currentTab]);

  const { items: events, loading, pagination, handlePaginationChange, handleSearch, handleLocationChange, handleLocationClear, handleSearchClear, fetchList } = useFilteredPaginatedList({
    serviceUrl: 'events/list',
    requestData,
  });

  const navigate = useNavigate();

  const totalCount = pagination?.total ?? events.length;

  useEffect(() => {
    const uidFromUrl = searchParams.get('uid');
    if (uidFromUrl && !loading && events.length > 0) {
      const foundEvent = events.find(e => e.uid === uidFromUrl);
      if (foundEvent && (!eventDetails || eventDetails.uid !== uidFromUrl)) {
        setEventDetails(foundEvent);
        setDetailParticipants(foundEvent.participantsPreview || []);
        setDetailParticipantsPage(1);
      }
    } else if (!uidFromUrl && eventDetails) {
      setEventDetails(null);
      setDetailParticipants([]);
      setDetailParticipantsPage(1);
    }
  }, [searchParams, events, loading]);

  const handleOpenModal = (ev) => {
    setEventDetails(ev);
    setDetailParticipants(ev.participantsPreview || []);
    setDetailParticipantsPage(1);
    searchParams.set('uid', ev.uid);
    setSearchParams(searchParams);
  };

  const handleCloseModal = () => {
    setEventDetails(null);
    setDetailParticipants([]);
    setDetailParticipantsPage(1);
    searchParams.delete('uid');
    setSearchParams(searchParams);
  };

  const goToProfile = (person, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    if (person?.username) {
      handleCloseModal();
      navigate(`/u/${person.username}`);
    }
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

  const fetchParticipants = (page) => {
    if (!eventDetails) return;
    setLoadingParticipants(true);

    _service({
      url: `events/participants?eventUid=${eventDetails.uid}&page=${page}&pageSize=10`,
      success: ({ json }) => {
        let newList = [];
        if (Array.isArray(json?.data)) {
          newList = json.data;
        } else if (Array.isArray(json)) {
          newList = json;
        } else if (json?.result && Array.isArray(json.result)) {
          newList = json.result;
        }
        
        setDetailParticipants(newList);
        setDetailParticipantsPage(page);
        setLoadingParticipants(false);
      },
      fail: () => {
        notification.error({ message: 'Erro ao carregar participantes.' });
        setLoadingParticipants(false);
      },
    });
  };

  const processFormPayload = (values, currentEvent) => {
    const formData = new FormData();
    
    if (values.name) formData.append('name', values.name);
    if (values.description) formData.append('description', values.description);
    if (values.location) formData.append('location', values.location);
    if (values.city) formData.append('city', values.city?.value || values.city);
    if (values.startDate) formData.append('startDate', values.startDate.format('YYYY-MM-DD HH:mm:ss'));
    if (values.endDate) formData.append('endDate', values.endDate.format('YYYY-MM-DD HH:mm:ss'));

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
      endDate: event.endDate ? dayjs(event.endDate) : null,
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

        notification.success({
          message: event.isGoing ? 'Presença cancelada' : 'Presença confirmada',
          description: event.isGoing
            ? 'Presença no evento cancelada.'
            : 'A sua presença neste evento foi confirmada.',
        });

        fetchList({ term: pagination.term, location: pagination.location, page: pagination.current });
      },
      fail: () => {
        setActionLoadingUid(null);
        notification.error({ message: 'Erro ao atualizar presença.' });
      },
    });
  };

  const formatFullDate = (startString, endString) => {
    if (!startString) return '';
    const startObj = dayjs(startString);
    const startText = startObj.format('dddd, DD [de] MMMM [de] YYYY [às] HH:mm');
    
    if (!endString) return startText;
    
    const endObj = dayjs(endString);
    if (startObj.isSame(endObj, 'day')) {
      return `${startText} - ${endObj.format('HH:mm')}`;
    }
    return `${startText} até ${endObj.format('dddd, DD [de] MMMM [de] YYYY [às] HH:mm')}`;
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  return (
    <div className="events-page">
      <div className="events-page__header">
        <ListHeaderFilters
          title="Eventos"
          description="Encontre eventos e atividades perto de si."
          createButton={
            canCreateEvent
              ? {
                icon: <PlusOutlined />,
                text: 'Criar Evento',
                onClick: () => {
                  setCityOptions([]);
                  form.resetFields();
                  setCreateModalVisible(true);
                },
              }
              : null
          }
          onSearch={handleSearch}
          onLocationChange={handleLocationChange}
          onLocationClear={handleLocationClear}
          onSearchClear={handleSearchClear}
        />
      </div>

      <Tabs
        activeKey={currentTab}
        className="events-page__tabs"
        onChange={(key) => {
          setCurrentTab(key);
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
                Participação
              </span>
            ),
          },
          {
            key: "history",
            label: (
              <span>
                <HistoryOutlined style={{ marginRight: 8 }} />
                Histórico
              </span>
            ),
          },
        ]}
      />

      <div className="events-page__results-count">
        <Text type="secondary">
          {totalCount} {totalCount === 1 ? 'Evento Encontrado' : 'Eventos Encontrados'}
          {currentTab === 'going' ? ' Que Vou Participar' : currentTab === 'history' ? ' Passados' : ''}
        </Text>
      </div>

      {loading && (
        <div className="events-page__loading"><Spin size="large" /></div>
      )}

      {!loading && (
        <div className="events-page__grid">
          {events.map((ev) => (
            <EventCard
              key={ev.uid}
              event={ev}
              onClick={handleOpenModal}
              onEdit={openEditModal}
              onDelete={confirmDeleteEvent}
              onToggleGoing={toggleGoing}
              onPersonClick={goToProfile}
              goingLoading={actionLoadingUid === ev.uid}
            />
          ))}
        </div>
      )}

      <div className="events-page__footer">
        <Pagination total={totalCount} current={pagination.current} pageSize={pagination.size} onChange={handlePaginationChange} />
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
            type='primary'
            key="rsvp" 
            className={`events-page__details-rsvp-btn ${eventDetails?.isGoing ? 'events-page__details-rsvp-btn--going' : ''}`}
            loading={actionLoadingUid === eventDetails?.uid} 
            onClick={() => toggleGoing(eventDetails)}
            disabled={currentTab === 'history'}
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
                <div 
                  className="events-page__view-detail-item"
                  onClick={(e) => goToProfile(eventDetails.host, e)}
                  style={{ cursor: 'pointer' }}
                >
                  <UserAvatar person={eventDetails.host} size="small" />
                  <Text type="secondary">
                    Organizado por <strong style={{ color: '#000' }}>{eventDetails.host?.name}</strong>
                  </Text>
                </div>

                <div className="events-page__view-detail-item">
                  <CalendarOutlined />
                  <Text type="secondary">{formatFullDate(eventDetails.startDate, eventDetails.endDate)}</Text>
                </div>

                <div className="events-page__view-detail-item">
                  <EnvironmentOutlined />
                  <Text type="secondary">
                    {[eventDetails.city?.name, eventDetails.state?.name].filter(Boolean).join(', ') || 'Sem cidade definida'}
                    {eventDetails.location && (
                      <>
                        {' • '}
                        {eventDetails.location.startsWith('http') ? (
                          <a href={eventDetails.location} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                            {eventDetails.location}
                          </a>
                        ) : (
                          eventDetails.location
                        )}
                      </>
                    )}
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
                        {loadingParticipants ? (
                          <div className="events-page__loading"><Spin /></div>
                        ) : detailParticipants && detailParticipants.length > 0 ? (
                          <>
                            <div className="events-page__details-participants-grid">
                              {detailParticipants.map((p, idx) => (
                                <div 
                                  key={p.uid || idx} 
                                  className="events-page__details-participants-item"
                                  onClick={(e) => goToProfile(p, e)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <UserAvatar person={p} size="default" />
                                  <Text className="events-page__details-participants-name" ellipsis>{p.name}</Text>
                                </div>
                              ))}
                            </div>
                            
                            {eventDetails.participantsCount > 10 && (
                              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                                <Pagination 
                                  current={detailParticipantsPage} 
                                  total={eventDetails.participantsCount} 
                                  pageSize={10} 
                                  onChange={fetchParticipants} 
                                  showSizeChanger={false} 
                                />
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="startDate" label="Início" rules={[{ required: true, message: 'Selecione o início!' }]}>
              <DatePicker showTime format="YYYY-MM-DD HH:mm" className="events-page__form-full-width" placeholder="Data e hora" />
            </Form.Item>
            <Form.Item name="endDate" label="Fim">
              <DatePicker showTime format="YYYY-MM-DD HH:mm" className="events-page__form-full-width" placeholder="Data e hora (Opcional)" />
            </Form.Item>
          </div>

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="startDate" label="Início" rules={[{ required: true, message: 'Selecione o início!' }]}>
              <DatePicker showTime format="YYYY-MM-DD HH:mm" className="events-page__form-full-width" placeholder="Data e hora" />
            </Form.Item>
            <Form.Item name="endDate" label="Fim">
              <DatePicker showTime format="YYYY-MM-DD HH:mm" className="events-page__form-full-width" placeholder="Data e hora (Opcional)" />
            </Form.Item>
          </div>

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
    </div>
  );
}

export default Events;