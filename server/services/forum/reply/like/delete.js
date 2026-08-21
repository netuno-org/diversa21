import { _req, _db, _val } from "@netuno/server-types";

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const uid = _req.getUID("uid");

const dbReply = _db.queryFirst(`
    SELECT id, likes
    FROM forum_reply
    WHERE uid = ?::uuid
      AND active = true
`, uid);

if (!dbReply) {
  response.stopWithForumReplyNotFound();
}

const loggedUser = people.getLogged();

if (!loggedUser) {
  response.stopWithUserNotFound();
}

let likes = dbReply.getInt("likes", 0);

const deleteResults = _db.execute(`
    DELETE FROM forum_reply_like
    WHERE forum_reply_id = ?::int
      AND people_id = ?::int
`, dbReply.getInt("id"), loggedUser.getInt("id"));

if (deleteResults > 0) {
  likes = Math.max(0, likes - 1);
  _db.update(
    "forum_reply",
    dbReply.getInt("id"),
    _val.map()
      .set("likes", likes)
  );
}

response.successWithData(
  _val.map()
    .set("liked", false)
    .set("likes", likes)
);
