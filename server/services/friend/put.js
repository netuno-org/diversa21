import { _req, _db, _val, _out, _header, _exec, _group } from "@netuno/server-types";
import people from "#core/lib/people.js";
import response from "#core/lib/response.js";
import notifications from "#core/lib/notifications.js";

const friendUid = _req.getString("uid");

// TODO: criar canAddFriend em permissions e usar aqui
if (_group.code() !== "member") {
  response.stopWithPermissionDenied();
}

const loggedUser = people.getLogged();
const loggedUserId = loggedUser.getInt("id");

const dbFriendship = _db.queryFirst(`
  SELECT f.id, f.accepted_at
  FROM friend f
    INNER JOIN people p ON f.people_id = p.id
  WHERE p.uid = ?::uuid
    AND f.friend_id = ?::int
`, friendUid, loggedUserId);

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

const requestNotificationTypeId = notifications.getNotificationTypeId('friend-request');
const friendId = people.getByUid(friendUid).getInt("id");

const dbRequestNotification = _db.queryFirst(`
    SELECT id 
    FROM notification
    WHERE type_id = ?::int
    AND (
      (originator_id = ?::int AND recipient_id = ?::int)
      OR (originator_id = ?::int AND recipient_id = ?::int)
    )
  `, 
  requestNotificationTypeId,
  loggedUserId, friendId,
  friendId, loggedUserId);

_db.delete("notification", dbRequestNotification.getInt("id"));

const acceptedNotificationTypeId = notifications.getNotificationTypeId('friend-request-accepted');
const loggedUsername = people.getData(loggedUser.getUID("uid")).getString("username");

if (!notifications.isNotificationBlocked(friendId, acceptedNotificationTypeId)) {
  notifications.sendNotification(
    "@" + loggedUsername,
    "Aceitou seu pedido de amizade.",
    loggedUserId,
    friendId,
    '',
    acceptedNotificationTypeId
  );
}

_out.json(
  _val.map()
    .set("result", true)
    .set("status", "accepted")
);
