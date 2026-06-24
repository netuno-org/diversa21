import { _req, _db, _exec, _header, _out, _val } from "@netuno/server-types";

import response from "#core/lib/response.js";

const slug = _req.getString('slug');

if (!slug) response.stopWithSlugNotFound();

let sqlQuery = `
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
    WHERE institution.slug = ?::text
`;

const dbInstitution = _db.queryFirst(sqlQuery, slug);

if (!dbInstitution) response.stopWithInstitutionNotFound();

const data = _val.map()
  .set('uid', dbInstitution.getString('uid'))
  .set('slug', dbInstitution.getString('slug'))
  .set('name', dbInstitution.getString('name'))
  .set('description', dbInstitution.getString('description'))
  .set('email', dbInstitution.getString('email'))
  .set('telephone', dbInstitution.getString('telephone'))
  .set('website', dbInstitution.getString('website'))
  .set('address', dbInstitution.getString('address'))
  .set('post_code', dbInstitution.getString('post_code'))
  .set('city',
    _val.map()
      .set('uid', dbInstitution.getString('city_uid'))
      .set('name', dbInstitution.getString('city'))
  )
  .set('state',
    _val.map()
      .set('uid', dbInstitution.getString('state_uid'))
      .set('name', dbInstitution.getString('state'))
  )
  .set('country',
    _val.map()
      .set('uid', dbInstitution.getString('country_uid'))
      .set('name', dbInstitution.getString('country'))
  )
  .set('banner', dbInstitution.getString('banner') !== '')
  .set('avatar', dbInstitution.getString('avatar') !== '')
  .set('active', dbInstitution.getString('active'));

response.successWithData(data);
