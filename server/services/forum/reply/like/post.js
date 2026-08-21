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

const loggedUserId = loggedUser.getInt("id");

const dbLike = _db.queryFirst(`
    SELECT id
    FROM forum_reply_like
    WHERE forum_reply_id = ?::int
      AND people_id = ?::int
`, dbReply.getInt("id"), loggedUserId);

if (dbLike) {
  response.stopWithBadRequest("like-already-exists");
}

const likeId = _db.insert(
  "forum_reply_like",
  _val.map()
    .set("forum_reply_id", dbReply.getInt("id"))
    .set("people_id", loggedUserId)
    .set("moment", _db.timestamp())
);

if (!likeId) {
  response.stopWithLikeNotCreated();
}

const likes = dbReply.getInt("likes", 0) + 1;

_db.update(
  "forum_reply",
  dbReply.getInt("id"),
  _val.map()
    .set("likes", likes)
);

response.successWithData(
  _val.map()
    .set("liked", true)
    .set("likes", likes)
);
