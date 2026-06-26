import { _db, _group, _user, _val, _ws } from "@netuno/server-types";

export default {
  getData: (uid) => {
    const dbPeople = _db.queryFirst(`
      SELECT people.uid,
          people.name,
          netuno_user.user,
          people.description,
          people.email,
          people.avatar,
          people.cover_image,
          people.birth_date,
          city.uid AS "city_uid",
          state.uid AS "state_uid",
          country.uid AS "country_uid",
          city.name AS "city_name",
          state.name AS "state_name",
          country.name AS "country_name",
          institution.uid AS "institution_uid",
          institution.name AS "institution_name",
          institution.slug AS "institution_slug",
          netuno_group.code AS "group_code",
          netuno_group.name AS "group_name",
          netuno_user.active as "active"
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
        .set("uid", dbPeople.getUID("uid"))
        .set("name", dbPeople.getString("name"))
        .set("username", dbPeople.getString("user"))
        .set("description", dbPeople.getString("description"))
        .set("group",
          _val.map()
            .set("code", dbPeople.getString("group_code"))
            .set("name", dbPeople.getString("group_name"))
        )
        .set("email", dbPeople.getString("email"))
        .set("avatar", dbPeople.getString("avatar") !== '')
        .set("cover_image", dbPeople.getString("cover_image") !== '')
        .set("birthDate", dbPeople.getString("birth_date"))
        .set("city",
          _val.map()
            .set("uid", dbPeople.getUID("city_uid"))
            .set("name", dbPeople.getString("city_name"))
        )
        .set("state",
          _val.map()
            .set("uid", dbPeople.getUID("state_uid"))
            .set("name", dbPeople.getString("state_name"))
        )
        .set("country",
          _val.map()
            .set("uid", dbPeople.getUID("country_uid"))
            .set("name", dbPeople.getString("country_name"))
        )
        .set("institution",
          _val.map()
            .set("uid", dbPeople.getUID("institution_uid"))
            .set("name", dbPeople.getString("institution_name"))
            .set("slug", dbPeople.getString("institution_slug"))
        )
        .set("active", dbPeople.getBoolean("active"))
    }
    return null;
  },
  getLogged: () => {
    return _db.form("people")
      .where(_db.where("people_user_id").equal(_user.id))
      .first();
  },
  getByUid: (uid) => {
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
  },
  createOrder: () => {
    let order = '';
    for (let i = 0; i < 7; i++) {
      order += Math.floor(Math.random() * 10)
    }
    return order;
  },
}
