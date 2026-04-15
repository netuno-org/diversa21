import {_db, _val, _user, _group, _header, _exec, _out} from "@netuno/server-types"

const peopleUid = _req.getUID("uid");
const username = _req.getString("username");

var dbPeople;

if (peopleUid && username) {
    _header.status(400)
    _exec.stop();
}

if (peopleUid) {
    dbPeople = _db.queryFirst(`
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
            INNER join institution on people.institution_id = institution.id
            INNER JOIN netuno_group ON netuno_user.group_id = netuno_group.id
        WHERE people.uid = ?::uuid
    `, peopleUid);
} else if (username) {
    dbPeople = _db.queryFirst(`
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
            INNER join institution on people.institution_id = institution.id
            INNER JOIN netuno_group ON netuno_user.group_id = netuno_group.id
        WHERE netuno_user."user" = ?::varchar;
    `, username);
} else {
    dbPeople = _db.queryFirst(`
        SELECT people.uid,
            people.name,
            people.email,
            people.avatar,
            people.birth_date,
            people.city,
            people.state,
            people.country,
            institution.uid AS "institution"
        FROM people 
            INNER join institution on people.institution_id = institution.id
        WHERE people_user_id = ?::int
    `, _user.id);
}

if (!dbPeople) {
  _header.status(404)
  _exec.stop()
}

var data = _val.map();

if (peopleUid || username) {
    data
        .set("username", dbPeople.getString("user"))
        .set("group", dbPeople.getString("group"))
} else {
    data
        .set("username", _user.get(_user.id()).getString("user"))
        .set("group", _group.code)
}

data
    .set("uid", dbPeople.getString("uid"))
    .set("name", dbPeople.getString("name"))
    .set("email", dbPeople.getString("email"))
    .set("avatar", dbPeople.getString("avatar") !== '')
    .set("birthDate", dbPeople.getString("birth_date"))
    .set("city", dbPeople.getString("city"))
    .set("state", dbPeople.getString("state"))
    .set("country", dbPeople.getString("country"))
    .set("institution", dbPeople.getString("institution"))

_out.json(
  _val.map()
    .set("result", true)
    .set("data", data)
);
