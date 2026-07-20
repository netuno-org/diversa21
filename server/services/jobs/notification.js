import { _db, _val, _out } from "@netuno/server-types";

import people from "#core/lib/people.js";
import notifications, { notificationTypes, notificationMessages } from "#core/lib/notifications.js";

const messages = {
  "friend-post": notificationMessages.FRIEND_POST,
  "friend-comment": notificationMessages.FRIEND_COMMENT,
  "friend-like": notificationMessages.FRIEND_LIKE,
  "institution-post": notificationMessages.INSTITUTION_POST,
  "institution-comment": notificationMessages.INSTITUTION_COMMENT,
  "institution-like": notificationMessages.INSTITUTION_LIKE
};

const dbQueueItems = _db.query(`
  SELECT id, entity_uid, originator_id, type_id
  FROM notification_queue
  WHERE active = true
  ORDER BY id ASC
`);

for (const dbQueueItem of dbQueueItems) {
  const queueId = dbQueueItem.getInt("id");
  const entityUid = dbQueueItem.getUID("entity_uid");
  const originatorId = dbQueueItem.getInt("originator_id");
  const typeId = dbQueueItem.getInt("type_id");

  const dbType = _db.queryFirst("SELECT code FROM notification_type WHERE id = ?::int", typeId);
  if (!dbType) {
    _db.execute("DELETE FROM notification_queue WHERE id = ?::int", queueId);
    continue;
  }
  const typeCode = dbType.getString("code");

  const dbOriginator = _db.queryFirst(`
    SELECT people.id, people.uid, people.institution_id, netuno_user.user AS username
    FROM people
    INNER JOIN netuno_user ON people.people_user_id = netuno_user.id
    WHERE people.id = ?::int
  `, originatorId);
  
  if (!dbOriginator) {
    _db.execute("DELETE FROM notification_queue WHERE id = ?::int", queueId);
    continue;
  }
  
  const originatorUid = dbOriginator.getUID("uid");
  const originatorUsername = dbOriginator.getString("username");
  const originatorInstitutionId = dbOriginator.getInt("institution_id");

  let title = "@" + originatorUsername;
  let extraMap = _val.map();
  
  const notifiedIds = {};
  notifiedIds[originatorId] = true;

  let postUid = null;

  if (typeCode === notificationTypes.FRIEND_POST || typeCode === notificationTypes.INSTITUTION_POST) {
    const dbPost = _db.queryFirst("SELECT uid FROM post WHERE uid = ?::uuid", entityUid);
    if (!dbPost) {
      _db.execute("DELETE FROM notification_queue WHERE id = ?::int", queueId);
      continue;
    }
    postUid = dbPost.getUID("uid");

  } else if (typeCode === notificationTypes.FRIEND_COMMENT || typeCode === notificationTypes.INSTITUTION_COMMENT) {
    const dbCommentPost = _db.queryFirst("SELECT uid, parent_id FROM post WHERE uid = ?::uuid", entityUid);
    if (!dbCommentPost) {
      _db.execute("DELETE FROM notification_queue WHERE id = ?::int", queueId);
      continue;
    }
    postUid = dbCommentPost.getUID("uid");

    const dbParentPost = _db.queryFirst("SELECT people_id FROM post WHERE id = ?::int", dbCommentPost.getInt("parent_id"));
    if (dbParentPost) {
      const parentAuthorId = dbParentPost.getInt("people_id");
      notifiedIds[parentAuthorId] = true; // Already notified synchronously
    }

  } else if (typeCode === notificationTypes.FRIEND_LIKE || typeCode === notificationTypes.INSTITUTION_LIKE) {
    const dbPost = _db.queryFirst("SELECT uid, people_id FROM post WHERE uid = ?::uuid", entityUid);
    if (!dbPost) {
      _db.execute("DELETE FROM notification_queue WHERE id = ?::int", queueId);
      continue;
    }
    postUid = dbPost.getUID("uid");
    const postAuthorId = dbPost.getInt("people_id");
    notifiedIds[postAuthorId] = true; // Already notified synchronously
  }

  extraMap.set("postUid", postUid);

  if (typeCode === notificationTypes.FRIEND_POST || 
      typeCode === notificationTypes.FRIEND_COMMENT || 
      typeCode === notificationTypes.FRIEND_LIKE) {
      
    const dbFriends = notifications.getFriends(originatorId);
    const friendsToNotify = _val.list();
    for (const dbFriend of dbFriends) {
      const fId = dbFriend.getInt("id");
      if (!notifiedIds[fId]) {
        friendsToNotify.add(dbFriend);
        notifiedIds[fId] = true;
      }
    }

    notifications.notifyRecipients(
      friendsToNotify,
      originatorId,
      originatorUid,
      originatorUsername,
      typeCode,
      title,
      messages[typeCode],
      extraMap
    );

  } else if (typeCode === notificationTypes.INSTITUTION_POST || 
             typeCode === notificationTypes.INSTITUTION_COMMENT || 
             typeCode === notificationTypes.INSTITUTION_LIKE) {

    const dbFriends = notifications.getFriends(originatorId);
    for (const dbFriend of dbFriends) {
      notifiedIds[dbFriend.getInt("id")] = true;
    }

    const institutionMembersToNotify = _val.list();
    if (originatorInstitutionId > 0) {
      const dbMembers = notifications.getInstitutionMembers(originatorInstitutionId, originatorId);
      for (const dbMember of dbMembers) {
        const mId = dbMember.getInt("id");
        if (!notifiedIds[mId]) {
          institutionMembersToNotify.add(dbMember);
          notifiedIds[mId] = true;
        }
      }
    }

    if (institutionMembersToNotify.size() > 0) {
      notifications.notifyRecipients(
        institutionMembersToNotify,
        originatorId,
        originatorUid,
        originatorUsername,
        typeCode,
        title,
        messages[typeCode],
        extraMap
      );
    }
  }

  _db.execute("DELETE FROM notification_queue WHERE id = ?::int", queueId);
}

_out.json(_val.map().set("result", true));
