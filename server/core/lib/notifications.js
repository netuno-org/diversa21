import { _db, _group, _user, _val, _ws } from "@netuno/server-types";

export const notificationTypes = {
  MY_POST_COMMENT: "my-post-comment",
  MY_POST_LIKE: "my-post-like",
  FRIEND_REQUEST: "friend-request",
  FRIEND_REQUEST_ACCEPTED: "friend-request-accepted",
};

export const notificationMessages = {
  FRIEND_REQUEST: "Quer ser seu amigo.",
  FRIEND_REQUEST_ACCEPTED: "Aceitou seu pedido de amizade.",
  MY_POST_COMMENT: "Comentou em um post seu.",
};

export default {
  getNotificationTypeId: (code) => {
    return _db.queryFirst(`
        SELECT id
        FROM notification_type
        WHERE code = '${code}'
    `).getInt("id");
  },

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
        .set("extra", extra)
        .set("type_id", notificationTypeId)
    );
  }
}
