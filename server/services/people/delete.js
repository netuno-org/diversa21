import {_db, _val, _user, _exec, _out} from "@netuno/server-types"

const people_uid = _req.getUID("uid");

const dbPeople = _db.queryFirst(`
    SELECT * FROM people WHERE uid = ?::uuid
`, people_uid);

if (dbPeople) {
  _db.delete(
    "people",
    dbPeople.getInt("id")
  );
  _user.remove(dbPeople.getInt("people_user_id"));
  _out.json(
    _val.map()
      .set("result", true)
  );
} else {
 _header.status(404);
  _out.json(
    _val.map()
      .set("error", "not-exist")
  );
}
