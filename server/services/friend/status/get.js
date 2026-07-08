import { _req, _db, _val, _out, _header, _exec, _group } from "@netuno/server-types";
import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const loggedUser = people.getLogged();

const friendUid = _req.getString("uid");

const dbFriend = _db.queryFirst(`
  SELECT p.id, g.code AS "group_code", g.name AS "group_name"
  FROM people p
  INNER JOIN netuno_user u ON p.people_user_id = u.id
  INNER JOIN netuno_group g ON u.group_id = g.id
  WHERE p.uid = ?::uuid
`, friendUid);

if (!dbFriend) {
  response.stopWithUserNotFound();
}

const loggedId = loggedUser.getInt("id");
const friendId = dbFriend.getInt("id");

const canRequest = loggedId !== friendId;

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
    .set("canRequest", canRequest)
    .set("group", _val.map()
      .set("code", dbFriend.getString("group_code"))
      .set("name", dbFriend.getString("group_name"))
    )
);
