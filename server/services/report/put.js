import { _req, _db, _val } from "@netuno/server-types";

import people from "#core/lib/people.js";
import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

if (!permissions.canManageReports()) {
  response.stopWithPermissionDenied();
}

const loggedUser = people.getLogged();
const loggedPeopleId = loggedUser.getInt("id");

const reportUid = _req.getUID("reportUid");
const statusCode = _req.getString("status");
const resolutionNotes = _req.getString("resolutionNotes");

const dbStatus = _db.queryFirst(`
  SELECT id, code FROM report_status WHERE code = ? AND active = true
`, statusCode);

if (!dbStatus) {
  response.stopWithBadRequest("invalid-status");
}

const dbReport = _db.queryFirst(`
  SELECT id FROM report WHERE uid = ?::uuid AND active = true
`, reportUid);

if (!dbReport) {
  response.stopWithBadRequest("report-not-found");
}

const isResolvedOrRejected = statusCode === "resolved" || statusCode === "rejected";

const updateMap = _val.map()
  .set("report_status_id", dbStatus.getInt("id"));

if (resolutionNotes !== "") {
  updateMap.set("resolution_notes", resolutionNotes);
}

if (isResolvedOrRejected) {
  updateMap
    .set("resolved_by_id", loggedPeopleId)
    .set("resolved_at", _db.timestamp());
} else {
  updateMap
    .set("resolved_by_id", null)
    .set("resolved_at", null);
}

_db.update("report", dbReport.getInt("id"), updateMap);

response.successWithoutData();
