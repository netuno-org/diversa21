import { _image, _req, _db, _val } from "@netuno/server-types";

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const loggedUser = people.getLogged();

if (!loggedUser) {
  response.stopWithUserNotFound();
}

const loggedPeopleId = loggedUser.getInt("id");

const currentPhotosCount = _db.queryFirst(`
  SELECT COUNT(*) AS total
  FROM people_photo
  WHERE people_id = ?::int
    AND active = true
`, loggedPeopleId).getInt("total");

if (currentPhotosCount >= people.maxGalleryPhotos()) {
  response.stopWithBadRequest("photos-limit-reached");
}

const photoFile = _req.getFile("photo");
if (!photoFile) {
  response.stopWithBadRequest("photo-required");
}

const img = _image.init(photoFile);
const originalWidth = img.width();
const originalHeight = img.height();

const targetWidth = 800;
const targetHeight = Math.round((originalHeight * targetWidth) / originalWidth);

const photoId = _db.insert(
  "people_photo",
  _val.map()
    .set("people_id", loggedPeopleId)
    .set("photo", img
      .resize(targetWidth, targetHeight)
      .file(photoFile.name(), "jpeg")
    )
    .set("moment", _db.timestamp())
);

if (!photoId) {
  response.stopWithError(500, "photo-not-uploaded");
}

const dbPhoto = _db.queryFirst(`
  SELECT uid, photo, moment
  FROM people_photo
  WHERE id = ?::int
`, photoId);

response.successWithData(
  _val.map()
    .set("uid", dbPhoto.getUID("uid"))
    .set("photo", dbPhoto.getString("photo"))
    .set("moment", dbPhoto.getString("moment"))
);
