import { _req, _db, _val } from "@netuno/server-types";

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const uid = _req.getUID("uid");

const loggedUser = people.getLogged();

if (!loggedUser) {
  response.stopWithUserNotFound();
}

const loggedPeopleId = loggedUser.getInt("id");

const dbPhoto = _db.queryFirst(`
  SELECT id, people_id
  FROM people_photo
  WHERE uid = ?::uuid
    AND active = true
`, uid);

if (!dbPhoto) {
  response.stopWithNotExist();
}

if (dbPhoto.getInt("people_id") !== loggedPeopleId) {
  response.stopWithPermissionDenied();
}

_db.delete("people_photo", dbPhoto.getInt("id"));

response.successWithoutData();
