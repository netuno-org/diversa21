import {_req, _db, _exec, _header, _out, _val} from "@netuno/server-types";

const uid = _req.getString('uid')

const dbInstitution = _db.form('institution')
    .where(_db.where('uid').equal(uid))
    .get('institution.uid')
    .get('institution.name')
    .get('institution.description')
    .get('institution.email')
    .get('institution.telephone')
    .get('institution.website')
    .get('institution.address')
    .get('institution.post_code')
    .get('institution.city')
    .get('institution.state')
    .get('institution.country')
    .get('institution.cover_image')
    .get('institution.logo')
    .get('institution.active')
    .first()

if (!dbInstitution) {
    _header.status(404)
    _out.json(
        _val.map()
          .set('error', true)
          .set('code', 'institution-not-found')
    )
    _exec.stop()
}

_out.json(
    _val.map()
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
        .set('cover_image', dbInstitution.get('cover_image'))
        .set('logo', dbInstitution.get('logo'))
        .set('active', dbInstitution.getString('active'))
)
