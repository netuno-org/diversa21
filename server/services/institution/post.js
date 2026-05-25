import {_req, _db, _val, _out, _header, _exec} from "@netuno/server-types"

const name = _req.getString("name");
const description = _req.getString("description");
const email = _req.getString("email");
const telephone = _req.getString("telephone");
const address = _req.getString("address");
const post_code = _req.getString("post_code");
const city = _req.getUID("city");
const website = _req.getString("website");
const logo = _req.getFile("logo");
const cover_image = _req.getFile("cover_image");

const institutionData = _val.map()
  .set("name", name)
  .set("description", description)
  .set("email", email)
  .set("active", "true");

if (telephone) {
  institutionData.set("telephone", telephone);
}
if (address) {
  institutionData.set("address", address);
}
if (post_code) {
  institutionData.set("post_code", post_code);
}
if (city) {
  institutionData.set("city_id", city);
}
if (website) {
  institutionData.set("website", website);
}
if (logo) {
  institutionData.set("logo", logo);
}
if (cover_image) {
  institutionData.set("cover_image", cover_image);
}

const uid = _db.insert("institution", institutionData);

// Get the slug that was generated automatically by the database
const dbInstitution = _db.queryFirst(`
    SELECT uid, slug FROM institution WHERE id = ?
`, uid);

// TODO: retonar without-data
// begin
if (!dbInstitution) {
    _header.status(500);
    _out.json(_val.map().set("error", "failed-to-retrieve-institution"));
    _exec.stop();
}

_out.json(
  _val.map()
    .set("result", true)
    .set("data", _val.map()
        .set("uid", dbInstitution.getString("uid"))
        .set("slug", dbInstitution.getString("slug"))
    )
);
// end
