import { _req, _db, _val, _user } from "@netuno/server-types";

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

const uid = _req.getUID("uid");

const dbReply = _db.queryFirst(`
    SELECT r.id, r.topic_id, t.forum_category_id, t.replies, p.people_user_id
    FROM forum_reply r
    INNER JOIN forum_topic t ON r.topic_id = t.id
    INNER JOIN people p ON r.people_id = p.id
    WHERE r.uid = ?::uuid
      AND r.active = true
`, uid);

if (!dbReply) {
  response.stopWithForumReplyNotFound();
}

if (dbReply.getInt("people_user_id") !== _user.id && !permissions.canManagePosts() && !permissions.canManageForumCategories()) {
  response.stopWithPermissionDenied();
}

_db.execute(`
    DELETE FROM forum_reply_like
    WHERE forum_reply_id = ?::int
`, dbReply.getInt("id"));

_db.delete("forum_reply", dbReply.getInt("id"));

_db.update(
  "forum_topic",
  dbReply.getInt("topic_id"),
  _val.map()
    .set("replies", Math.max(0, dbReply.getInt("replies", 0) - 1))
);

const dbTopicActivity = _db.queryFirst(`
    SELECT
      t.id,
      t.moment,
      (
        SELECT MAX(moment)
        FROM forum_reply
        WHERE topic_id = t.id
          AND active = true
      ) AS "last_reply_moment"
    FROM forum_topic t
    WHERE t.id = ?::int
`, dbReply.getInt("topic_id"));

let updatedLastActivity = null;
if (dbTopicActivity) {
  updatedLastActivity = dbTopicActivity.getString("last_reply_moment") || dbTopicActivity.getString("moment");
  _db.update(
    "forum_topic",
    dbTopicActivity.getInt("id"),
    _val.map()
      .set("last_activity_at", updatedLastActivity)
  );
}

const categoryId = dbReply.getInt("forum_category_id");
const dbCategoryActivity = _db.queryFirst(`
    SELECT MAX(COALESCE(last_activity_at, moment)) AS category_moment
    FROM forum_topic
    WHERE forum_category_id = ?::int
      AND active = true
`, categoryId);

if (dbCategoryActivity) {
  _db.update(
    "forum_category",
    categoryId,
    _val.map()
      .set("moment", dbCategoryActivity.getString("category_moment"))
      .set("last_activity_at", dbCategoryActivity.getString("category_moment"))
  );
}

response.successWithoutData();
