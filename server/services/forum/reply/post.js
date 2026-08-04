import { _req, _db, _val } from "@netuno/server-types";

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const topicUid = _req.getUID("topicUid");
const content = _req.getString("content");

if (content.length > 2000) {
  response.stopWithTextTooLarge();
}

const dbTopic = _db.queryFirst(`
    SELECT id, uid
    FROM forum_topico
    WHERE uid = ?::uuid
      AND active = true
`, topicUid);

if (!dbTopic) {
  response.stopWithForumTopicNotFound();
}

const loggedUser = people.getLogged();
const replyMoment = _db.timestamp();

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

response.successWithData(
  _val.map()
    .set("uid", dbReply.getUID("uid"))
    .set("content", dbReply.getString("content"))
    .set("moment", dbReply.getString("moment"))
    .set("topicUid", dbReply.getUID("topic_uid"))
    .set(
      "people",
      _val.map()
        .set("uid", dbReply.getUID("people_uid"))
        .set("name", dbReply.getString("people_name"))
        .set("user", dbReply.getString("people_user"))
        .set("avatar", dbReply.getString("people_avatar") !== "")
    )
);
