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
const loggedId = loggedUser.getInt("id");

const dbFriendship = _db.queryFirst(`
  SELECT f.id, f.accepted_at
  FROM friend f
    INNER JOIN people p ON f.people_id = p.id
  WHERE p.uid = ?::uuid
    AND f.friend_id = ?::int
`, friendUid, loggedId);

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

const notificationTypeId = _db.queryFirst(`
    SELECT id
    FROM notification_type
    WHERE code = 'friend-request-accepted'
`).getInt("id");

const loggedUserName = people.getData(loggedUser.getUID("uid")).getString("username");
const friendId = people.getByUid(friendUid).getInt("id");

if (!notifications.isNotificationBlocked(friendId, notificationTypeId)) {
  notifications.sendNotification(
    "@" + loggedUserName,
    "Aceitou seu pedido de amizade.",
    loggedId,
    friendId,
    '',
    notificationTypeId
  );
}

_out.json(
  _val.map()
    .set("result", true)
    .set("status", "accepted")
);
