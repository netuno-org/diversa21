import { _req, _db, _val } from "@netuno/server-types";
import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

if (!permissions.canManageServices()) {
  response.stopWithPermissionDenied();
}

const uid = _req.getUID('uid');
if (!uid) response.stopWithBadRequest('event-uid-required');

const dbEvent = _db.queryFirst('SELECT id FROM event WHERE uid = ?::uuid', uid);
if (!dbEvent) response.stopWithBadRequest('event-not-found');

const name = _req.getString('name');
const description = _req.getString('description');
const startDate = _req.getString('startDate');
const endDate = _req.getString('endDate');
const location = _req.getString('location');
const cityUid = _req.getUID('cityUid');

const data = _val.map();
if (name) data.set('name', name);
if (description) data.set('description', description);
if (startDate) data.set('start_date', startDate);
if (endDate) data.set('end_date', endDate);
if (location) data.set('location', location);
if (cityUid) {
  const dbCity = _db.queryFirst('SELECT id FROM city WHERE uid = ?::uuid', cityUid);
  if (dbCity) data.set('city_id', dbCity.getInt('id'));
}

const updated = _db.update('event', dbEvent.getInt('id'), data);
if (!updated) response.stopWithBadRequest('event-not-updated');

response.success();
