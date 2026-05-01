import {_req, _db, _val, _header, _exec, _out} from "@netuno/server-types"

const peopleUid = _req.getUID("uid");

const dbPeople = _db.queryFirst(`
    SELECT people.uid,
        people.name,
        netuno_user.user,
        people.email,
        people.avatar,
        people.birth_date,
        city.uid AS "city",
        state.uid AS "state",
        country.uid AS "country",
        institution.uid AS "institution",
        netuno_group.code AS "group"
    FROM people 
        INNER JOIN netuno_user ON people.people_user_id = netuno_user.id 
        INNER JOIN institution ON people.institution_id = institution.id
        INNER JOIN city ON people.city_id = city.id
        INNER JOIN state ON city.state_id = state.id
        INNER JOIN country ON state.country_id = country.id
        INNER JOIN netuno_group ON netuno_user.group_id = netuno_group.id
    WHERE people.uid = ?::uuid
`, peopleUid);

if (!dbPeople) {
  _header.status(404)
  _out.json(
    _val.map()
    .set("error", "not-exist")
  );
  _exec.stop()
}

const data = _val.map()
  .set("uid", dbPeople.getString("uid"))
  .set("name", dbPeople.getString("name"))
  .set("email", dbPeople.getString("email"))
  .set("avatar", dbPeople.getString("avatar") !== '')
  .set("birthDate", dbPeople.getString("birth_date"))
  .set("city", dbPeople.getString("city"))
  .set("state", dbPeople.getString("state"))
  .set("country", dbPeople.getString("country"))
  .set("institution", dbPeople.getString("institution"))
  .set("username", dbPeople.getString("user"))
  .set("group", dbPeople.getString("group"))

_out.json(
  _val.map()
  .set("result", true)
  .set("data", data)
);
