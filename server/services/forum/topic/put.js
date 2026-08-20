import { _req, _db, _val, _user } from "@netuno/server-types";

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

const uid = _req.getUID("uid");
const title = _req.getString("title");
const content = _req.getString("content");

if (title.length > 250) {
  response.stopWithBadRequest("title-too-large");
}

if (content.length > 5000) {
  response.stopWithTextTooLarge();
}

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

const updateMoment = _db.timestamp();

_db.update(
  "forum_topic",
  dbTopic.getInt("id"),
  _val.map()
    .set("title", title)
    .set("content", content)
    .set("last_activity_at", updateMoment)
);

_db.update(
  "forum_category",
  dbTopic.getInt("forum_category_id"),
  _val.map()
    .set("last_activity_at", updateMoment)
);

response.successWithoutData();
