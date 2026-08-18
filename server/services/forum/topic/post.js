import { _req, _db, _val } from "@netuno/server-types";

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const categoryUid = _req.getUID("categoryUid");
const title = _req.getString("title");
const content = _req.getString("content");

if (title.length > 200) {
  response.stopWithBadRequest("title-too-large");
}

if (content.length > 2000) {
  response.stopWithTextTooLarge();
}

const dbCategory = _db.queryFirst(`
    SELECT id, topics
    FROM forum_categoria
    WHERE uid = ?::uuid
      AND active = true
`, categoryUid);

if (!dbCategory) {
  response.stopWithForumCategoryNotFound();
}

const loggedUser = people.getLogged();
const topicMoment = _db.timestamp();

const topicId = _db.insert(
  "forum_topico",
  _val.map()
    .set("forum_category_id", dbCategory.getInt("id"))
    .set("people_id", loggedUser.getInt("id"))
    .set("title", title)
    .set("content", content)
    .set("moment", topicMoment)
    .set("last_activity_at", topicMoment)
    .set("replies", 0)
);

if (!topicId) {
  response.stopWithForumTopicNotCreated();
}

_db.update(
  "forum_categoria",
  dbCategory.getInt("id"),
  _val.map()
    .set("topics", dbCategory.getInt("topics", 0) + 1)
    .set("moment", topicMoment)
);

const dbTopic = _db.queryFirst(`
    SELECT
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
      p.avatar AS "people_avatar"
    FROM forum_topico t
    INNER JOIN forum_categoria c ON t.forum_category_id = c.id
    INNER JOIN people p ON t.people_id = p.id
    INNER JOIN netuno_user nu ON p.people_user_id = nu.id
    WHERE t.id = ?::int
`, topicId);

response.successWithData(
  _val.map()
    .set("uid", dbTopic.getUID("uid"))
    .set("title", dbTopic.getString("title"))
    .set("content", dbTopic.getString("content"))
    .set("moment", dbTopic.getString("moment"))
    .set("lastActivityAt", dbTopic.getString("last_activity_at"))
    .set("repliesCount", 0)
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
