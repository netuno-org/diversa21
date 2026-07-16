import { _req, _db, _val, _group } from "@netuno/server-types";
import { mapInstitution } from "#core/lib/institution.js";
import response from "#core/lib/response.js";
import people from "#core/lib/people.js";

let page = _req.getInt('page', 1);
let name = _req.getString('name');
let countryUid = _req.getString('countryUid');
let stateUid = _req.getString('stateUid');
let cityUid = _req.getString('cityUid');

const pageSize = 10;
const offset = (page - 1) * pageSize;

const isAdmin = _group.code() === "super-admin";

let params = _val.list();

// TODO: Needs to use institution.js but note the count(*) line which cannot be
// inside the baseQuery of institution.js as it is only relevant here.
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
        city.name AS "city_name",
        state.uid AS "state_uid",
        state.name AS "state_name",
        country.uid AS "country_uid",
        country.name AS "country_name",
        institution.cover_image,
        institution.avatar,
        institution.active
    FROM institution
    INNER JOIN city ON institution.city_id = city.id
    INNER JOIN state ON city.state_id = state.id
    INNER JOIN country ON state.country_id = country.id
    WHERE 1 = 1
`;

if (!isAdmin) {
  const isManager = _group.code() === "management";
  if (isManager) {
    const dbPeople = people.getLogged();
    const dbPeopleData = dbPeople ? people.getData(dbPeople.getUID("uid")) : null;
    const loggedUserInstitutionUid = dbPeopleData ? dbPeopleData.getValues("institution")?.getUID("uid") : null;
    if (loggedUserInstitutionUid) {
      sqlQuery += " AND (institution.active = true OR institution.uid = ?::uuid) ";
      params.add(loggedUserInstitutionUid);
    } else {
      sqlQuery += " AND institution.active = true ";
    }
  } else {
    sqlQuery += " AND institution.active = true ";
  }
}

if (name) {
  sqlQuery += " AND institution.name ILIKE ?::text";
  params.add(`%${name}%`);
}
if (countryUid) {
  sqlQuery += " AND country.uid = ?::uuid";
  params.add(countryUid);
}
if (stateUid) {
  sqlQuery += " AND state.uid = ?::uuid";
  params.add(stateUid);
}
if (cityUid) {
  sqlQuery += " AND city.uid = ?::uuid";
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

const institutionList = _val.list();
for (const dbInstitution of dbInstitutions) {
  institutionList.add(mapInstitution(dbInstitution));
}

const totalCount = dbInstitutions.length === 0 ? 0 : dbInstitutions[0].getInt("total_count");

response.successWithData(
  _val.map()
    .set("items", institutionList)
    .set("pagination", { pageSize, totalCount })
);
