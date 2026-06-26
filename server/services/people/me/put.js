import { _image, _req, _db, _val, _user, _out } from "@netuno/server-types"

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

const name = _req.getString("name");
const username = _req.getString("username");
const email = _req.getString("email");
const password = _req.getString("password");
const avatar = _req.getFile("avatar");
const cover_image = _req.getFile("cover_image");
const birthDate = _req.getString("birthDate");
const cityUid = _req.getUID("city");
const institutionUid = _req.getUID("institution");
const description = _req.getString("description");

const dbInstitution = _db.queryFirst(`
  SELECT id FROM institution 
  WHERE uid = ?::uuid
`, institutionUid)

if (!dbInstitution) {
  response.stopWithInstitutionNotFound();
}

const dbCity = _db.queryFirst(`
  SELECT id FROM city
  WHERE uid =?::uuid
`, cityUid)

if (!dbCity) {
  response.stopWithCityNotFound();
}

const userData = _user.get(_user.id());
userData
  .set("name", name)
  .set("user", username)
  .set("mail", email);

if (password.length > 0) {
  userData.set("pass", password);
  _user.update(
    _user.id(),
    userData,
    true
  );
} else {
  _user.update(
    _user.id(),
    userData
  );
}


const cityId = dbCity.getInt("id");

const peopleData = _val.map()
  .set("name", name)
  .set("description", description)
  .set("email", email)
  .set("birth_date", birthDate)
  .set("city_id", cityId)

const institutionId = dbInstitution.getInt("id");
// fail silently if not super-admin
if (permissions.canChangeOwnInstitution()) {
  peopleData
    .set("institution_id", institutionId)
}

if (avatar) {
  peopleData.set("avatar", avatar)
}

if (cover_image) {
  peopleData.set(
    "cover_image",
    _image
      .init(cover_image)
      .resize(720, 240)
      .file(cover_image.name(), "jpeg")
  )
}

const dbPeople = _db.queryFirst(`
    SELECT * FROM people WHERE people_user_id = ?::int
`, _user.id());

_db.update(
  "people",
  dbPeople.getInt("id"),
  peopleData
);

response.successWithoutData();
