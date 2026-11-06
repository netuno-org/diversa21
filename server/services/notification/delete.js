import { _db, _val, _out, _req, _exec } from "@netuno/server-types";
import people from "#core/lib/people.js";
import notifications from "#core/lib/notifications.js";

const uid = _req.getString("uid");

const dbLoggedInPeople = people.getLogged();

const dbNotification = _db.form("notification")
  .where(
    _db.where("uid").equal(uid)
      .and("recipient_id").equal(dbLoggedInPeople.getInt("id"))
  )
  .first();

if (!dbNotification) {
  _out.json(_val.map().set("result", false).set("error", "not-found"));
  _exec.stop();
}

_db.form("notification")
  .where(_db.where("id").equal(dbNotification.getInt("id")))
  .set("active", false)
  .update();

const totalUnread = notifications.getUnreadTotal(dbLoggedInPeople);

people.wsSendService(
  dbLoggedInPeople,
  _val.map()
    .set("service", "notification/unread-count")
    .set("content", _val.map().set("total", totalUnread))
);

_out.json(
  _val.map()
    .set("result", true)
    .set("total", totalUnread)
);
