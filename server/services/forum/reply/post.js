import { _req, _db, _val } from "@netuno/server-types";

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";
import notifications, { notificationTypes } from "#core/lib/notifications.js";

const topicUid = _req.getUID("topicUid");
const content = _req.getString("content");

if (content.length > 2000) {
  response.stopWithTextTooLarge();
}

const dbTopic = _db.queryFirst(`
    SELECT forum_topico.id, forum_topico.uid, people.uid as "people_uid"
      FROM forum_topico
    INNER JOIN people
      ON forum_topico.people_id = people.id
    WHERE forum_topico.uid = ?::uuid
    AND forum_topico.active = true
`, topicUid);

if (!dbTopic) {
  response.stopWithForumTopicNotFound();
}

const loggedUser = people.getLogged();
const replyMoment = _db.timestamp();

if (!loggedUser) {
  response.stopWithUserNotFound();
}

const dbTopicOwner = people.getByUid(
  dbTopic.getUID("people_uid")
);

if (!dbTopicOwner) {
  response.stopWithUserNotFound();
}


const replyId = _db.insert(
  "forum_resposta",
  _val.map()
    .set("topic_id", dbTopic.getInt("id"))
    .set("people_id", loggedUser.getInt("id"))
    .set("content", content)
    .set("moment", replyMoment)
);

if (!replyId) {
  response.stopWithForumReplyNotCreated();
}

_db.update(
  "forum_topico",
  dbTopic.getInt("id"),
  _val.map()
    .set("last_activity_at", replyMoment)
);

const dbReply = _db.queryFirst(`
    SELECT
      r.uid,
      r.content,
      r.moment,
      t.uid AS "topic_uid",
      p.uid AS "people_uid",
      p.name AS "people_name",
      nu.user AS "people_user",
      p.avatar AS "people_avatar"
    FROM forum_resposta r
    INNER JOIN forum_topico t ON r.topic_id = t.id
    INNER JOIN people p ON r.people_id = p.id
    INNER JOIN netuno_user nu ON p.people_user_id = nu.id
    WHERE r.id = ?::int
`, replyId);

const notificationTypeId = notifications.getNotificationTypeId(notificationTypes.FORUM_REPLY);
const loggedUserId = loggedUser.getInt("id");
const topicOwnerId = dbTopicOwner.getInt("id");

if (loggedUserId !== topicOwnerId && !notifications.isNotificationBlocked(topicOwnerId, notificationTypeId)) {
  notifications.sendNotification(
    "@" + dbReply.getString("people_user"),
    "respondeu seu tópico.",
    loggedUserId,
    topicOwnerId,
    `{ "topicUid": "${dbReply.getUID("topic_uid")}", "replyUid": "${dbReply.getUID("uid")}" }`,
    notificationTypeId
  );

  const dbCreated = _db.queryFirst(`
    SELECT uid, sent_at
    FROM notification
    WHERE originator_id = ?::int
      AND recipient_id = ?::int
      AND type_id = ?::int
    ORDER BY id DESC
    LIMIT 1
  `, loggedUserId, topicOwnerId, notificationTypeId);

  if (dbCreated) {
    people.wsSendAsService(
      dbTopicOwner,
      _val.map()
        .set("method", "POST")
        .set("service", "notification/new")
        .set("data", _val.map().set("with", dbReply.getUID("people_uid")))
        .set("content", _val.map()
          .set("uid", dbCreated.getString("uid"))
          .set("title", "@" + dbReply.getString("people_user"))
          .set("content", "respondeu seu tópico.")
          .set("originator", _val.map()
            .set("uid", dbReply.getUID("people_uid"))
            .set("username", dbReply.getString("people_user"))
          )
          .set("recipient", _val.map()
            .set("uid", dbTopic.getUID("people_uid"))
          )
          .set("sent_at", dbCreated.getString("sent_at"))
          .set("read_at", null)
          .set("extra", _val.map()
            .set("topicUid", dbReply.getUID("topic_uid"))
            .set("replyUid", dbReply.getUID("uid"))
          )
          .set("type", notificationTypes.FORUM_REPLY)
        )
    );
  }
}

response.successWithData(
  _val.map()
    .set("uid", dbReply.getUID("uid"))
    .set("content", dbReply.getString("content"))
    .set("moment", dbReply.getString("moment"))
    .set("topicUid", dbReply.getUID("topic_uid"))
    .set("authorUid", dbTopic.getUID("people_uid"))
    .set(
      "people",
      _val.map()
        .set("uid", dbReply.getUID("people_uid"))
        .set("name", dbReply.getString("people_name"))
        .set("user", dbReply.getString("people_user"))
        .set("avatar", dbReply.getString("people_avatar") !== "")
    )
);
