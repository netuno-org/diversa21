import { _req, _db, _val, _user } from "@netuno/server-types";

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

const uid = _req.getUID("uid");

const dbReply = _db.queryFirst(`
    SELECT r.id, r.topic_id, p.people_user_id
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

_db.delete("forum_resposta", dbReply.getInt("id"));

const dbTopicActivity = _db.queryFirst(`
    SELECT
      t.id,
      t.moment,
      (
        SELECT MAX(moment)
        FROM forum_resposta
        WHERE topic_id = t.id
          AND active = true
      ) AS "last_reply_moment"
    FROM forum_topico t
    WHERE t.id = ?::int
`, dbReply.getInt("topic_id"));

if (dbTopicActivity) {
  _db.update(
    "forum_topico",
    dbTopicActivity.getInt("id"),
    _val.map()
      .set(
        "last_activity_at",
        dbTopicActivity.getString("last_reply_moment") || dbTopicActivity.getString("moment")
      )
  );
}

response.successWithoutData();
