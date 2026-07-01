import { _req, _db, _val, _out, _header, _exec, _group } from "@netuno/server-types";
import people from "#core/lib/people.js";
import response from "#core/lib/response.js";
import notifications from "#core/lib/notifications.js";

const loggedUser = people.getLogged();

if (_group.code() !== "member") {
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

const loggedUserId = loggedUser.getInt("id");
const friendId = dbFriend.getInt("id");

const dbFriendship = _db.queryFirst(`
    SELECT id
    FROM friend
    WHERE (people_id = ? AND friend_id = ?)
    OR (people_id = ? AND friend_id = ?)
  `, loggedUserId, friendId, friendId, loggedUserId);

if (!dbFriendship) {
  response.stopWithBadRequest("invalid_request");
}

_db.delete("friend", dbFriendship.getInt("id"));

const requestNotificationTypeId = notifications.getNotificationTypeId('friend-request');
const acceptedNotificationTypeId = notifications.getNotificationTypeId('friend-request-accepted');

const dbNotification = _db.queryFirst(`
    SELECT id 
    FROM notification
    WHERE type_id = ?::int OR type_id = ?::int
    AND (
      (originator_id = ?::int AND recipient_id = ?::int)
      OR (originator_id = ?::int AND recipient_id = ?::int)
    )
  `, 
  requestNotificationTypeId, acceptedNotificationTypeId, 
  loggedUserId, friendId,
  friendId, loggedUserId);

_db.delete("notification", dbNotification.getInt("id"));

_out.json(
  _val.map()
    .set("result", true)
);
