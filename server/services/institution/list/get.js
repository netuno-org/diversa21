import {_req, _db, _val, _user, _out} from "@netuno/server-types";

let page = _req.getInt('page', 0);

if (page > 0) {
    page *= 10;
}

const dbInstitutions = _db.query(`
    SELECT uid, name, description, email, telephone, website, 
           address, post_code, city, state, country, 
           cover_image, logo, active
    FROM institution
    ORDER BY name ASC
    LIMIT 10
    OFFSET ?::int
`, page);

const institutions = _val.list()

for (const dbInstitution of dbInstitutions) {
    institutions.add(
        _val.map()
            .set('active', dbInstitution.getString('active'))
            .set('logo', dbInstitution.get('logo'))
            .set('cover_image', dbInstitution.get('cover_image'))
            .set('uid' , dbInstitution.getString('uid'))
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
    .set('data', institutions)
)