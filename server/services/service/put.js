import { _req, _db, _val } from "@netuno/server-types";
import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

if (!permissions.canManageServices()) {
  response.stopWithPermissionDenied();
}

const uid = _req.getString('uid');
const name = _req.getString('name');
const categoryUid = _req.getString('category');
const cityUid = _req.getString('city');
const description = _req.getString('description');
const phone = _req.getString('phone');
const website = _req.getString('website');
const instagram = _req.getString('instagram');

const dbService = _db.queryFirst(`
    SELECT id FROM service WHERE uid = ?::uuid
`, uid);

if (!dbService) {
  response.stopWithBadRequest('service-not-found');
}

const category = _db.queryFirst(`
    SELECT id FROM service_category WHERE uid = ?::uuid
`, categoryUid);

if (!category) {
  response.stopWithBadRequest('service-category-not-found');
}

const city = _db.queryFirst(`
    SELECT id FROM city WHERE uid = ?::uuid
`, cityUid);

if (!city) {
  response.stopWithCityNotFound(); 
}

_db.update(
  "service",
  dbService.getInt('id'),
  _val.map()
    .set('name', name)
    .set('category_id', category.getInt('id'))
    .set('city_id', city.getInt('id'))
    .set('description', description)
    .set('phone', phone)
    .set('website', website)
    .set('instagram', instagram)
);

response.successWithData(
  _val.map()
    .set('uid', uid)
    .set('name', name)
);
