import { _req, _db, _val, _out, _header, _exec } from "@netuno/server-types";
import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const loggedUser = people.getLogged();
if (!loggedUser) response.stopWithPermissionDenied();

const friendUid = _req.getString("uid");

const dbFriend = _db.queryFirst("SELECT id FROM people WHERE uid = ?::uuid", friendUid);
if (!dbFriend) response.stopWithUserNotFound();

const loggedId = loggedUser.getInt("id");
const friendId = dbFriend.getInt("id");

let status = "none";

if (loggedId === friendId) {
  status = "self";
} else {
  const dbRelation = _db.queryFirst(`
    SELECT people_id, friend_id, accepted_at
    FROM friend
    WHERE (people_id = ? AND friend_id = ?)
       OR (people_id = ? AND friend_id = ?)
  `, loggedId, friendId, friendId, loggedId);

  if (dbRelation) {
    const acceptedAt = dbRelation.getString("accepted_at");
    if (acceptedAt && acceptedAt !== "") {
      status = "friends";
    } else {
      const initiatorId = dbRelation.getInt("people_id");
      if (initiatorId === loggedId) {
        status = "pending";
      } else {
        status = "received";
      }
    }
  }
}

_out.json(
  _val.map()
    .set("status", status)
);