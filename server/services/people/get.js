import {_db, _val, _user, _group, _header, _exec, _out} from "@netuno/server-types"

const people_uid = _req.getUID("uid");

var dbPeople;

if (people_uid) {
    dbPeople = _db.queryFirst(`
        SELECT * FROM people WHERE uid = ?::uuid
    `, people_uid);
} else {
    dbPeople = _db.queryFirst(`
      SELECT *
      FROM people
      WHERE people_user_id = ?::int
    `, _user.id);
}

if (!dbPeople) {
  _header.status(404)
  _exec.stop()
}

const data = _val.map()
      .set("uid", dbPeople.getString("uid"))
      .set("name", dbPeople.getString("name"))
      .set("email", dbPeople.getString("email"))
      .set("username", _user.get(_user.id()).getString("user"))
      .set("avatar", dbPeople.getString("avatar") !== '')
      .set("group", _group.code)
      .set("birthDate", dbPeople.getString("birth_date"))
      .set("city", dbPeople.getString("city"))
      .set("state", dbPeople.getString("state"))
      .set("country", dbPeople.getString("country"))

_out.json(
  _val.map()
    .set("result", true)
    .set("data", data)
);
