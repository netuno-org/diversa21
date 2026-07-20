import { _db, _group, _user, _val, _ws, _log } from "@netuno/server-types";

export const notificationTypes = {
  MY_POST_COMMENT: "my-post-comment",
  MY_POST_LIKE: "my-post-like",
  FRIEND_REQUEST: "friend-request",
  FRIEND_REQUEST_ACCEPTED: "friend-request-accepted",
  MESSAGE: "message",
  FRIEND_POST: "friend-post",
  FRIEND_COMMENT: "friend-comment",
  FRIEND_LIKE: "friend-like",
  INSTITUTION_POST: "institution-post",
  INSTITUTION_COMMENT: "institution-comment",
  INSTITUTION_LIKE: "institution-like"
};

export const notificationMessages = {
  FRIEND_REQUEST: "Quer ser seu amigo.",
  FRIEND_REQUEST_ACCEPTED: "Aceitou seu pedido de amizade.",
  MY_POST_COMMENT: "Comentou seu post.",
  MY_POST_LIKE: "Deu um like em seu post.",
  MESSAGE: "Enviou uma mensagem",
  FRIEND_POST: "publicou um novo post.",
  FRIEND_COMMENT: "comentou um post.",
  FRIEND_LIKE: "gostou de um post.",
  INSTITUTION_POST: "publicou um post na instituição",
  INSTITUTION_COMMENT: "comentou um post na instituição",
  INSTITUTION_LIKE: "gostou de um post na instituição"
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
  },

  getFriends: (peopleId) => {
    return _db.query(`
      SELECT p.id, p.uid, netuno_user.user AS username
      FROM friend f
      INNER JOIN people p ON p.id = (CASE WHEN f.people_id = ?::int THEN f.friend_id ELSE f.people_id END)
      INNER JOIN netuno_user ON p.people_user_id = netuno_user.id
      WHERE (f.people_id = ?::int OR f.friend_id = ?::int)
        AND f.accepted_at IS NOT NULL
    `, peopleId, peopleId, peopleId);
  },

  getInstitutionMembers: (institutionId, excludePeopleId) => {
    return _db.query(`
      SELECT p.id, p.uid, netuno_user.user AS username
      FROM people p
      INNER JOIN netuno_user ON p.people_user_id = netuno_user.id
      WHERE p.institution_id = ?::int
        AND p.id != ?::int
    `, institutionId, excludePeopleId);
  },

  notifyRecipients: (recipientList, originatorId, originatorUid, originatorUsername, typeCode, title, content, extraMap) => {
    const typeId = _db.queryFirst(`
      SELECT id
      FROM notification_type
      WHERE code = '${typeCode}'
    `).getInt("id");

    for (const dbRecipient of recipientList) {
      const recipientId = dbRecipient.getInt("id");
      const currentTimestamp = _db.timestamp();
      
      let extraJson = "";
      if (extraMap) {
        if (typeof extraMap.toJSON === "function") {
          extraJson = extraMap.toJSON();
        } else {
          extraJson = JSON.stringify(extraMap);
        }
      }

      const notificationId = _db.insert("notification",
        _val.map()
          .set("title", title)
          .set("content", content)
          .set("originator_id", originatorId)
          .set("recipient_id", recipientId)
          .set("sent_at", currentTimestamp)
          .set("read_at", null)
          .set("extra", extraJson)
          .set("type_id", typeId)
      );

      const dbCreated = _db.get("notification", notificationId);

      const dbSessions = _db.form("people_ws_session")
        .where(_db.where("people_id").equal(recipientId))
        .all();

      const wsMessage = _val.map()
        .set("method", "POST")
        .set("service", "notification/new")
        .set("data", _val.map().set("with", originatorUid))
        .set("content", _val.map()
          .set("uid", dbCreated.getString("uid"))
          .set("title", title)
          .set("content", content)
          .set("originator", _val.map()
            .set("uid", originatorUid)
            .set("username", originatorUsername)
          )
          .set("recipient", _val.map()
            .set("uid", dbRecipient.getString("uid"))
          )
          .set("sent_at", dbCreated.getString("sent_at"))
          .set("read_at", null)
          .set("extra", _val.map().set("postUid", extraMap.postUid))
          .set("type", typeCode)
        );

      for (const dbSession of dbSessions) {
        _ws.sendAsService(dbSession.getString("session_id"), wsMessage);
      }
    }
  }
}
