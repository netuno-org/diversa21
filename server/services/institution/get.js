import {_req, _db, _exec, _header, _out, _val} from "@netuno/server-types";

const uid = _req.getUID('uid');

const dbInstitutions = _db.query(`
    SELECT
        institution.uid,
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
    WHERE institution.uid = ?::uuid
`, uid);

if (!dbInstitutions || dbInstitutions.length === 0) {
    _header.status(404);
    _out.json(
        _val.map()
            .set('error', 'institution-not-found')
    )
    _exec.stop()
}

const dbInstitution = dbInstitutions[0];

_out.json(
  _val.map()
  .set('result', true)
  .set('data',
    _val.map()
    .set('uid', dbInstitution.getString('uid'))
    .set('name', dbInstitution.getString('name'))
    .set('description', dbInstitution.getString('description'))
    .set('email', dbInstitution.getString('email'))
    .set('telephone', dbInstitution.getString('telephone'))
    .set('website', dbInstitution.getString('website'))
    .set('address', dbInstitution.getString('address'))
    .set('post_code', dbInstitution.getString('post_code'))
    .set('city', dbInstitution.getString('city'))
    .set('state', dbInstitution.getString('state'))
    .set('country', dbInstitution.getString('country'))
    .set('cover_image', dbInstitution.getString('cover_image'))
    .set('logo', dbInstitution.getString('logo'))
    .set('active', dbInstitution.getString('active'))
  )
)
