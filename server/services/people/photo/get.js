import { _req, _db, _val } from "@netuno/server-types";

import response from "#core/lib/response.js";
import people from "#core/lib/people.js";

const uid = _req.getUID("uid");

if (!uid) {
  response.stopWithBadRequest("uid-required");
}

const dbPeople = _db.queryFirst(`
  SELECT id
  FROM people
  WHERE uid = ?::uuid
    AND active = true
`, uid);

if (!dbPeople) {
  response.stopWithUserNotFound();
}

const dbPhotos = _db.query(`
  SELECT uid, photo, moment
  FROM people_photo
  WHERE people_id = ?::int
    AND active = true
  ORDER BY moment DESC
`, dbPeople.getInt("id"));

const photos = _val.list();
for (const dbPhoto of dbPhotos) {
  photos.add(
    _val.map()
      .set("uid", dbPhoto.getUID("uid"))
      .set("photo", dbPhoto.getString("photo"))
      .set("moment", dbPhoto.getString("moment"))
  );
}

response.successWithData(
  _val.map()
    .set("maxGalleryPhotos", people.maxGalleryPhotos())
    .set("items", photos)
);
