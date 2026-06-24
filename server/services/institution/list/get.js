import { _req, _db, _val, _user, _out } from "@netuno/server-types";

import response from "#core/lib/response.js";

let page = _req.getInt('page', 1);
let name = _req.getString('name');
let countryUid = _req.getString('countryUid');
let stateUid = _req.getString('stateUid');
let cityUid = _req.getString('cityUid');

const pageSize = 10;
const offset = (page - 1) * pageSize;

let params = _val.list();

let sqlQuery = `
    SELECT
        count(*) over() as total_count,
        institution.uid,
        institution.slug,
        institution.name,
        institution.description,
        institution.email,
        institution.telephone,
        institution.website,
        institution.address,
        institution.post_code,
        city.uid AS "city_uid",
        city.name AS "city",
        state.uid AS "state_uid",
        state.name AS "state",
        country.uid AS "country_uid",
        country.name AS "country",
        institution.banner,
        institution.avatar,
        institution.active
    FROM institution
    INNER JOIN city ON institution.city_id = city.id
    INNER JOIN state ON city.state_id = state.id
    INNER JOIN country ON state.country_id = country.id
    WHERE 1 = 1
`;

if (name) {
  sqlQuery += " AND institution.name ILIKE ?::text ";
  params.add(`%${name}%`);
}
if (countryUid) {
  sqlQuery += " AND country.uid = ?::uuid ";
  params.add(countryUid);
}
if (stateUid) {
  sqlQuery += " AND state.uid = ?::uuid ";
  params.add(stateUid);
}
if (cityUid) {
  sqlQuery += " AND city.uid = ?::uuid ";
  params.add(cityUid);
}

sqlQuery += `
    ORDER BY institution.name ASC
    LIMIT ?::int
    OFFSET ?::int
`;
params
  .add(pageSize)
  .add(offset)

const dbInstitutions = _db.query(sqlQuery, params);

const institutions = _val.list()
for (const dbInstitution of dbInstitutions) {
  institutions.add(
    _val.map()
      .set('active', dbInstitution.getString('active'))
      .set('avatar', dbInstitution.getString('avatar') !== '')
      .set('banner', dbInstitution.getString('banner') !== '')
      .set('uid', dbInstitution.getString('uid'))
      .set('slug', dbInstitution.getString('slug'))
      .set('country',
        _val.map()
          .set('uid', dbInstitution.getString('country_uid'))
          .set('name', dbInstitution.getString('country'))
      )
      .set('state',
        _val.map()
          .set('uid', dbInstitution.getString('state_uid'))
          .set('name', dbInstitution.getString('state'))
      )
      .set('city',
        _val.map()
          .set('uid', dbInstitution.getString('city_uid'))
          .set('name', dbInstitution.getString('city'))
      )
      .set('post_code', dbInstitution.getString('post_code'))
      .set('address', dbInstitution.getString('address'))
      .set('website', dbInstitution.getString('website'))
      .set('telephone', dbInstitution.getString('telephone'))
      .set('email', dbInstitution.getString('email'))
      .set('description', dbInstitution.getString('description'))
      .set('name', dbInstitution.getString('name'))
  )
}

const result = _val.map();
const totalCount = dbInstitutions.length === 0 ? 0 : dbInstitutions[0].getInt("total_count");
result.set("items", institutions);
result.set("pagination", { pageSize, totalCount });

response.successWithData(result);
