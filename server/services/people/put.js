import {_req, _db, _val, _user, _out} from "@netuno/server-types"

import permissions from "#core/lib/permissions.js";
import people from "#core/lib/people.js";
import response from "#core/lib/response.js";


// Validate user input

const uid = _req.getUID("uid");
const name = _req.getString("name");
const username = _req.getString("username");
const email = _req.getString("email");
const avatar = _req.getFile("avatar");
const cover_image = _req.getFile("cover_image");
const birthDate = _req.getString("birthDate");
const cityUid = _req.getUID("city");
const institutionUid = _req.getUID("institution");
const groupCode = _req.getString("group");
const active = _req.getBoolean("active");
const description = _req.getString("description");

const removeAvatar = _req.getBoolean("remove_avatar");
const removeCoverImage = _req.getBoolean("remove_cover_image");

if (description && description.length > 1000) {
  response.stopWithTextTooLarge();
}

const groups = ["member", "review", "management", "super-admin"];

if (!groups.includes(groupCode)) {
  _header.status(404);
  _out.json(
    _val.map()
      .set("error", "group-not-found")
  );
  _exec.stop();
}

const dbNetunoGroup = _group.firstByCode(groupCode);

if (!dbNetunoGroup) {
  _header.status(404);
  _out.json(
    _val.map()
      .set("error", "group-not-found")
  );
  _exec.stop();
}

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

const dbPeople = _db.queryFirst(`
    SELECT * FROM people WHERE uid = ?::uuid
`, uid);

if (!dbPeople) {
  _header.status(404);
  _out.json(
    _val.map()
      .set("error", "user-uid-not-found")
  );
  _exec.stop();
}

const userEmailExists = _db.queryFirst(`
    SELECT email from people
    WHERE 1 = 1
      AND email = ?::varchar
      AND uid <> ?::uuid
`, email, uid);

const usernameExists = _db.queryFirst(`
    SELECT netuno_user.user from netuno_user 
    INNER JOIN people 
    ON netuno_user.id = people_user_id
    WHERE 1 = 1
      AND netuno_user.user = ?::varchar
      AND people.uid <> ?::uuid
`, username, uid);

if (userEmailExists || usernameExists) {
  _header.status(409);
  _out.json(
    _val.map()
      .set("error", `${userEmailExists ? 'email' : 'user'}-already-exists`)
  );
  _exec.stop();
} 


// Verify permissions

if (!permissions.canManageUser(groupCode, institutionUid)) {
    _header.status(403);
    _out.json(
      _val.map()
        .set("error", "permission denied")
    );
    _exec.stop();
}


// Update user account

const peopleUserId = dbPeople.getInt("people_user_id");
const userData = _user.get(peopleUserId);

const groupId = dbNetunoGroup.getInt("id")

userData
  .set("name", name)
  .set("user", username)
  .set("mail", email)
  .set("active", active)

// redundant checking:
// if (permissions.canChangeUserGroup()) {
  userData
    .set("group_id", groupId);
// }

_user.update(
  peopleUserId,
  userData
);


// Update user profile

const institutionId = dbInstitution.getInt("id");
const cityId = dbCity.getInt("id");

const order = people.createOrder();

const peopleData = _val.map()
  .set("name", name)
  .set("description", description)
  .set("email", email)
  .set("birth_date", birthDate)
  .set("city_id", cityId)
  .set("active", active)
  .set("order", order)

// redundant checking:
// if (permissions.canChangeUserInstitution()) {
  peopleData 
    .set("institution_id", institutionId)
// }

if (avatar) {
  peopleData.set(
    "avatar",
    _image
      .init(avatar)
      .resize(500, 500)
      .file(avatar.name(), "jpeg")
  );
} else if (removeAvatar) {
  peopleData.set("avatar", "");
}

_log.info(`>>> removeAvatar recebido: ${removeAvatar}, avatar: ${avatar ? 'sim' : 'não'}`);

if (cover_image) {
  peopleData.set(
    "cover_image", 
    _image
      .init(cover_image)
      .resize(720, 240)
      .file(cover_image.name(), "jpeg")
  );
} else if (removeCoverImage) {
  peopleData.set("cover_image", "");
}

_db.update(
  "people",
  dbPeople.getInt("id"),
  peopleData
);


_out.json(
  _val.map()
    .set("result", true)
);
