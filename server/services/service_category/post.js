import { _req, _db, _val } from "@netuno/server-types";
import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

if (!permissions.canManageServiceCategories()) {
  response.stopWithPermissionDenied();
}

const name = _req.getString('name');
const description = _req.getString('description');

if (!name || !name.trim()) {
  response.stopWithBadRequest('service-category-name-required');
}

const categoryId = _db.insert(
  "service_category",
  _val.map()
    .set('name', name)
    .set('description', description)
);

if (!categoryId) {
  response.stopWithBadRequest('service-category-not-created');
}

const dbCategory = _db.queryFirst(`
    SELECT uid, name, description
    FROM service_category
    WHERE id = ?::int
`, categoryId);

response.successWithData(
  _val.map()
    .set('uid', dbCategory.getUID('uid'))
    .set('name', dbCategory.getString('name'))
    .set('description', dbCategory.getString('description'))
);
