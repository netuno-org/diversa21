import { _req, _db, _val, _out, _header, _exec } from "@netuno/server-types";
import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const loggedUser = people.getLogged();

if (!loggedUser) {
  response.stopWithPermissionDenied();
}

const friendUid = _req.getString("uid");

const dbFriend = _db.queryFirst(`
  SELECT id
  FROM people
  WHERE uid = ?::uuid
`, friendUid);

if (!dbFriend) {
  response.stopWithUserNotFound();
}

const loggedId = loggedUser.getInt("id");
const friendId = dbFriend.getInt("id");

const dbFriendship = _db.queryFirst(`
  SELECT id
  FROM friend
  WHERE (people_id = ? AND friend_id = ?)
     OR (people_id = ? AND friend_id = ?)
`, loggedId, friendId, friendId, loggedId);

if (!dbFriendship) {
  response.stopWithBadRequest("invalid_request");
}

_db.delete("friend", dbFriendship.getInt("id"));

_out.json(
  _val.map()
    .set("result", true)
);