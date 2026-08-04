import { _req, _db, _val, _user } from "@netuno/server-types";

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

const uid = _req.getUID("uid");
const content = _req.getString("content");

if (content.length > 2000) {
  response.stopWithTextTooLarge();
}

const dbReply = _db.queryFirst(`
    SELECT r.id, p.people_user_id
    FROM forum_resposta r
    INNER JOIN people p ON r.people_id = p.id
    WHERE r.uid = ?::uuid
      AND r.active = true
`, uid);

if (!dbReply) {
  response.stopWithForumReplyNotFound();
}

if (dbReply.getInt("people_user_id") !== _user.id && !permissions.canManagePosts()) {
  response.stopWithPermissionDenied();
}

_db.update(
  "forum_resposta",
  dbReply.getInt("id"),
  _val.map()
    .set("content", content)
);

response.successWithoutData();
