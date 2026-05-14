import {_req, _db, _val, _user, _header, _out} from "@netuno/server-types"
import permissions from "#core/lib/permissions.js";


// Validate user input

const name = _req.getString("name");
const username = _req.getString("username");
const email = _req.getString("email");
const password = _req.getString("password");
const birthDate = _req.getString("birthDate");
const cityUid = _req.getUID("city");
const institutionUid = _req.getUID("institution");
const groupCode = _req.getString("group");

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


const userEmailExists = _user.firstByMail(email);
const usernameExists = _user.firstByUser(username);

if (userEmailExists || usernameExists) {
  _header.status(409);
  _out.json(
    _val.map()
      .set("error", `${userEmailExists ? 'email' : 'user'}-already-exists`)
  );
  _exec.stop();
} 


// Verify permissions

if (!permissions.canCreateAnyUser() && !permissions.canCreateMember(groupCode, institutionUid)) {
    _header.status(403);
    _out.json(
      _val.map()
        .set("error", "permission denied")
    );
    _exec.stop();
}


// Create user account

const groupId = dbNetunoGroup.getInt("id")

const userData = _val.map()
  .set("name", name)
  .set("user", username)
  .set("pass", password)
  .set("mail", email)
  .set("active", true)
  .set("group_id", groupId);

const userId = _user.create(userData);


// Create user profile

const institutionId = dbInstitution.getInt("id");
const cityId = dbCity.getInt("id");

if (userId) {
  try {
    _db.insertIfNotExists(
      'people',
      _val.map()
        .set("name", name)
        .set("email", email)
        .set("people_user_id", userId)
        .set("birth_date", birthDate)
        .set("city_id", cityId)
        .set("institution_id", institutionId)
    );
  } catch (e) {
    _log.warn("error: user not created", e);
    _user.remove(userId); 
    _header.status(400);
    _out.json(
      _val.map()
        .set("error", `user not created`)
    );
    _exec.stop();
  }
}


_out.json(
  _val.map()
    .set("result", true)
);
