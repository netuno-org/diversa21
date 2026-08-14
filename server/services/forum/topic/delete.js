import { _req, _db, _user } from "@netuno/server-types";

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

const uid = _req.getUID("uid");

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

_db.execute(`
    DELETE FROM forum_resposta
    WHERE topic_id = ?::int
`, dbTopic.getInt("id"));

_db.delete("forum_topico", dbTopic.getInt("id"));

response.successWithoutData();
