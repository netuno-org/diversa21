import { useState, Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import _service from '@netuno/service-client';

import { Card, Typography, Button, Tabs, Divider, Space, Tag, Empty, notification } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, TeamOutlined, StarOutlined, CheckOutlined } from '@ant-design/icons';

import { UserAvatar, isPastEvent } from '../../../../components/EventCard';
import ParticipantsList from './ParticipantsList';

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
        <Title level={3} className="event-view__name">{event.name}</Title>

        <Space size="small" className="event-view__details" wrap>
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
        <div className="event-view__footer">
          <Button
            type={isGoing ? "dashed" : "default"}
            style={{ borderColor: '#8A6AA2', color: '#8A6AA2' }}
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
                  <TeamOutlined style={{ fontSize: 18 }} />
                  <span>
                    Participantes{' '}
                    <Tag className="event-view__participants-tag" variant="solid">
                      {participantsCount}
                    </Tag>
                  </span>
                </Space>
              ),
              children: (
                <div className="event-view__tabs-content">
                  <ParticipantsList
                    participants={participants}
                    total={participantsCount}
                    page={participantsPage}
                    loading={loadingParticipants}
                    onPageChange={fetchParticipants}
                    onSelect={goToProfile}
                  />
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