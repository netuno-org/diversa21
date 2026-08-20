import { _req, _db, _val } from "@netuno/server-types";

import response from "#core/lib/response.js";

const categoryUid = _req.getUID("categoryUid");
const title = _req.getString("title");
let page = _req.getInt("page", 1);

const pageSize = 10;
const offset = page > 0 ? (page - 1) * pageSize : 0;

const dbCategory = _db.queryFirst(`
    SELECT id
    FROM forum_category
    WHERE uid = ?::uuid
      AND active = true
`, categoryUid);

if (!dbCategory) {
  response.stopWithForumCategoryNotFound();
}

const dbTopics = _db.query(`
    SELECT
      count(*) over() as total_count,
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
    FROM forum_topic t
    INNER JOIN forum_category c ON t.forum_category_id = c.id
    INNER JOIN people p ON t.people_id = p.id
    INNER JOIN netuno_user nu ON p.people_user_id = nu.id
    WHERE t.forum_category_id = ?::int
      AND t.active = true
      AND (?::text = '' OR t.title ILIKE ?::text)
    ORDER BY COALESCE(t.last_activity_at, t.moment) DESC
    LIMIT ?::int
    OFFSET ?::int
`, dbCategory.getInt("id"), title, `%${title}%`, pageSize, offset);

const topics = _val.list();
for (const dbTopic of dbTopics) {
  topics.add(
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
}

const totalCount = dbTopics.length === 0 ? 0 : dbTopics[0].getInt("total_count");

response.successWithData(
  _val.map()
    .set("items", topics)
    .set("pagination", { pageSize, totalCount })
);
