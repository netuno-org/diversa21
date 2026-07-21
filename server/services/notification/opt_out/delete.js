import { _req, _db, _header, _exec } from "@netuno/server-types";

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const typeCode = _req.getString("type");
if (!typeCode || typeCode.trim() === "") {
  _header.status(400);
  _exec.stop();
}

const loggedUser = people.getLogged();
const loggedUserId = loggedUser.getInt("id");

const dbType = _db.queryFirst(`
  SELECT id FROM notification_type WHERE code = ? AND active = true
`, typeCode);

if (!dbType) {
  _header.status(404);
  _exec.stop();
}

const typeId = dbType.getInt("id");

_db.execute(`
  DELETE FROM notification_opt_out
  WHERE people_id = ?::int AND type_id = ?::int
`, loggedUserId, typeId);

response.successWithoutData();