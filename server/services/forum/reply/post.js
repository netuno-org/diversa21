import { _req, _db, _val } from "@netuno/server-types";

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";
import notifications, { notificationTypes, notificationMessages } from "#core/lib/notifications.js";

const topicUid = _req.getUID("topicUid");
const content = _req.getString("content");
const isAnonymous = _req.getBoolean("isAnonymous");

if (content.length > 2500) {
  response.stopWithTextTooLarge();
}

const dbTopic = _db.queryFirst(`
    SELECT forum_topic.id, 
    forum_topic.uid, 
    forum_topic.forum_category_id, 
    forum_topic.replies, 
    people.uid as "people_uid", 
    forum_category.uid as "category_uid"
      FROM forum_topic
    INNER JOIN people
      ON forum_topic.people_id = people.id
    INNER JOIN forum_category
      ON forum_topic.forum_category_id = forum_category.id
    WHERE forum_topic.uid = ?::uuid
    AND forum_topic.active = true
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
  "forum_reply",
  _val.map()
    .set("topic_id", dbTopic.getInt("id"))
    .set("people_id", loggedUser.getInt("id"))
    .set("content", content)
    .set("moment", replyMoment)
    .set("anonymous", isAnonymous)
    .set("likes", 0)
);

if (!replyId) {
  response.stopWithForumReplyNotCreated();
}

_db.update(
  "forum_topic",
  dbTopic.getInt("id"),
  _val.map()
    .set("last_activity_at", replyMoment)
    .set("replies", dbTopic.getInt("replies", 0) + 1)
);

_db.update(
  "forum_category",
  dbTopic.getInt("forum_category_id"),
  _val.map()
    .set("moment", replyMoment)
    .set("last_activity_at", replyMoment)
);

const dbReply = _db.queryFirst(`
    SELECT
      r.uid,
      r.content,
      r.moment,
      r.anonymous,
      t.uid AS "topic_uid",
      p.uid AS "people_uid",
      p.name AS "people_name",
      nu.user AS "people_user",
      p.avatar AS "people_avatar"
    FROM forum_reply r
    INNER JOIN forum_topic t ON r.topic_id = t.id
    INNER JOIN people p ON r.people_id = p.id
    INNER JOIN netuno_user nu ON p.people_user_id = nu.id
    WHERE r.id = ?::int
`, replyId);

const notificationTypeId = notifications.getNotificationTypeId(notificationTypes.FORUM_REPLY);
const loggedUserId = loggedUser.getInt("id");
const topicOwnerId = dbTopicOwner.getInt("id");
const replyIsAnonymous = dbReply.getBoolean("anonymous");

if (loggedUserId !== topicOwnerId && !notifications.isNotificationBlocked(topicOwnerId, notificationTypeId)) {
  const notificationTitle = replyIsAnonymous
    ? "Alguém"
    : "@" + dbReply.getString("people_user");
  const notificationContent = replyIsAnonymous
    ? notificationMessages.FORUM_REPLY_ANONYMOUS
    : notificationMessages.FORUM_REPLY;

  const notificationContext = _val.map()
    .set("topicUid", dbReply.getUID("topic_uid"))
    .set("replyUid", dbReply.getUID("uid"));

  if (replyIsAnonymous) {
    notificationContext.set("anonymous", true);
  }
  const notificationJson = `
  { "topicUid": "${dbReply.getUID("topic_uid")}", 
   "replyUid": "${dbReply.getUID("uid")}"
   ${replyIsAnonymous ? ', "anonymous": true' : ""} }
  `;

  notifications.sendNotification(
    notificationTitle,
    notificationContent,
    loggedUserId,
    topicOwnerId,
    notificationJson,
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
    const wsContent = _val.map()
      .set("uid", dbCreated.getString("uid"))
      .set("title", notificationTitle)
      .set("content", notificationContent)
      .set("recipient", _val.map()
        .set("uid", dbTopic.getUID("people_uid"))
      )
      .set("sent_at", dbCreated.getString("sent_at"))
      .set("read_at", null)
      .set("extra", notificationContext)
      .set("type", notificationTypes.FORUM_REPLY);

    if (!replyIsAnonymous) {
      wsContent.set(
        "originator",
        _val.map()
          .set("uid", dbReply.getUID("people_uid"))
          .set("username", dbReply.getString("people_user"))
      );
    }

    people.wsSendAsService(
      dbTopicOwner,
      _val.map()
        .set("method", "POST")
        .set("service", "notification/new")
        .set("data", replyIsAnonymous
          ? _val.map()
          : _val.map().set("with", dbReply.getUID("people_uid"))
        )
        .set("content", wsContent)
    );
  }
}

const reply = _val.map()
  .set("uid", dbReply.getUID("uid"))
  .set("content", dbReply.getString("content"))
  .set("moment", dbReply.getString("moment"))
  .set("likes", 0)
  .set("liked", false)
  .set("topicUid", dbReply.getUID("topic_uid"))
  .set("authorUid", dbTopic.getUID("people_uid"))
  .set("anonymous", dbReply.getBoolean("anonymous"));

if (!dbReply.getBoolean("anonymous")) {
  reply.set(
    "people",
    _val.map()
      .set("uid", dbReply.getUID("people_uid"))
      .set("name", dbReply.getString("people_name"))
      .set("user", dbReply.getString("people_user"))
      .set("avatar", dbReply.getString("people_avatar") !== "")
  );
}

response.successWithData(reply);
