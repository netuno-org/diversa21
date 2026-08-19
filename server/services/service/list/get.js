import { _req, _db, _val, _user } from "@netuno/server-types";
import response from "#core/lib/response.js";

const name = _req.getString('name');
const categoryUid = _req.getUID('categoryUid');
const cityUid = _req.getUID('cityUid');
const stateUid = _req.getUID('stateUid');
const countryUid = _req.getUID('countryUid');
const favoritesOnly = _req.getBoolean('favoritesOnly');
let page = _req.getInt('page', 1);

const pageSize = 10;
let offset = 0;
if (page > 0) {
  offset = (page - 1) * pageSize;
}

const userId = _user.id();
let personId = 0;
if (userId) {
  const dbPerson = _db.queryFirst("SELECT id FROM people WHERE user_id = ?", userId);
  if (dbPerson) {
    personId = dbPerson.getInt("id");
  }
}

const params = _val.list();

params.add(personId);

let sqlQuery = `
    SELECT
        count(*) over() AS total_count,
        service.uid,
        service.name,
        service.description,
        service.phone,
        service.website,
        service.instagram,
        service.active,
        service.created_at AS created_at,
        service_category.uid AS "category_uid",
        service_category.name AS "category_name",
        city.uid AS "city_uid",
        city.name AS "city_name",
        state.uid AS "state_uid",
        state.name AS "state_name",
        country.uid AS "country_uid",
        country.name AS "country_name",
        (CASE WHEN service_favorite.id IS NOT NULL THEN true ELSE false END) AS is_favorite
    FROM service
    INNER JOIN service_category ON service.category_id = service_category.id
    INNER JOIN city ON service.city_id = city.id
    INNER JOIN state ON city.state_id = state.id
    INNER JOIN country ON state.country_id = country.id
    LEFT JOIN service_favorite ON service_favorite.service_id = service.id AND service_favorite.person_id = ?::int
    WHERE 1 = 1
`;

if (favoritesOnly) {
  sqlQuery += ` AND service_favorite.id IS NOT NULL `;
}

if (name) {
  sqlQuery += ` AND service.name ILIKE ?::text `;
  params.add(`%${name}%`);
}

if (categoryUid) {
  sqlQuery += ` AND service_category.uid = ?::uuid `;
  params.add(categoryUid);
}

if (cityUid) {
  sqlQuery += ` AND city.uid = ?::uuid `;
  params.add(cityUid);
}

if (stateUid) {
  sqlQuery += ` AND state.uid = ?::uuid `;
  params.add(stateUid);
}

if (countryUid) {
  sqlQuery += ` AND country.uid = ?::uuid `;
  params.add(countryUid);
}

sqlQuery += `
    ORDER BY service.name ASC
    LIMIT ?::int
    OFFSET ?::int
`;
params.add(pageSize).add(offset);

const dbServices = _db.query(sqlQuery, params);

const services = _val.list();
for (const dbService of dbServices) {
  services.add(
    _val.map()
      .set('uid', dbService.getUID('uid'))
      .set('name', dbService.getString('name'))
      .set('description', dbService.getString('description'))
      .set('phone', dbService.getString('phone'))
      .set('website', dbService.getString('website'))
      .set('instagram', dbService.getString('instagram'))
      .set('active', dbService.getBoolean('active'))
      .set('createdAt', dbService.getString('created_at'))
      .set('isFavorite', dbService.getBoolean('is_favorite'))
      .set('category', _val.map()
        .set('uid', dbService.getUID('category_uid'))
        .set('name', dbService.getString('category_name'))
      )
      .set('city', _val.map()
        .set('uid', dbService.getUID('city_uid'))
        .set('name', dbService.getString('city_name'))
      )
      .set('state', _val.map()
        .set('uid', dbService.getUID('state_uid'))
        .set('name', dbService.getString('state_name'))
      )
      .set('country', _val.map()
        .set('uid', dbService.getUID('country_uid'))
        .set('name', dbService.getString('country_name'))
      )
  );
}

const totalCount = dbServices.length === 0 ? 0 : dbServices[0].getInt('total_count');

response.successWithData(
  _val.map()
    .set('items', services)
    .set('pagination', { pageSize, totalCount })
);