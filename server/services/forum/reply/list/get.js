import { _req, _db, _val } from "@netuno/server-types";

import response from "#core/lib/response.js";

const topicUid = _req.getUID("topicUid");
let page = _req.getInt("page", 1);

const pageSize = 10;
const offset = page > 0 ? (page - 1) * pageSize : 0;

const dbTopic = _db.queryFirst(`
    SELECT id, uid
    FROM forum_topico
    WHERE uid = ?::uuid
      AND active = true
`, topicUid);

if (!dbTopic) {
  response.stopWithForumTopicNotFound();
}

const dbReplies = _db.query(`
    SELECT
      count(*) over() as total_count,
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
    WHERE r.topic_id = ?::int
      AND r.active = true
    ORDER BY r.moment DESC
    LIMIT ?::int
    OFFSET ?::int
`, dbTopic.getInt("id"), pageSize, offset);

const replies = _val.list();
for (const dbReply of dbReplies) {
  replies.add(
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
}

const totalCount = dbReplies.length === 0 ? 0 : dbReplies[0].getInt("total_count");

response.successWithData(
  _val.map()
    .set("items", replies)
    .set("pagination", { pageSize, totalCount })
);
