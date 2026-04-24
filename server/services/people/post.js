import {_req, _db, _val, _user, _header, _out} from "@netuno/server-types"

const name = _req.getString("name");
const username = _req.getString("username");
const email = _req.getString("email");
const password = _req.getString("password");
const birthDate = _req.getString("birthDate");
const city = _req.getString("city");
const state = _req.getString("state");
const country = _req.getString("country");
const institutionUid = _req.getUID("institution");

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

const dbNetunoGroup = _group.firstByCode("member");

const userData = _val.map()
  .set("name", name)
  .set("user", username)
  .set("pass", password)
  .set("mail", email)
  .set("active", true)
  .set("group_id", dbNetunoGroup.getInt("id"));

const user_id = _user.create(userData);

if (user_id) {
  try {
    const institutionId = _db.queryFirst(`
      SELECT id FROM institution 
      WHERE uid = ?::uuid
    `, institutionUid).getInt("id");

    _db.insertIfNotExists(
      'people',
      _val.map()
        .set("name", name)
        .set("email", email)
        .set("people_user_id", user_id)
        .set("birth_date", birthDate)
        .set("city", city)
        .set("state", state)
        .set("country", country)
        .set("institution_id", institutionId)
    );
  } catch (e) {
    _log.warn("error: user not created", e);
    _user.remove(user_id); 
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
