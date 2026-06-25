import { _req, _db, _val, _out, _header, _exec } from "@netuno/server-types";
import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const loggedUser = people.getLogged();

if (!loggedUser) {
  response.stopWithPermissionDenied();
}

const uid = _req.getString("uid");
const loggedId = loggedUser.getInt("id");

const dbFriendship = _db.queryFirst(`
  SELECT f.id, f.accepted_at
  FROM friend f
    INNER JOIN people p ON f.people_id = p.id
  WHERE p.uid = ?::uuid
    AND f.friend_id = ?::int
`, uid, loggedId);

if (!dbFriendship) {
  response.stopWithBadRequest("invalid_request");
}

const acceptedAt = dbFriendship.getString("accepted_at");
if (acceptedAt && acceptedAt !== "") {
  response.stopWithBadRequest("already_accepted");
}

const currentTimestamp = _db.timestamp();
_db.update("friend", dbFriendship.getInt("id"), _val.map()
  .set("accepted_at", currentTimestamp)
);

_out.json(
  _val.map()
    .set("result", true)
    .set("status", "accepted")
);