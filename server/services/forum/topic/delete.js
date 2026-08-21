import { _req, _db, _val, _user } from "@netuno/server-types";

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

const uid = _req.getUID("uid");

const dbTopic = _db.queryFirst(`
    SELECT t.id, t.forum_category_id, p.people_user_id
    FROM forum_topic t
    INNER JOIN people p ON t.people_id = p.id
    WHERE t.uid = ?::uuid
      AND t.active = true
`, uid);

if (!dbTopic) {
  response.stopWithForumTopicNotFound();
}

if (dbTopic.getInt("people_user_id") !== _user.id && !permissions.canManagePosts() && !permissions.canManageForumCategories()) {
  response.stopWithPermissionDenied();
}

const dbHasReplies = _db.queryFirst(`
  SELECT EXISTS (
    SELECT 1
    FROM forum_reply
    WHERE topic_id = ?::int
  ) AS has_replies
`, dbTopic.getInt("id"));

if (dbHasReplies.getBoolean("has_replies")) {
  response.stopWithBadRequest("forum-topic-has-replies");
}

_db.delete("forum_topic", dbTopic.getInt("id"));

const categoryId = dbTopic.getInt("forum_category_id");
const dbCategory = _db.queryFirst(`
    SELECT id, topics
    FROM forum_category
    WHERE id = ?::int
`, categoryId);

if (dbCategory) {
  const dbLastActivity = _db.queryFirst(`
      SELECT MAX(COALESCE(last_activity_at, moment)) AS last_moment
      FROM forum_topic
      WHERE forum_category_id = ?::int
        AND active = true
  `, categoryId);

  _db.update(
    "forum_category",
    categoryId,
    _val.map()
      .set("topics", Math.max(0, dbCategory.getInt("topics", 0) - 1))
      .set("moment", dbLastActivity ? dbLastActivity.getString("last_moment") : null)
      .set("last_activity_at", dbLastActivity ? dbLastActivity.getString("last_moment") : null)
  );
}

response.successWithoutData();
