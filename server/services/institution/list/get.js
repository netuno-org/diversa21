import {_req, _db, _val, _user, _out} from "@netuno/server-types";

let page = _req.getInt('page', 1);
let name = _req.getString('name');
let countryUid = _req.getString('countryUid');
let stateUid = _req.getString('stateUid');
let cityUid = _req.getString('cityUid');

const limit = 10;
const offset = (page - 1) * limit;

let whereClauses = [];
let params = [];

if (name) {
    whereClauses.push("institution.name ILIKE ?::text");
    params.push(`%${name}%`);
}
if (countryUid) {
    whereClauses.push("country.uid = ?::uuid");
    params.push(countryUid);
}
if (stateUid) {
    whereClauses.push("state.uid = ?::uuid");
    params.push(stateUid);
}
if (cityUid) {
    whereClauses.push("city.uid = ?::uuid");
    params.push(cityUid);
}

let whereSql = "";
if (whereClauses.length > 0) {
    whereSql = "WHERE " + whereClauses.join(" AND ");
}

const dbTotal = _db.query(`
    SELECT COUNT(*) as total
    FROM institution
    INNER JOIN city ON institution.city_id = city.id
    INNER JOIN state ON city.state_id = state.id
    INNER JOIN country ON state.country_id = country.id
    ${whereSql}
`, ...params);

const total = dbTotal[0].getInt('total');

const dbInstitutions = _db.query(`
    SELECT
        institution.uid,
        institution.slug,
        institution.name,
        institution.description,
        institution.email,
        institution.telephone,
        institution.website,
        institution.address,
        institution.post_code,
        city.name AS "city",
        state.name AS "state",
        country.name AS "country",
        institution.cover_image,
        institution.logo,
        institution.active
    FROM institution
    INNER JOIN city ON institution.city_id = city.id
    INNER JOIN state ON city.state_id = state.id
    INNER JOIN country ON state.country_id = country.id
    ${whereSql}
    ORDER BY institution.name ASC
    LIMIT 10
    OFFSET ?::int
`, ...params, offset);

const institutions = _val.list()

for (const dbInstitution of dbInstitutions) {
    institutions.add(
        _val.map()
            .set('active', dbInstitution.getString('active'))
            .set('logo', dbInstitution.get('logo'))
            .set('cover_image', dbInstitution.get('cover_image'))
            .set('uid', dbInstitution.getString('uid'))
            .set('slug', dbInstitution.getString('slug'))
            .set('country', dbInstitution.getString('country'))
            .set('state', dbInstitution.getString('state'))
            .set('city', dbInstitution.getString('city'))
            .set('post_code', dbInstitution.getString('post_code'))
            .set('address', dbInstitution.getString('address'))
            .set('website', dbInstitution.getString('website'))
            .set('telephone', dbInstitution.getString('telephone'))
            .set('email', dbInstitution.getString('email'))
            .set('description', dbInstitution.getString('description'))
            .set('name', dbInstitution.getString('name'))
    )
}

_out.json(
  _val.map()
    .set('result', true)
    .set('total', total)
    .set('data', institutions)
)