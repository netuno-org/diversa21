import { _req, _db, _val, _exec } from "@netuno/server-types";

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";
import notifications, { notificationTypes, notificationMessages } from "#core/lib/notifications.js";

const uid = _req.getUID("uid");

const dbReply = _db.queryFirst(`
    SELECT
      r.id,
      r.uid,
      r.likes,
      r.people_id,
      t.uid AS "topic_uid",
      c.uid AS "category_uid",
      p.uid AS "people_uid"
    FROM forum_reply r
    INNER JOIN forum_topic t ON r.topic_id = t.id
    INNER JOIN forum_category c ON t.forum_category_id = c.id
    INNER JOIN people p ON r.people_id = p.id
    WHERE r.uid = ?::uuid
      AND r.active = true
`, uid);

if (!dbReply) {
  response.stopWithForumReplyNotFound();
}

const loggedUser = people.getLogged();

if (!loggedUser) {
  response.stopWithUserNotFound();
}

const loggedUserId = loggedUser.getInt("id");
const loggedUserUid = loggedUser.getUID("uid");
const replyOwnerId = dbReply.getInt("people_id");

const dbLike = _db.queryFirst(`
    SELECT id
    FROM forum_reply_like
    WHERE forum_reply_id = ?::int
      AND people_id = ?::int
`, dbReply.getInt("id"), loggedUserId);

if (dbLike) {
  response.successWithData(
    _val.map()
      .set("liked", true)
      .set("likes", dbReply.getInt("likes", 0))
  );
  _exec.stop();
}

const likeId = _db.insert(
  "forum_reply_like",
  _val.map()
    .set("forum_reply_id", dbReply.getInt("id"))
    .set("people_id", loggedUserId)
    .set("moment", _db.timestamp())
);

if (!likeId) {
  response.stopWithLikeNotCreated();
}

const likes = dbReply.getInt("likes", 0) + 1;

_db.update(
  "forum_reply",
  dbReply.getInt("id"),
  _val.map()
    .set("likes", likes)
);

if (loggedUserId !== replyOwnerId) {
  _db.insertIfNotExists(
    "notification_type",
    _val.map()
      .set("uid", "a8d4e1b6-3c7f-4a92-9e5d-6b0c8f2a4e17")
      .set("name", "Curtiu sua reposta num tópico")
      .set("code", notificationTypes.FORUM_REPLY_LIKE)
  );

  const dbNotificationType = _db.queryFirst(`
    SELECT id
    FROM notification_type
    WHERE code = ?::varchar
  `, notificationTypes.FORUM_REPLY_LIKE);

  if (dbNotificationType) {
    const notificationTypeId = dbNotificationType.getInt("id");

    if (!notifications.isNotificationBlocked(replyOwnerId, notificationTypeId)) {
      const loggedUserData = people.getData(loggedUserUid);
      const loggedUsername = loggedUserData ? loggedUserData.getString("username") : "";

      notifications.sendNotification(
        "@" + loggedUsername,
        notificationMessages.FORUM_REPLY_LIKE,
        loggedUserId,
        replyOwnerId,
        `{ "topicUid": "${dbReply.getUID("topic_uid")}", "categoryUid": "${dbReply.getUID("category_uid")}", "replyUid": "${dbReply.getUID("uid")}" }`,
        notificationTypeId
      );

      const dbReplyOwner = _db.queryFirst(`
        SELECT people.id, people.uid
        FROM people
        WHERE people.id = ?::int
      `, replyOwnerId);

      const dbCreated = _db.queryFirst(`
        SELECT uid, sent_at
        FROM notification
        WHERE originator_id = ?::int
          AND recipient_id = ?::int
          AND type_id = ?::int
        ORDER BY id DESC
        LIMIT 1
      `, loggedUserId, replyOwnerId, notificationTypeId);

      if (dbReplyOwner && dbCreated) {
        people.wsSendAsService(
          dbReplyOwner,
          _val.map()
            .set("method", "POST")
            .set("service", "notification/new")
            .set("data", _val.map().set("with", loggedUserUid))
            .set("content", _val.map()
              .set("uid", dbCreated.getString("uid"))
              .set("title", "@" + loggedUsername)
              .set("content", notificationMessages.FORUM_REPLY_LIKE)
              .set("originator", _val.map()
                .set("uid", loggedUserUid)
                .set("username", loggedUsername)
              )
              .set("recipient", _val.map()
                .set("uid", dbReplyOwner.getUID("uid"))
              )
              .set("sent_at", dbCreated.getString("sent_at"))
              .set("read_at", null)
              .set("extra", _val.map()
                .set("topicUid", dbReply.getUID("topic_uid"))
                .set("categoryUid", dbReply.getUID("category_uid"))
                .set("replyUid", dbReply.getUID("uid"))
              )
              .set("type", notificationTypes.FORUM_REPLY_LIKE)
            )
        );
      }
    }
  }
}

response.successWithData(
  _val.map()
    .set("liked", true)
    .set("likes", likes)
);
