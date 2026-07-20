import {_req, _db, _val, _user, _header, _exec, _out} from "@netuno/server-types"

import people from "#core/lib/people.js";
import notifications, { notificationTypes, notificationMessages } from "#core/lib/notifications.js";

const postUid = _req.getString('uid');

const dbPost = _db.queryFirst(`
    SELECT post.id AS id, post.likes, author.id AS author_id
    FROM post
    INNER JOIN people author
    ON post.people_id = author.id
    WHERE post.uid = ?::uuid`
  , postUid);

if (!dbPost) {
  _header.status(400);
  _exec.stop();
}

const loggedUser = people.getLogged();
const loggedUserId = loggedUser.getInt('id');
const loggedUserUid = loggedUser.getUID("uid");
const loggedUsername = people.getData(loggedUserUid).getString("username");

const dbLike = _db.queryFirst(`
    SELECT id 
    FROM post_like
    WHERE 1 = 1
        AND post_id = ?::int
        AND people_id = ?::int
`, dbPost.getInt('id'), loggedUserId);

if (dbLike) {
  _header.status(400);
  _exec.stop();
}

_db.insert(
  'post_like',
  _val.map()
    .set('post_id', dbPost.getInt('id'))
    .set('people_id', loggedUserId)
    .set('moment', _db.timestamp())
);

_db.update(
  'post',
  dbPost.getInt('id'),
  _val.map()
    .set('likes', dbPost.getInt('likes') + 1)
);

const notificationTypeId = notifications.getNotificationTypeId(notificationTypes.MY_POST_LIKE);
const postAuthorId = dbPost.getInt("author_id");

if (loggedUserId !== postAuthorId && !notifications.isNotificationBlocked(postAuthorId, notificationTypeId)) {
  notifications.sendNotification(
    "@" + loggedUsername,
    notificationMessages.MY_POST_LIKE,
    loggedUserId,
    postAuthorId,
    `{ "postUid": "${postUid}" }`,
    notificationTypeId
  );

  const dbParentAuthor = _db.queryFirst(`
    SELECT people.id, people.uid, netuno_user.user AS username
    FROM people
    INNER JOIN netuno_user ON people.people_user_id = netuno_user.id
    WHERE people.id = ?::int
  `, postAuthorId);

  if (dbParentAuthor) {
    const dbCreated = _db.queryFirst(`
      SELECT uid, sent_at FROM notification
      WHERE originator_id = ?::int AND recipient_id = ?::int AND type_id = ?::int
      ORDER BY id DESC LIMIT 1
    `, loggedUserId, postAuthorId, notificationTypeId);

    people.wsSendAsService(
      dbParentAuthor,
      _val.map()
        .set("method", "POST")
        .set("service", "notification/new")
        .set("data", _val.map().set("with", loggedUserUid))
        .set("content", _val.map()
          .set("uid", dbCreated.getString("uid"))
          .set("title", "@" + loggedUsername)
          .set("content", notificationMessages.MY_POST_LIKE)
          .set("originator", _val.map().set("uid", loggedUserUid).set("username", loggedUsername))
          .set("recipient", _val.map().set("uid", dbParentAuthor.getString("uid")))
          .set("sent_at", dbCreated.getString("sent_at"))
          .set("read_at", null)
          .set("extra", _val.map().set("postUid", postUid))
          .set("type", notificationTypes.MY_POST_LIKE)
        )
    );
  }
}

const friendQueueTypeId = notifications.getNotificationTypeId(notificationTypes.FRIEND_LIKE);
_db.insert("notification_queue",
  _val.map()
    .set("entity_uid", postUid)
    .set("originator_id", loggedUserId)
    .set("type_id", friendQueueTypeId)
);

const loggedInstitutionId = loggedUser.getInt("institution_id");
if (loggedInstitutionId > 0) {
  const institutionQueueTypeId = notifications.getNotificationTypeId(notificationTypes.INSTITUTION_LIKE);
  _db.insert("notification_queue",
    _val.map()
      .set("entity_uid", postUid)
      .set("originator_id", loggedUserId)
      .set("type_id", institutionQueueTypeId)
  );
}

_out.json(
  _val.map()
    .set('result', true)
);
