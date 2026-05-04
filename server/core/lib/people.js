import {_db, _group, _user, _val, _ws} from "@netuno/server-types";

export default {
  getData: (uid) => {
    const dbPeople = _db.queryFirst(`
      SELECT people.uid,
             people.name,
             netuno_user.user,
             people.email,
             people.avatar,
             people.birth_date,
             city.name AS "city",
             state.name AS "state",
             country.name AS "country",
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
    `, uid);
    if (dbPeople) {
      return _val.map()
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
        .set("group", dbPeople.getString("group"));
    }
    return null;
  },
  getLogged: () => {
    return _db.form("people")
      .where(_db.where("people_user_id").equal(_user.id))
      .first();
  },
  getByUID: (uid) => {
    return _db.form("people")
      .where(_db.where("uid").equal(uid))
      .first();
  },
  getByUsername: (username) => {
    return _db.queryFirst(`
      SELECT people.*
      FROM people 
          INNER JOIN netuno_user ON people.people_user_id = netuno_user.id 
      WHERE netuno_user."user" = ?::varchar;
    `, username);
  }
}
