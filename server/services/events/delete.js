import { _req, _db } from "@netuno/server-types";
import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

if (!permissions.canManageServices()) {
  response.stopWithPermissionDenied();
}

const uid = _req.getUID('uid');
if (!uid) response.stopWithBadRequest('event-uid-required');

const dbEvent = _db.queryFirst('SELECT id FROM event WHERE uid = ?::uuid', uid);
if (!dbEvent) response.stopWithBadRequest('event-not-found');

const deleted = _db.delete('event', dbEvent.getInt('id'));
if (!deleted) response.stopWithBadRequest('event-not-deleted');

response.success();
