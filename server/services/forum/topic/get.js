import { _req, _db, _val } from "@netuno/server-types";

import response from "#core/lib/response.js";

const topicUid = _req.getUID("uid");

const dbTopic = _db.queryFirst(`
    SELECT
      t.id,
      t.uid,
      t.title,
      t.content,
      t.moment,
      t.last_activity_at,
      c.uid AS "category_uid",
      c.name AS "category_name",
      p.uid AS "people_uid",
      p.name AS "people_name",
      nu.user AS "people_user",
      p.avatar AS "people_avatar",
      COALESCE(t.replies, 0) AS "replies_count"
    FROM forum_topico t
    INNER JOIN forum_categoria c ON t.forum_category_id = c.id
    INNER JOIN people p ON t.people_id = p.id
    INNER JOIN netuno_user nu ON p.people_user_id = nu.id
    WHERE t.uid = ?::uuid
      AND t.active = true
`, topicUid);

if (!dbTopic) {
  response.stopWithForumTopicNotFound();
}

response.successWithData(
  _val.map()
    .set("uid", dbTopic.getUID("uid"))
    .set("title", dbTopic.getString("title"))
    .set("content", dbTopic.getString("content"))
    .set("moment", dbTopic.getString("moment"))
    .set("lastActivityAt", dbTopic.getString("last_activity_at"))
    .set("repliesCount", dbTopic.getInt("replies_count", 0))
    .set(
      "category",
      _val.map()
        .set("uid", dbTopic.getUID("category_uid"))
        .set("name", dbTopic.getString("category_name"))
    )
    .set(
      "people",
      _val.map()
        .set("uid", dbTopic.getUID("people_uid"))
        .set("name", dbTopic.getString("people_name"))
        .set("user", dbTopic.getString("people_user"))
        .set("avatar", dbTopic.getString("people_avatar") !== "")
    )
);
