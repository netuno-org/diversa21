import { _req, _db, _val, _out, _header, _exec } from "@netuno/server-types";

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

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
const avatar = _req.getFile("avatar");
const cover_image = _req.getFile("cover_image");
const activeStr = _req.getString("active");

if (description.length > 2000) {
  response.stopWithTextTooLarge();
}

const dbCity = _db.queryFirst(`
    SELECT id FROM city WHERE uid = ?::uuid
`, cityUid);

if (!dbCity) {
  response.stopWithCityNotFound();
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
}

if (!dbInstitution) {
  response.stopWithInstitutionNotFound();
}

// Verify permissions
const targetInstitutionUid = dbInstitution.getString("uid");

if (!permissions.canManageInstitution(targetInstitutionUid)) {
  response.stopWithPermissionDenied();
}

const institutionData = _val.map()
  .set("name", name)
  .set("description", description)
  .set("email", email)
  .set("telephone", telephone.replace(/\s/g, ''))
  .set("address", address)
  .set("post_code", post_code)
  .set("city_id", cityId);

if (website) {
  institutionData.set("website", website);
}
if (avatar) {
  institutionData.set(
    "avatar",
    _image
      .init(avatar)
      .resize(500, 500)
      .file(avatar.name(), "jpeg")
  )
}
if (cover_image) {
  institutionData.set(
    "cover_image",
    _image
      .init(cover_image)
      .resize(1200, 400)
      .file(cover_image.name(), "jpeg")
  )
}
if (activeStr !== null && activeStr !== "") {
  institutionData.set("active", _req.getBoolean("active"));
}

_db.update("institution", dbInstitution.getInt("id"), institutionData);

response.successWithoutData();
