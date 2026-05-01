import {_db, _val, _user, _group, _header, _exec, _out} from "@netuno/server-types"

const dbPeople = _db.queryFirst(`
  SELECT people.uid,
    people.name,
    people.email,
    people.avatar,
    people.birth_date,
    city.uid AS "city",
    state.uid AS "state",
    country.uid AS "country",
    institution.uid AS "institution"
  FROM people 
    INNER JOIN institution ON people.institution_id = institution.id
    INNER JOIN city ON people.city_id = city.id
    INNER JOIN state ON city.state_id = state.id
    INNER JOIN country ON state.country_id = country.id
  WHERE people_user_id = ?::int
`, _user.id);

if (!dbPeople) {
  _header.status(404)
  _out.json(
    _val.map()
      .set("error", "not-logged-in")
  );
  _exec.stop()
}

let data = _val.map()
  .set("uid", dbPeople.getString("uid"))
  .set("name", dbPeople.getString("name"))
  .set("email", dbPeople.getString("email"))
  .set("avatar", dbPeople.getString("avatar") !== '')
  .set("birthDate", dbPeople.getString("birth_date"))
  .set("city", dbPeople.getString("city"))
  .set("state", dbPeople.getString("state"))
  .set("country", dbPeople.getString("country"))
  .set("institution", dbPeople.getString("institution"))
  .set("username", _user.get(_user.id()).getString("user"))
  .set("group", _group.code)

_out.json(
  _val.map()
    .set("result", true)
    .set("data", data)
);
