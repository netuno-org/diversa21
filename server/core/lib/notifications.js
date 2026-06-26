import { _db, _group, _user, _val, _ws } from "@netuno/server-types";

export default {
  isNotificationBlocked: (peopleId, notificationTypeId) => {
    return _db.queryFirst(`
      SELECT *
      FROM notification_opt_out
      WHERE people_id = ?::int
      AND type_id = ?::int
    `, peopleId, notificationTypeId)
  },

  sendNotification: (title, content, originatorId, recipientId, extra, notificationTypeId) => {
    const currentTimestamp = _db.timestamp();
    _db.insert("notification",
      _val.map()
        .set("title", title)
        .set("content", content)
        .set("originator_id", originatorId)
        .set("recipient_id", recipientId) 
        .set("sent_at", currentTimestamp)
        .set("read_at", null)
        .set("extra", "")
        .set("type_id", notificationTypeId)
    );
  }
}
