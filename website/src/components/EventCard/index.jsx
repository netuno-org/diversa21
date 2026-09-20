import { useState } from 'react';
import { Card, Typography, Button, Dropdown, Avatar, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, StarOutlined, CheckOutlined, MoreOutlined, CalendarOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';
import _service from '@netuno/service-client';
import dayjs from 'dayjs';
import 'dayjs/locale/pt';

import './index.less';

dayjs.locale('pt');

const { Text, Title } = Typography;

export const getCoverUrl = (event) => {
  if (!event?.uid) return null;

  const rawCoverValue = event.cover_image || event.coverImage;
  if (!rawCoverValue) return null;

  const coverImageStr = String(rawCoverValue);

  if (coverImageStr.startsWith('http') || coverImageStr.startsWith('data:')) {
    return coverImageStr;
  }

  return _service.url(`/asset?uid=${event.uid}&type=cover_image&entity=event`);
};

export const isPastEvent = (event) => Boolean(
  event?.startDate && dayjs(event.startDate).isBefore(dayjs(), 'day')
);

export const formatEventDate = (startString, endString) => {
  if (!startString) return '';
  const start = dayjs(startString);
  const isToday = start.isSame(dayjs(), 'day');

  const formatDay = (d) => {
    const dayStr = d.format('ddd').replace('.', '');
    return `${dayStr.charAt(0).toUpperCase() + dayStr.slice(1)}, ${d.format('DD/MM')}`;
  };

  const startTime = start.format('HH:mm');
  const startText = isToday ? 'Hoje' : formatDay(start);
  const startFormatted = `${startText} às ${startTime}`;

  if (!endString) return startFormatted;

  const end = dayjs(endString);
  const endTime = end.format('HH:mm');

  if (start.isSame(end, 'day')) {
    return `${startFormatted} - ${endTime}`;
  }

  return `${startFormatted} - ${formatDay(end)} às ${endTime}`;
};

export const UserAvatar = ({ person, size, shape, className = '', onClick }) => {
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
        shape={shape}
        src={src}
        className={`event-card__avatar ${className}`.trim()}
        onClick={onClick}
        style={onClick ? { cursor: 'pointer' } : undefined}
        onError={() => {
          if (!failed) setFailed(true);
          return true;
        }}
      />
    </Tooltip>
  );
};

function EventCard({
  event,
  onClick,
  onEdit,
  onDelete,
  onToggleGoing,
  onPersonClick,
  goingLoading = false,
  rsvpDisabled = false,
  showRsvp = true,
  showHost = true,
  showParticipantsPreview = true,
  className = '',
}) {
  if (!event) return null;

  const cityText = event.city?.name
    ? `${event.city.name}${event.state?.name ? `, ${event.state.name}` : ''}`
    : null;
  const isLocationUrl = event.location?.startsWith('http');
  const coverUrl = getCoverUrl(event);
  const isPast = isPastEvent(event);

  const menuItems = [
    onEdit && {
      key: 'edit',
      label: 'Editar',
      icon: <EditOutlined />,
      onClick: (e) => {
        e.domEvent.stopPropagation();
        e.domEvent.preventDefault();
        onEdit(event);
      },
    },
    onDelete && {
      key: 'delete',
      label: 'Eliminar',
      danger: true,
      icon: <DeleteOutlined />,
      onClick: (e) => {
        e.domEvent.stopPropagation();
        e.domEvent.preventDefault();
        onDelete(event);
      },
    },
  ].filter(Boolean);

  const showMenu = event.canEdit && menuItems.length > 0;

  const handlePersonClick = (person, e) => {
    if (!onPersonClick) return;
    onPersonClick(person, e);
  };

  return (
    <Card
      bordered={false}
      hoverable={Boolean(onClick)}
      onClick={onClick ? () => onClick(event) : undefined}
      className={`event-card${isPast ? ' event-card--past' : ''}${className ? ` ${className}` : ''}`}
      cover={
        <div className="event-card__cover">
          <div className="event-card__cover-fallback">
            <Title level={3} className="event-card__placeholder">EVENTO</Title>
          </div>

          {coverUrl && (
            <img
              src={coverUrl}
              alt={event.name}
              className="event-card__cover-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}

          {isPast && (
            <span className="event-card__past-badge">Realizado</span>
          )}

          {showMenu && (
            <div className="event-card__cover-actions" onClick={(e) => e.stopPropagation()}>
              <Dropdown
                placement="bottomRight"
                menu={{ items: menuItems }}
                trigger={['click']}
              >
                <Button
                  shape="circle"
                  size="small"
                  icon={<MoreOutlined />}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
              </Dropdown>
            </div>
          )}
        </div>
      }
    >
      <div className="event-card__content">
        {showHost && (
          <div
            className={`event-card__host${onPersonClick ? ' event-card__host--clickable' : ''}`}
            onClick={onPersonClick ? (e) => handlePersonClick(event.host, e) : undefined}
          >
            <UserAvatar person={event.host} size="small" />
            <Text type="secondary" className="event-card__host-name">{event.host?.name}</Text>
          </div>
        )}

        <Title level={5} className="event-card__title" ellipsis={{ rows: 2 }}>
          {event.name}
        </Title>

        <div className="event-card__date">
          <CalendarOutlined />
          <Text className="event-card__date-text">
            {formatEventDate(event.startDate, event.endDate)}
          </Text>
        </div>

        <div className="event-card__location">
          <EnvironmentOutlined />
          <Text type="secondary" ellipsis>
            {isLocationUrl ? (
              <a href={event.location} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                {event.location}
              </a>
            ) : (
              event.location
            )}
            {event.location && cityText && ' - '}
            {cityText}
            {!event.location && !cityText && 'Localização não especificada'}
          </Text>
        </div>

        <div className="event-card__participants">
          <TeamOutlined />
          <Text type="secondary" className="event-card__participants-text">
            {event.participantsCount || 0} {event.participantsCount === 1 ? 'participante' : 'participantes'}
          </Text>
          {showParticipantsPreview && event.participantsPreview?.length > 0 && (
            <>
              <Text type="secondary" className="event-card__participants-dot">·</Text>
              <Avatar.Group size="small">
                {event.participantsPreview.slice(0, 3).map((p, idx) => (
                  <UserAvatar
                    key={p.uid || idx}
                    person={p}
                    size="small"
                    className="event-card__avatar--bordered"
                    onClick={onPersonClick ? (e) => handlePersonClick(p, e) : undefined}
                  />
                ))}
                {event.participantsCount > 3 && (
                  <Avatar size="small" className="event-card__avatar-more">
                    +{event.participantsCount - 3}
                  </Avatar>
                )}
              </Avatar.Group>
            </>
          )}
        </div>

        {showRsvp && (
          <Button
            className="event-card__rsvp-btn"
            type={event.isGoing ? "dashed" : "default"}
            loading={goingLoading}
            onClick={(e) => onToggleGoing?.(event, e)}
            disabled={rsvpDisabled || isPast || !onToggleGoing}
            block
            icon={event.isGoing ? <CheckOutlined /> : <StarOutlined />}
          >
            {event.isGoing ? 'Presença Confirmada' : 'Participar'}
          </Button>
        )}
      </div>
    </Card>
  );
}

export default EventCard;