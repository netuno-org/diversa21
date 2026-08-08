import { _req, _db, _val } from "@netuno/server-types";
import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

if (!permissions.canManageServices()) {
  response.stopWithPermissionDenied();
}

const name = _req.getString('name');
const categoryUid = _req.getString('category');
const cityUid = _req.getString('city');
const description = _req.getString('description');
const phone = _req.getString('phone');
const website = _req.getString('website');
const instagram = _req.getString('instagram');

if (!name || !name.trim()) {
  response.stopWithBadRequest('service-name-required');
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

const serviceId = _db.insert(
  "service",
  _val.map()
    .set('name', name)
    .set('category_id', category.getInt('id'))
    .set('city_id', city.getInt('id'))
    .set('description', description)
    .set('phone', phone)
    .set('website', website)
    .set('instagram', instagram)
);

if (!serviceId) {
  response.stopWithBadRequest('service-not-created');
}

const dbService = _db.queryFirst(`
    SELECT uid, name
    FROM service
    WHERE id = ?::int
`, serviceId);

response.successWithData(
  _val.map()
    .set('uid', dbService.getUID('uid'))
    .set('name', dbService.getString('name'))
);