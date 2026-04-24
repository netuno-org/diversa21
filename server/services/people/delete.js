import {_db, _val, _user, _out} from "@netuno/server-types"

const peopleUid = _req.getUID("uid");
const username = _req.getString("username");

let dbPeople;

if (peopleUid) {
  dbPeople = _db.queryFirst(`
    SELECT * FROM people
    WHERE uid = ?::uuid
  `, peopleUid);
}

if (username) {
  dbPeople = _db.queryFirst(`
    SELECT *, people.id as id
    FROM people INNER JOIN netuno_user
    ON people.people_user_id = netuno_user.id
    WHERE netuno_user.user = ?::varchar
  `, username);
}

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
