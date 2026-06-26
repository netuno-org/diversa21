import {_req, _db, _val, _user, _out} from "@netuno/server-types"

import people from "#core/lib/people.js";
import notifications from "#core/lib/notifications.js";
import response from "#core/lib/response.js";

const content = _req.getString('content')
const parent = _req.getString('parent')

if (content.length > 500) {
  response.stopWithTextTooLarge();
}

const loggedUser = people.getLogged();
const loggedUserId = loggedUser.getInt('id');
const loggedUsername = people.getData(loggedUser.getUID("uid")).getString("username");

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

if (!dbParentPost.isEmpty()) {
  _db.update(
    "post",
    dbParentPost.getInt("id"),
    _val.map()
      .set("comments", dbParentPost.getInt("comments", 0) + 1)
    );

  const notificationTypeId = notifications.getNotificationTypeId('my-post-comment');
  const friendId = dbParentPost.getInt("people_id");
  if (loggedUserId !== friendId && !notifications.isNotificationBlocked(friendId, notificationTypeId)) {
    notifications.sendNotification(
      "@" + loggedUsername,
      'Comentou em um post seu.',
      loggedUserId,
      friendId,
      '',
      notificationTypeId);
  }
}

const dbPost = _db.queryFirst(`
    SELECT uid, content, moment
    FROM post 
    WHERE id = ?
`, postId);

const post = _val.map()
  .set("uid", dbPost.getString("uid"))
  .set("content", dbPost.getString("content"))
  .set("moment", dbPost.getString("moment"))
  .set(
    "people",
    _val.map()
      .set("uid", loggedUser.getString("uid"))
      .set("name", loggedUser.getString("name"))
      .set("avatar", loggedUser.getString("avatar") !== "")
  );

_out.json(post);
