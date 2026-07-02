import { _req, _db, _header, _exec, _out } from "@netuno/server-types";

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const type = _req.getString("type");

const dbNotificationType = _db.queryFirst(`
  SELECT id FROM notification_type
  WHERE code = ?::varchar
`, type);

if (!dbNotificationType) {
  _header.status(404);
  _out.json(
    { error: "notification-type-not-found" }
  );
  _exec.stop();
}

const typeId = dbNotificationType.getInt("id");

const dbPeople = people.getLogged();

if (!dbPeople) {
  _header.status(404);
  _out.json(
    { error: "people-not-found" }
  );
  _exec.stop();
}

const peopleId = dbPeople.getInt("id");

const dbOptOut = _db.queryFirst(`
  SELECT id FROM notification_opt_out
  WHERE people_id = ?::int AND type_id = ?::int
`, peopleId, typeId);

if (dbOptOut) {
  _header.status(409);
  _out.json(
    { error: "notification-opt-out-already-exists" }
  );
  _exec.stop();
}

const result = _db.insert("notification_opt_out",
  _val.map()
    .set("people_id", peopleId)
    .set("type_id", typeId)
);

if (!result) {
  _header.status(400);
  _out.json(
    { error: "notification-opt-out-not-created" }
  );
  _exec.stop();
}

response.successWithoutData();