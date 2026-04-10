import {_req, _db, _exec, _header, _out, _val} from "@netuno/server-types";

const dbInstitutions = _db.form('institution')
    .order('institution.name', 'asc')
    .all()

const institutions = _val.list()

for (const dbInstitution of dbInstitutions) {
    institutions.add(
        _val.map()
            .set('active', dbInstitution.getString('active'))
            .set('logo', dbInstitution.get('logo'))
            .set('cover_image', dbInstitution.get('cover_image'))
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

_out.json(institutions)
