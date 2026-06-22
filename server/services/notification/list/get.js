import { _db, _map } from "@netuno/server-types"

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const loggedUserUid = people.getLogged().getUID("uid");
const page = _req.getInt('page', 1);

const pageSize = 5;

let offset = 0;
if (page > 0) {
  offset = (page - 1) * pageSize;
}

const dbNotifications = _db.query(`
  SELECT
      COUNT(*) OVER() as total_count,
      notification.uid AS uid,
      notification_type.code AS type,
      notification.title AS title,
      originator.uid AS originator,
      recipient.uid AS recipient,
      notification.extra AS extra,
      notification.content AS content,
      notification.read_at AS read_at,
      notification.sent_at AS sent_at
  FROM notification
  INNER JOIN people originator ON notification.originator_id = originator.id
  INNER JOIN people recipient ON notification.recipient_id = recipient.id
  INNER JOIN notification_type ON notification.type_id = notification_type.id
  LEFT JOIN notification_opt_out
      ON notification_opt_out.people_id = recipient.id
      AND notification_opt_out.type_id = notification_type.id
  WHERE recipient.uid = ?::uuid
  AND notification_opt_out.id IS NULL
  ORDER BY notification.sent_at 
  LIMIT ?::int OFFSET ?::int
`, loggedUserUid, pageSize, offset);

const list = _val.list();


for (const dbNotification of dbNotifications) {
  const notification = _val.map()
    .set("uid", dbNotification.getUID("uid"))
    .set("type", dbNotification.getString("type"))
    .set("title", dbNotification.getString("title"))
    .set("originator", dbNotification.getString("originator"))
    .set("recipient", dbNotification.getString("recipient"))
    .set("extra", dbNotification.getString("extra"))
    .set("content", dbNotification.getString("content"))
    .set("read_at", dbNotification.getString("read_at"))
    .set("sent_at", dbNotification.getString("sent_at"))

  list.add(notification);
}

const totalCount = dbNotifications.length > 0
  ? dbNotifications[0].getInt("total_count")
  : 0;

response.successWithData(
  _val.map()
    .set("items", list)
    .set("totalCount", totalCount)
    .set("pageSize", pageSize)
);
