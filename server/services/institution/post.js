import {_req, _db, _val, _out} from "@netuno/server-types"

const name = _req.getString("name");
const description = _req.getString("description");
const email = _req.getString("email");
const telephone = _req.getString("telephone");
const address = _req.getString("address");
const post_code = _req.getString("post_code");
const city = _req.getString("city");
const state = _req.getString("state");
const country = _req.getString("country");
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
  institutionData.set("city", city);
}
if (state) {
  institutionData.set("state", state);
}
if (country) {
  institutionData.set("country", country);
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

_out.json(
  _val.map()
    .set("result", true)
    .set("data", _val.map().set("uid", uid))
);