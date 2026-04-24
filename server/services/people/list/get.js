import {_db, _val, _out} from "@netuno/server-types"

const name = _req.getString('name');
const city = _req.getString('city');
const state = _req.getString('state');
const country = _req.getString('country');
let page = _req.getInt('page', 1);

if (page > 0) {
  page = (page - 1) * 10;
}

const dbPeople = _db.query(`
  SELECT people.uid,
    people.name,
    netuno_user.user,
    people.email,
    people.avatar,
    people.birth_date,
    people.city,
    people.state,
    people.country,
    institution.uid AS "institution",
    netuno_group.code AS "group"
  FROM people
    INNER JOIN netuno_user ON people.people_user_id = netuno_user.id
    INNER JOIN netuno_group ON netuno_user.group_id = netuno_group.id
    INNER JOIN institution on people.institution_id = institution.id
  WHERE
    people.name ILIKE ?::varchar AND
    people.city ILIKE ?::varchar AND
    people.state ILIKE ?::varchar AND
    people.country ILIKE ?::varchar
  ORDER BY people.name ASC
  LIMIT 10 
  OFFSET ?::int
`,
`%${name}%`,
`%${city}%`,
`%${state}%`,
`%${country}%`,
page);

const people = _val.list();
for (const dbPerson of dbPeople) {
  people.add(
    _val.map()
      .set("uid", dbPerson.getString("uid"))
      .set("name", dbPerson.getString("name"))
      .set("username", dbPerson.getString("user"))
      .set("email", dbPerson.getString("email"))
      .set("avatar", dbPerson.getString("avatar") !== '')
      .set("birthDate", dbPerson.getString("birth_date"))
      .set("city", dbPerson.getString("city"))
      .set("state", dbPerson.getString("state"))
      .set("country", dbPerson.getString("country"))
      .set("institution", dbPerson.getString("institution"))
      .set("group", dbPerson.getString("group"))
  )
}
_out.json(people);
