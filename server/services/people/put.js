import {_req, _db, _val, _user, _out} from "@netuno/server-types"

const name = _req.getString("name");
const username = _req.getString("username");
const email = _req.getString("email");
const password = _req.getString("password");
const avatar = _req.getFile("avatar");
const birthDate = _req.getString("birthDate");
const city = _req.getString("city");
const state = _req.getString("state");
const country = _req.getString("country");

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

if (avatar) {
  peopleData.set("avatar", avatar)
}

// TODO: quando esses campos forem colocados como obrigatórios no futuro, remover os `if`s
if (birthDate) {
  peopleData.set("birth_date", birthDate);
}

if (birthDate) {
  peopleData.set("city", city);
}

if (birthDate) {
  peopleData.set("state", state);
}

if (birthDate) {
  peopleData.set("country", country);
}
// fim do TODO

_db.update(
  "people",
  dbPeople.getInt("id"),
  peopleData
);

_out.json(
  _val.map()
    .set("result", true)
);
