import {_req, _db, _exec, _header, _out, _val} from "@netuno/server-types";

const uid = _req.getString('uid')

const dbInstitution = _db.form('institution')
    .where(_db.where('uid').equal(uid))
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
