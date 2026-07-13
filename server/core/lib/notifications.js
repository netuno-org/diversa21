import { _db, _group, _user, _val, _ws } from "@netuno/server-types";

export const notificationTypes = {
  MY_POST_COMMENT: "my-post-comment",
  MY_POST_LIKE: "my-post-like",
  FRIEND_REQUEST: "friend-request",
  FRIEND_REQUEST_ACCEPTED: "friend-request-accepted",
  MESSAGE: "message",
};

export const notificationMessages = {
  FRIEND_REQUEST: "Quer ser seu amigo.",
  FRIEND_REQUEST_ACCEPTED: "Aceitou seu pedido de amizade.",
  MY_POST_COMMENT: "Comentou seu post.",
  MY_POST_LIKE: "Deu um like em seu post.",
  MESSAGE: "Enviou uma mensagem",
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
  },

  // Uma notificação de mensagem por pessoa: atualiza se já existir
  sendOrUpdateMessageNotification: (title, content, originatorId, recipientId) => {
    const typeId = _db.queryFirst(`
        SELECT id
        FROM notification_type
        WHERE code = '${notificationTypes.MESSAGE}'
    `).getInt("id");
    const currentTimestamp = _db.timestamp();

    const existing = _db.queryFirst(`
      SELECT id, uid
      FROM notification
      WHERE originator_id = ?::int
        AND recipient_id = ?::int
        AND type_id = ?::int
    `, originatorId, recipientId, typeId);

    if (existing) {
      _db.execute(`
        UPDATE notification
        SET title = ?::varchar,
            content = ?::varchar,
            sent_at = ?::timestamp,
            read_at = NULL
        WHERE id = ?::int
      `, title, content, currentTimestamp, existing.getInt("id"));

      return _val.map()
        .set("uid", existing.getString("uid"))
        .set("sent_at", currentTimestamp);
    }

    const notificationId = _db.insert("notification",
      _val.map()
        .set("title", title)
        .set("content", content)
        .set("originator_id", originatorId)
        .set("recipient_id", recipientId)
        .set("sent_at", currentTimestamp)
        .set("read_at", null)
        .set("extra", "")
        .set("type_id", typeId)
    );

    const created = _db.get("notification", notificationId);
    return _val.map()
      .set("uid", created.getString("uid"))
      .set("sent_at", currentTimestamp);
  },

  clearMessageNotification: (originatorId, recipientId) => {
    const typeId = _db.queryFirst(`
        SELECT id
        FROM notification_type
        WHERE code = '${notificationTypes.MESSAGE}'
    `).getInt("id");
    return _db.execute(`
      DELETE FROM notification
      WHERE originator_id = ?::int
        AND recipient_id = ?::int
        AND type_id = ?::int
    `, originatorId, recipientId, typeId);
  },

  clearAllMessageNotifications: (recipientId) => {
    const typeId = _db.queryFirst(`
        SELECT id
        FROM notification_type
        WHERE code = '${notificationTypes.MESSAGE}'
    `).getInt("id");
    return _db.execute(`
      DELETE FROM notification
      WHERE recipient_id = ?::int
        AND type_id = ?::int
    `, recipientId, typeId);
  }
}
