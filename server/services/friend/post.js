import { _req, _db, _val, _out, _header, _exec, _group } from "@netuno/server-types";
import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const loggedUser = people.getLogged();

if (!loggedUser) {
  response.stopWithPermissionDenied();
}

if (_group.code() !== "member") {
  response.stopWithPermissionDenied();
}

const friendUid = _req.getString("uid");

const dbFriend = _db.queryFirst(`
  SELECT id, name
  FROM people
  WHERE uid = ?::uuid
`, friendUid);

if (!dbFriend) {
  response.stopWithUserNotFound();
}

const loggedId = loggedUser.getInt("id");
const friendId = dbFriend.getInt("id");

if (loggedId === friendId) {
  response.stopWithBadRequest("cannot_add_self");
}

const dbExisting = _db.queryFirst(`
  SELECT id, people_id, friend_id, accepted_at
  FROM friend
  WHERE (people_id = ? AND friend_id = ?)
     OR (people_id = ? AND friend_id = ?)
`, loggedId, friendId, friendId, loggedId);

if (dbExisting) {
  const acceptedAt = dbExisting.getString("accepted_at");
  if (acceptedAt && acceptedAt !== "") {
    response.stopWithBadRequest("already_friends");
  }

  const initiatorId = dbExisting.getInt("people_id");
  if (initiatorId === loggedId) {
    response.stopWithBadRequest("request_already_sent");
  } else {
    response.stopWithBadRequest("request_already_received");
  }
}

const currentTimestamp = _db.timestamp();
const requestId = _db.insert("friend", _val.map()
  .set("people_id", loggedId)
  .set("friend_id", friendId)
  .set("request_at", currentTimestamp)
  .set("accepted_at", null)
);

const notificationTypeId = _db.queryFirst(`
    SELECT id
    FROM notification_type
    WHERE code = 'friend-request'
`).getInt("id");

const isNotificationBlocked = _db.queryFirst(`
    SELECT *
    FROM notification_opt_out
    WHERE people_id = ?::int
    AND type_id = ?::int
  `, friendId, notificationTypeId)

const loggedUserName = people.getData(loggedUser.getUID("uid")).getString("username");

if (!isNotificationBlocked) {
  _db.insert("notification",
    _val.map()
      .set("title", "@" + loggedUserName)
      .set("content", 'Quer ser seu amigo.')
      .set("originator_id", loggedId)
      .set("recipient_id", friendId) 
      .set("sent_at", currentTimestamp)
      .set("read_at", null)
      .set("extra", "")
      .set("type_id", notificationTypeId)
  );
}

const dbRequest = _db.get("friend", requestId);
_out.json(
  _val.map()
    .set("uid", dbRequest.getString("uid"))
    .set("status", "pending")
);
