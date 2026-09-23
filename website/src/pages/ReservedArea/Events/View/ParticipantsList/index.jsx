import { Typography, Spin, Pagination, Empty } from 'antd';

import { UserAvatar } from '../../../../../components/EventCard';

import './index.less';

const { Text } = Typography;

function ParticipantsList({
  participants = [],
  total = 0,
  page = 1,
  pageSize = 10,
  loading = false,
  onPageChange,
  onSelect,
  emptyDescription = 'Ainda ninguém confirmou presença. Seja o primeiro!',
}) {
  if (loading) {
    return (
      <div className="participants-list__loading"><Spin /></div>
    );
  }

  if (participants.length === 0) {
    return <Empty description={emptyDescription} />;
  }

  return (
    <>
      <div className="participants-list__grid">
        {participants.map((value, i) => (
          <div
            key={value.uid || i}
            className="participants-list__item"
            onClick={(e) => onSelect?.(value, e)}
          >
            <UserAvatar person={value} size="default" shape="square" />
            <Text className="participants-list__name" ellipsis>{value.name}</Text>
          </div>
        ))}
      </div>

      {total > pageSize && (
        <div className="participants-list__pagination">
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            onChange={onPageChange}
            showSizeChanger={false}
          />
        </div>
      )}
    </>
  );
}

export default ParticipantsList;
