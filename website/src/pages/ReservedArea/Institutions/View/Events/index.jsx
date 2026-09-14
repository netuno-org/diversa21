import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Pagination, Empty, notification } from 'antd';
import _service from '@netuno/service-client';
import dayjs from 'dayjs';

import useFilteredPaginatedList from '../../../../../common/useFilteredPaginatedList.js';
import EventCard from '../../../../../components/EventCard';

import './index.less';

function InstitutionEvents({ institutionUid }) {
  const navigate = useNavigate();
  const [actionLoadingUid, setActionLoadingUid] = useState(null);

  const requestData = useMemo(
    () => ({ institutionUid, tab: 'all' }),
    [institutionUid]
  );

  const { items: events, loading, pagination, handlePaginationChange, fetchList } = useFilteredPaginatedList({
    serviceUrl: 'events/list',
    requestData,
  });

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

  if (loading) {
    return (
      <div className="institution-events__loading">
        <Spin size="large" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="institution-events__empty">
        <Empty description="Esta instituição ainda não criou eventos." />
      </div>
    );
  }

  return (
    <>
      <div className="institution-events__list">
        {events.map((event) => {
          const isPast = event.startDate && dayjs(event.startDate).isBefore(dayjs(), 'day');

          return (
            <EventCard
              key={event.uid}
              event={event}
              onClick={() => navigate(`/events/${event.uid}`, { state: { event } })}
              onToggleGoing={toggleGoing}
              goingLoading={actionLoadingUid === event.uid}
              rsvpDisabled={isPast}
              showHost={false}
              showParticipantsPreview={false}
            />
          );
        })}
      </div>

      {pagination.total > pagination.size && (
        <Pagination
          className="institution-events__pagination"
          align="center"
          total={pagination.total}
          current={pagination.current}
          pageSize={pagination.size}
          onChange={handlePaginationChange}
        />
      )}
    </>
  );
}

export default InstitutionEvents;
