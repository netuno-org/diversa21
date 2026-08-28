import { _req, _db, _val, _out } from "@netuno/server-types";
import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

if (!permissions.canManageServices()) {
  response.stopWithPermissionDenied();
}

const uid = _req.getString('uid');
const name = _req.getString('name');
const description = _req.getString('description');

if (!uid || !uid.trim()) {
  response.stopWithBadRequest('category-uid-required');
}

if (!name || !name.trim()) {
  response.stopWithBadRequest('category-name-required');
}

if (description && description.length > 250) {
  _out.json(_val.map().set("result", false).set("error", "A descrição não pode ter mais de 250 caracteres."));
  _req.stop();
}

const dbCategory = _db.queryFirst(`
    SELECT id FROM service_category WHERE uid = ?::uuid
`, uid);

if (!dbCategory) {
  response.stopWithBadRequest('category-not-found');
}

_db.update(
  "service_category",
  dbCategory.getInt('id'),
  _val.map()
    .set('name', name)
    .set('description', description)
);

response.successWithData(
  _val.map()
    .set('uid', uid)
    .set('name', name)
    .set('description', description)
);