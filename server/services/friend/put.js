import { _req, _db, _val, _out, _header, _exec, _group } from "@netuno/server-types";
import people from "#core/lib/people.js";
import response from "#core/lib/response.js";
import notifications, { notificationTypes, notificationMessages } from "#core/lib/notifications.js";

const friendUid = _req.getString("uid");

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

const requestNotificationTypeId = notifications.getNotificationTypeId(notificationTypes.FRIEND_REQUEST);
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

const acceptedNotificationTypeId = notifications.getNotificationTypeId(notificationTypes.FRIEND_REQUEST_ACCEPTED);
const loggedUsername = people.getData(loggedUser.getUID("uid")).getString("username");

if (!notifications.isNotificationBlocked(friendId, acceptedNotificationTypeId)) {
  notifications.sendNotification(
    "@" + loggedUsername,
    notificationMessages.FRIEND_REQUEST_ACCEPTED,
    loggedUserId,
    friendId,
    '',
    acceptedNotificationTypeId
  );

  const dbFriend = _db.queryFirst(`
    SELECT id, name
    FROM people
    WHERE uid = ?::uuid
  `, friendUid);

  const loggedUserUid = loggedUser.getUID("uid");
  const friendUsername = people.getByUid(friendUid).getString("username");
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
          .set("content", notificationMessages.FRIEND_REQUEST_ACCEPTED)
          .set("originator", 
            _val.map()
              .set("uid", loggedUserUid)
              .set("username", loggedUsername)
          )
          .set("recipient", 
            _val.map()
              .set("uid", friendUid)
              .set("username", friendUsername)
          )
          .set("sent_at", currentTimestamp)
          .set("read_at", null)
          .set("extra", "")
          .set("type", notificationTypes.FRIEND_REQUEST_ACCEPTED)
      )
  );
}

_out.json(
  _val.map()
    .set("result", true)
    .set("status", "accepted")
);
