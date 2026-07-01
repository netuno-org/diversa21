import { _req, _db, _val, _out, _header, _exec, _group } from "@netuno/server-types";
import people from "#core/lib/people.js";
import response from "#core/lib/response.js";
import notifications from "#core/lib/notifications.js";

const friendUid = _req.getString("uid");

const loggedUser = people.getLogged();

if (_group.code() !== "member") {
  response.stopWithPermissionDenied();
}

const dbFriend = _db.queryFirst(`
  SELECT id, name
  FROM people
  WHERE uid = ?::uuid
`, friendUid);

if (!dbFriend) {
  response.stopWithUserNotFound();
}

const loggedUserId = loggedUser.getInt("id");
const friendId = dbFriend.getInt("id");

if (loggedUserId === friendId) {
  response.stopWithBadRequest("cannot_add_self");
}

const dbExisting = _db.queryFirst(`
  SELECT id, people_id, friend_id, accepted_at
  FROM friend
  WHERE (people_id = ? AND friend_id = ?)
     OR (people_id = ? AND friend_id = ?)
`, loggedUserId, friendId, friendId, loggedUserId);

if (dbExisting) {
  const acceptedAt = dbExisting.getString("accepted_at");
  if (acceptedAt && acceptedAt !== "") {
    response.stopWithBadRequest("already_friends");
  }

  const initiatorId = dbExisting.getInt("people_id");
  if (initiatorId === loggedUserId) {
    response.stopWithBadRequest("request_already_sent");
  } else {
    response.stopWithBadRequest("request_already_received");
  }
}

const currentTimestamp = _db.timestamp();
const requestId = _db.insert("friend", _val.map()
  .set("people_id", loggedUserId)
  .set("friend_id", friendId)
  .set("request_at", currentTimestamp)
  .set("accepted_at", null)
);

const notificationTypeId = notifications.getNotificationTypeId('friend-request');
const loggedUserUid = loggedUser.getUID("uid");
const loggedUsername = people.getData(loggedUserUid).getString("username");

if (!notifications.isNotificationBlocked(friendId, notificationTypeId)) {
  notifications.sendNotification(
    "@" + loggedUsername,
    "Quer ser seu amigo.",
    loggedUserId,
    friendId,
    '',
    notificationTypeId
  );
}

people.wsSendAsService(
  dbFriend,
  _val.map()
    .set("method", "POST")
    .set("service", "notification/new")
    .set(
      "data",
      _val.map()
        .set("with", loggedUserUid)
    )
    .set(
      "content",
      _val.map()
        .set("title", "@" + loggedUsername)
        .set("content", "Quer ser seu amigo.")
        .set("originator_id", loggedUserId)
        .set("recipient_id", friendId)
        .set("sent_at", currentTimestamp)
        .set("read_at", null)
        .set("extra", "")
        .set("type_id", notificationTypeId)
    )
);

const dbRequest = _db.get("friend", requestId);
_out.json(
  _val.map()
    .set("uid", dbRequest.getString("uid"))
    .set("status", "pending")
);
