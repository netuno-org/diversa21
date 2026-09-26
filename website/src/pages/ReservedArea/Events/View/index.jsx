import { useState, Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import _service from '@netuno/service-client';

import { Card, Typography, Spin, Pagination, Button, Tabs, Divider, Space, Tag, Empty, notification } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, TeamOutlined, StarOutlined, CheckOutlined } from '@ant-design/icons';

import { UserAvatar, isPastEvent } from '../../../../components/EventCard';
import ContentActions from '../../../../components/ContentActions';

import './index.less';

import dayjs from 'dayjs';

const { Text, Title } = Typography;

function EventView({ uid }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const event = state?.event?.uid === uid ? state.event : null;

  const [isGoing, setIsGoing] = useState(event?.isGoing);
  const [participantsCount, setParticipantsCount] = useState(event?.participantsCount || 0);
  const [participants, setParticipants] = useState(event?.participantsPreview || []);
  const [participantsPage, setParticipantsPage] = useState(1);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!event) {
    return (
      <div className="event-view">
        <div className="event-view__empty">
          <Empty description="Abra o evento a partir de uma listagem de eventos.">
            <Button type="primary" onClick={() => navigate('/events')}>
              Ver eventos
            </Button>
          </Empty>
        </div>
      </div>
    );
  }

  const isPast = isPastEvent(event);

  const getCoverUrl = () => {
    const rawCover = event.cover_image || event.coverImage;
    if (!rawCover) return null;

    const cover = String(rawCover);
    if (cover.startsWith('http') || cover.startsWith('data:')) {
      return cover;
    }

    return _service.url(`/asset?uid=${event.uid}&type=cover_image&entity=event`);
  };

  const formatFullDate = (startString, endString) => {
    if (!startString) return '';

    const start = dayjs(startString);
    const startText = start.format('dddd, DD [de] MMMM [de] YYYY [às] HH:mm');

    if (!endString) return startText;

    const end = dayjs(endString);
    if (start.isSame(end, 'day')) {
      return `${startText} - ${end.format('HH:mm')}`;
    }
    return `${startText} até ${end.format('dddd, DD [de] MMMM [de] YYYY [às] HH:mm')}`;
  };

  const goToProfile = (person, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (person?.username) {
      navigate(`/u/${person.username}`);
    }
  };

  const fetchParticipants = (page) => {
    setLoadingParticipants(true);
    _service({
      url: `events/participants?eventUid=${event.uid}&page=${page}&pageSize=10`,
      success: ({ json }) => {
        setParticipants(Array.isArray(json?.data) ? json.data : []);
        setParticipantsPage(page);
        setLoadingParticipants(false);
      },
      fail: () => {
        notification.error({ message: 'Erro ao carregar participantes.' });
        setLoadingParticipants(false);
      },
    });
  };

  const toggleGoing = () => {
    setActionLoading(true);
    const method = isGoing ? 'DELETE' : 'POST';
    _service({
      url: 'events/attendance',
      method,
      data: method === 'POST' ? { eventUid: event.uid, status: 'going' } : { eventUid: event.uid },
      success: () => {
        const leaving = isGoing;
        setParticipantsCount(leaving ? participantsCount - 1 : participantsCount + 1);
        setIsGoing(!leaving);
        setActionLoading(false);
        notification.success({
          message: leaving ? 'Presença cancelada' : 'Presença confirmada',
          description: leaving
            ? 'Presença no evento cancelada.'
            : 'A sua presença neste evento foi confirmada.',
        });
      },
      fail: () => {
        setActionLoading(false);
        notification.error({ message: 'Erro ao atualizar presença.' });
      },
    });
  };

  const handleDeleteEvent = () => {
    _service({
      url: 'events',
      method: 'DELETE',
      data: { eventUid: event.uid },
      success: () => {
        notification.success({ message: 'Evento eliminado com sucesso!' });
        navigate('/events');
      },
      fail: () => {
        notification.error({ message: 'Erro ao eliminar o evento.' });
      },
    });
  };

  const coverUrl = getCoverUrl();

  return (
    <section className="event-view">
      <div className="event-view__cover">
        <div className="event-view__cover-fallback">EVENTO</div>
        {coverUrl && (
          <img
            src={coverUrl}
            alt="Capa do Evento"
            className="event-view__cover-image"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
      </div>

      <Card className="event-view__card" bordered={false}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Title level={3} className="event-view__name" style={{ margin: 0 }}>{event.name}</Title>
          <ContentActions
            entityType="event"
            entityUid={event.uid}
            canViewDeletePostButton={event.canEdit}
            canViewEditButton={event.canEdit}
            canViewReportButton={false}
            onDeletePost={handleDeleteEvent}
            onEdit={() => notification.info({ message: 'Podes editar os dados do evento na página de listagem dos eventos.' })}
          />
        </div>

        <Space size="small" className="event-view__details" wrap style={{ marginTop: 16 }}>
          <div
            className="event-view__detail-item event-view__detail-item--clickable"
            onClick={(e) => goToProfile(event.host, e)}
          >
            <UserAvatar person={event.host} size="small" shape="square" />
            <Text type="secondary">
              Organizado por <strong className="event-view__host-name">{event.host?.name}</strong>
            </Text>
          </div>

          <div className="event-view__detail-item">
            <CalendarOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
            <Text type="secondary">{formatFullDate(event.startDate, event.endDate)}</Text>
          </div>

          <div className="event-view__detail-item">
            <EnvironmentOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
            <Text type="secondary">
              {[event.city?.name, event.state?.name].filter(Boolean).join(', ') || 'Sem cidade definida'}
              {event.location && (
                <>
                  {' • '}
                  {event.location.startsWith('http') ? (
                    <a href={event.location} target="_blank" rel="noreferrer">
                      {event.location}
                    </a>
                  ) : (
                    event.location
                  )}
                </>
              )}
            </Text>
          </div>
        </Space>
        <Divider style={{ margin: 10 }} />
        <div className="event-view__about">
          <Title style={{ margin: 0 }} level={4}>Sobre</Title>
          <p>
            {(event.description || 'Este evento ainda não adicionou uma descrição.')
              .split('\n')
              .map((line, index, array) => (
                <Fragment key={index}>
                  {line}
                  {index < array.length - 1 && <br />}
                </Fragment>
              ))}
          </p>
        </div>

        <div className="event-view__footer" style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button
            className={`event-view__rsvp-btn ${isGoing ? 'event-view__rsvp-btn--going' : ''}`}
            loading={actionLoading}
            onClick={toggleGoing}
            disabled={isPast}
            icon={isGoing ? <CheckOutlined /> : <StarOutlined />}
          >
            {isGoing ? 'Presença Confirmada' : 'Participar'}
          </Button>
        </div>
      </Card>
      
      <div className="event-view__tabs">
        <Tabs
          defaultActiveKey="participants"
          size="large"
          items={[
            {
              key: 'participants',
              label: (
                <Space>
                  <TeamOutlined style={{ fontSize: 18, color: 'rgba(0, 0, 0, 0.45)' }} />
                  <span>
                    Participantes{' '}
                    <Tag className="event-view__participants-tag" variant="solid" color="#8A6AA2" style={{ borderRadius: '16px' }}>
                      {participantsCount}
                    </Tag>
                  </span>
                  {isGoing && (
                    <Tag color="success" style={{ borderRadius: '16px', margin: 0, border: 'none', background: '#f6ffed' }}>
                      <CheckOutlined /> Presença confirmada
                    </Tag>
                  )}
                </Space>
              ),
              children: (
                <div className="event-view__tabs-content">
                  {loadingParticipants ? (
                    <div className="event-view__loading"><Spin /></div>
                  ) : participants.length > 0 ? (
                    <>
                      <div className="event-view__participants-grid">
                        {participants.map((p, idx) => (
                          <div
                            key={p.uid || idx}
                            className="event-view__participants-item"
                            onClick={(e) => goToProfile(p, e)}
                          >
                            <UserAvatar person={p} size="default" shape="square" />
                            <Text className="event-view__participants-name" ellipsis>{p.name}</Text>
                          </div>
                        ))}
                      </div>

                      {participantsCount > 10 && (
                        <div className="event-view__participants-pagination">
                          <Pagination
                            current={participantsPage}
                            total={participantsCount}
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
    </section>
  );
}

export default EventView;