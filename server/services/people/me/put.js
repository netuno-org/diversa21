import {_req, _db, _val, _user, _out} from "@netuno/server-types"

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

const name = _req.getString("name");
const username = _req.getString("username");
const email = _req.getString("email");
const password = _req.getString("password");
const avatar = _req.getFile("avatar");
const birthDate = _req.getString("birthDate");
const cityUid = _req.getUID("city");
const institutionUid = _req.getUID("institution");
const description = _req.getString("description");

const dbInstitution = _db.queryFirst(`
  SELECT id FROM institution 
  WHERE uid = ?::uuid
`, institutionUid)

if (!dbInstitution) {
  _header.status(404);
  _out.json(
    _val.map()
      .set("error", "institution-not-found")
  );
  _exec.stop();
}

const dbCity = _db.queryFirst(`
  SELECT id FROM city
  WHERE uid =?::uuid
`, cityUid)

if (!dbCity) {
  _header.status(404);
  _out.json(
    _val.map()
      .set("error", "city-not-found")
  );
  _exec.stop();
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

const dbPeople = _db.queryFirst(`
    SELECT * FROM people WHERE people_user_id = ?::int
`, _user.id());

_db.update(
  "people",
  dbPeople.getInt("id"),
  peopleData
);

response.successWithoutData();
