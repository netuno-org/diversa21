import {_req, _db, _val, _user, _out} from "@netuno/server-types"

import people from "#core/lib/people.js";
import notifications, { notificationTypes, notificationMessages } from "#core/lib/notifications.js";
import response from "#core/lib/response.js";

const content = _req.getString('content')
const parent = _req.getString('parent')

if (content.length > 500) {
  response.stopWithTextTooLarge();
}

const loggedUser = people.getLogged();
const loggedUserId = loggedUser.getInt('id');
const loggedUserUid = loggedUser.getUID("uid");
const loggedUsername = people.getData(loggedUserUid).getString("username");

let dbParentPost = _val.map();

if (parent) {
  dbParentPost = _db.get(`post`, parent);
}

const postId = _db.insert(
  `post`,
  _val.map()
    .set('content', content)
    .set('moment', _db.timestamp())
    .set('people_id', loggedUserId)
    .set('parent_id', dbParentPost.getInt('id', 0)) 
    .set('comments', 0)
    .set('likes', 0)
);

const dbPost = _db.queryFirst(`
    SELECT uid, content, moment
    FROM post 
    WHERE id = ?
`, postId);

if (!dbParentPost.isEmpty()) {
  _db.update(
    "post",
    dbParentPost.getInt("id"),
    _val.map()
      .set("comments", dbParentPost.getInt("comments", 0) + 1)
  );

  const notificationTypeId = notifications.getNotificationTypeId(notificationTypes.MY_POST_COMMENT);
  const friendId = dbParentPost.getInt("people_id");
  const postUid = dbPost.getUID("uid");
  if (loggedUserId !== friendId && !notifications.isNotificationBlocked(friendId, notificationTypeId)) {
    notifications.sendNotification(
      "@" + loggedUsername,
      notificationMessages.MY_POST_COMMENT,
      loggedUserId,
      friendId,
      `{ "postUid": "${postUid}" }`,
      notificationTypeId
    );

    const loggedUserUid = loggedUser.getUID("uid");
    const dbFriend = _db.queryFirst(`
        SELECT people.id, people.uid, netuno_user.user
        FROM people
        JOIN netuno_user ON people.people_user_id = netuno_user.id
        WHERE people.id = ?::int
      `, friendId);
    const friendUid = dbFriend.getUID("uid");
    const friendUsername = dbFriend.getString("user");

    people.wsSendAsService(
      dbFriend,
      _val.map()
        .set("method", "POST")
        .set("service", "notification/new")
        .set("data", _val.map().set("with", loggedUserUid))
        .set("content", _val.map()
          .set("uid", _db.queryFirst(`
            SELECT uid FROM notification
            WHERE originator_id = ?::int AND recipient_id = ?::int AND type_id = ?::int
            ORDER BY id DESC LIMIT 1
          `, loggedUserId, friendId, notificationTypeId).getString("uid"))
          .set("title", "@" + loggedUsername)
          .set("content", notificationMessages.MY_POST_COMMENT)
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
          .set("sent_at", _db.timestamp())
          .set("read_at", null)
          .set("extra", _val.map()
          .set("postUid", dbPost.getUID("uid")))
          .set("type", notificationTypes.MY_POST_COMMENT)
        )
    );
  }
}

const friendQueueTypeId = notifications.getNotificationTypeId(
  parent ? notificationTypes.FRIEND_COMMENT : notificationTypes.FRIEND_POST
);

_db.insert("notification_queue",
  _val.map()
    .set("entity_uid", dbPost.getUID("uid"))
    .set("originator_id", loggedUserId)
    .set("type_id", friendQueueTypeId)
);

const loggedInstitutionId = loggedUser.getInt("institution_id");
if (loggedInstitutionId > 0) {
  const institutionQueueTypeId = notifications.getNotificationTypeId(
    parent ? notificationTypes.INSTITUTION_COMMENT : notificationTypes.INSTITUTION_POST
  );
  _db.insert("notification_queue",
    _val.map()
      .set("entity_uid", dbPost.getUID("uid"))
      .set("originator_id", loggedUserId)
      .set("type_id", institutionQueueTypeId)
  );
}

const post = _val.map()
  .set("uid", dbPost.getUID("uid"))
  .set("content", dbPost.getString("content"))
  .set("moment", dbPost.getString("moment"))
  .set(
    "people",
    _val.map()
      .set("uid", loggedUser.getUID("uid"))
      .set("name", loggedUser.getString("name"))
      .set("avatar", loggedUser.getString("avatar") !== "")
  );

_out.json(post);
