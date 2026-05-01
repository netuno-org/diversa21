import {_req, _db, _val, _user, _out} from "@netuno/server-types"

const name = _req.getString("name");
const username = _req.getString("username");
const email = _req.getString("email");
const password = _req.getString("password");
const avatar = _req.getFile("avatar");
const birthDate = _req.getString("birthDate");
const city = _req.getUID("city_id");
const institution = _req.getUID("institution_id")

const dbPeople = _db.queryFirst(`
    SELECT * FROM people WHERE people_user_id = ?::int
`, _user.id());

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

const peopleData = _val.map()
  .set("name", name)
  .set("email", email)
  .set("birth_date", birthDate)
  .set("city_id", city)
  .set("institution_id", institution)

if (avatar) {
  peopleData.set("avatar", avatar)
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
