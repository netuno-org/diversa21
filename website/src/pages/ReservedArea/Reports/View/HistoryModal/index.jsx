import { Empty, Modal, Tag, Timeline, Typography } from "antd";

import TimeAgo from "../../../../../components/TimeAgo";

import "./index.less";

const { Text } = Typography;

function HistoryModal({ open, history, reportStatus, onClose }) {
  return (
    <Modal
      title="Histórico de análises"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      className="report-history-modal"
    >
      <div className="report-history-modal__body">
        {history.length === 0 ? (
          <Empty description="Ainda não há histórico de análises." />
        ) : (
          <Timeline
            items={history.map((entry) => {
              const isRejected = entry.statusCode === "rejected";
              const entryStatus = reportStatus[entry.statusCode];
              return {
                key: entry.uid,
                color: isRejected ? "red" : "green",
                children: (
                  <div className="report-history-modal__item">
                    <Tag
                      icon={entryStatus?.icon}
                      color={entryStatus?.color}
                      variant="filled"
                      className="report-history-modal__status"
                    >
                      {entryStatus?.label}
                    </Tag>
                    <div className="report-history-modal__item-header">
                      {entry.people?.name && (
                        <Text type="secondary" className="report-history-modal__person">
                          {entry.people.name}
                        </Text>
                      )}
                      <Text type="secondary">
                        <TimeAgo sentAt={entry.moment} />
                      </Text>
                    </div>
                    {entry.notes && (
                      <div
                        className={`report-history-modal__notes report-history-modal__notes--${isRejected ? "rejected" : "resolved"}`}
                      >
                        {entry.notes}
                      </div>
                    )}
                  </div>
                ),
              };
            })}
          />
        )}
      </div>
    </Modal>
  );
}

export default HistoryModal;
