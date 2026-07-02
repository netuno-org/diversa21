import { _req, _db, _header, _exec, _out } from "@netuno/server-types";

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const uid = _req.getString("uid");

const loggedUserUid = people.getLogged().getUID("uid");

const dbNotification = _db.queryFirst(`
  SELECT notification.id
  FROM notification
  INNER JOIN people recipient ON notification.recipient_id = recipient.id
  WHERE notification.uid = ?::uuid
    AND recipient.uid = ?::uuid
`, uid, loggedUserUid);

if (!dbNotification) {
  _header.status(404);
  _out.json(
    { error: "notification-not-found" }
  );
  _exec.stop();
}

const notificationId = dbNotification.getInt("id");

const result = _db.execute(`
  UPDATE notification
  SET read_at = NOW()
  WHERE id = ?::int
`, notificationId);

if (!result) {
  _header.status(400);
  _out.json(
    { error: "notification-not-updated" }
  );
  _exec.stop();
}

response.successWithoutData();