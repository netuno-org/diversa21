import { _req, _db, _val } from "@netuno/server-types";
import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

if (!permissions.canManageServices()) {
  response.stopWithPermissionDenied();
}

const uid = _req.getString('uid');

const dbService = _db.queryFirst(`
    SELECT id FROM service WHERE uid = ?::uuid
`, uid);

if (!dbService) {
  response.stopWithBadRequest('service-not-found');
}

_db.execute(`
    DELETE FROM service_favorite
    WHERE service_id = ?::int
`, dbService.getInt('id'));

_db.delete("service", dbService.getInt('id'));

response.successWithoutData();
