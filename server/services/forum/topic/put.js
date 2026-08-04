import { _req, _db, _val, _user } from "@netuno/server-types";

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

const uid = _req.getUID("uid");
const title = _req.getString("title");
const content = _req.getString("content");

if (title.length > 200) {
  response.stopWithBadRequest("title-too-large");
}

if (content.length > 2000) {
  response.stopWithTextTooLarge();
}

const dbTopic = _db.queryFirst(`
    SELECT t.id, p.people_user_id
    FROM forum_topico t
    INNER JOIN people p ON t.people_id = p.id
    WHERE t.uid = ?::uuid
      AND t.active = true
`, uid);

if (!dbTopic) {
  response.stopWithForumTopicNotFound();
}

if (dbTopic.getInt("people_user_id") !== _user.id && !permissions.canManagePosts()) {
  response.stopWithPermissionDenied();
}

_db.update(
  "forum_topico",
  dbTopic.getInt("id"),
  _val.map()
    .set("title", title)
    .set("content", content)
);

response.successWithoutData();
