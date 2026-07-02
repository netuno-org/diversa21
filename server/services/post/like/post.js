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
    notificationTypeId);
}

_out.json(
  _val.map()
    .set('result', true)
);
