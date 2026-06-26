import { _req, _db, _val, _out, _header, _exec, _convert } from "@netuno/server-types"

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

if (!permissions.canCreateInstitutions()) response.stopWithPermissionDenied();

const name = _req.getString("name");

const description = _req.getString("description");

if (description && description.length > 2000) {
  response.stopWithTextTooLarge();
}

const email = _req.getString("email");
const telephone = _req.getString("telephone");
const address = _req.getString("address");
const post_code = _req.getString("post_code");
const cityUid = _req.getUID("city");
const website = _req.getString("website");
const avatar = _req.getFile("avatar");
const cover_image = _req.getFile("cover_image");
if (!cityUid) response.stopWithCityNotFound();

const dbCity = _db.queryFirst(`SELECT id FROM city WHERE uid = ?::uuid`, cityUid);

if (!dbCity) response.stopWithCityNotFound();

const cityId = dbCity.getInt("id");

if (!name) response.stopWithNameNotFound();

const slug = _convert.slug(name);

if (!email) response.stopWithEmailNotFound();

const institutionData = _val.map()
  .set("name", name)
  .set("description", description)
  .set("email", email)
  .set("active", "true")
  .set("slug", slug);

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
if (avatar) {
  institutionData.set("avatar", avatar);
}
if (cover_image) {
  institutionData.set("cover_image", cover_image);
}

const uid = _db.insert("institution", institutionData);

_db.execute("UPDATE institution SET slug = ? WHERE id = ?", slug, uid);

const dbInstitution = _db.queryFirst(`
SELECT uid, slug FROM institution WHERE id = ?
`, uid);

if (!dbInstitution) response.stopWithInstitutionNotFound();
const data = _val.map()
  .set("uid", dbInstitution.getString("uid"))
  .set("slug", dbInstitution.getString("slug"));

response.successWithData(data);
