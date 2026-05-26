import {_req, _db, _val, _out, _header, _exec} from "@netuno/server-types";

const uid = _req.getUID('uid');
const slug = _req.getString('slug');
const name = _req.getString("name");
const description = _req.getString("description");
const email = _req.getString("email");
const telephone = _req.getString("telephone");
const address = _req.getString("address");
const post_code = _req.getString("post_code");
const cityUid = _req.getUID("city");
const website = _req.getString("website");
const logo = _req.getFile("logo");
const cover_image = _req.getFile("cover_image");

if (!cityUid) {
    _header.status(400);
    _out.json(_val.map().set("error", "city-required"));
    _exec.stop();
}

const dbCity = _db.queryFirst(`
    SELECT id FROM city WHERE uid = ?::uuid
`, cityUid);
if (!dbCity) {
    _header.status(404);
    _out.json(_val.map().set("error", "city-not-found"));
    _exec.stop();
}

const cityId = dbCity.getInt("id");

// Find institution by uid OR slug
let dbInstitution = null;

if (slug) {
    dbInstitution = _db.queryFirst(`
        SELECT id, slug FROM institution WHERE slug = ?::text
    `, slug);
} else if (uid) {
    dbInstitution = _db.queryFirst(`
        SELECT id, slug FROM institution WHERE uid = ?::uuid
    `, uid);
} else {
    _header.status(400);
    _out.json(_val.map().set('error', 'uid-or-slug-required'));
    _exec.stop();
}

if (!dbInstitution) {
    _header.status(404);
    _out.json(_val.map().set('error', 'institution-not-found'));
    _exec.stop();
}

const institutionData = _val.map()
  .set("name", name)
  .set("description", description)
  .set("email", email);

if (telephone) {
  institutionData.set("telephone", telephone.replace(/\s/g, ''));
}
if (address) {
  institutionData.set("address", address);
}
if (post_code) {
  institutionData.set("post_code", post_code);
}
institutionData.set("city_id", cityId);
if (website) {
  institutionData.set("website", website);
}
if (logo) {
  institutionData.set("logo", logo);
}
if (cover_image) {
  institutionData.set("cover_image", cover_image);
}

_db.update("institution", dbInstitution.getInt("id"), institutionData);

_out.json(_val.map().set("result", true));