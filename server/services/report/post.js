import { _req, _db, _val } from "@netuno/server-types";

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const loggedUser = people.getLogged();

if (!loggedUser) {
  response.stopWithUserNotFound();
}

const loggedPeopleId = loggedUser.getInt("id");

const entityTypeCode = _req.getString("entityType");
const entityUid = _req.getUID("entityUid");
const reasonCode = _req.getString("reason");
const description = _req.getString("description");

const dbEntityType = _db.queryFirst(`
  SELECT id, code FROM report_entity_type WHERE code = ? AND active = true
`, entityTypeCode);

if (!dbEntityType) {
  response.stopWithBadRequest("invalid-entity-type");
}

let entityTypeId = dbEntityType.getInt("id");

let targetId = 0;
if (entityTypeCode === "people") {
  const item = _db.queryFirst(`SELECT id FROM people WHERE uid = ?::uuid AND active = true`, entityUid);
  if (item) targetId = item.getInt("id");
} else if (entityTypeCode === "post" || entityTypeCode === "comment") {
  const item = _db.queryFirst(`SELECT id, parent_id FROM post WHERE uid = ?::uuid AND active = true`, entityUid);
  if (item) {
    targetId = item.getInt("id");
    const resolvedTypeCode = item.getInt("parent_id") > 0 ? "comment" : "post";
    const resolvedEntityType = _db.queryFirst(`SELECT id FROM report_entity_type WHERE code = ? AND active = true`, resolvedTypeCode);
    if (resolvedEntityType) {
      entityTypeId = resolvedEntityType.getInt("id");
    }
  }
} else if (entityTypeCode === "forum_topic") {
  const item = _db.queryFirst(`SELECT id FROM forum_topic WHERE uid = ?::uuid AND active = true`, entityUid);
  if (item) targetId = item.getInt("id");
} else if (entityTypeCode === "forum_reply") {
  const item = _db.queryFirst(`SELECT id FROM forum_reply WHERE uid = ?::uuid AND active = true`, entityUid);
  if (item) targetId = item.getInt("id");
}

if (!targetId) {
  response.stopWithBadRequest("entity-not-found");
}

let reasonId = null;
if (reasonCode) {
  const dbReason = _db.queryFirst(`
    SELECT id FROM report_reason WHERE code = ? AND active = true
  `, reasonCode);
  if (dbReason) {
    reasonId = dbReason.getInt("id");
  }
}

if (!reasonId) {
  const defaultReason = _db.queryFirst(`
    SELECT id FROM report_reason WHERE active = true ORDER BY id ASC LIMIT 1
  `);
  if (defaultReason) {
    reasonId = defaultReason.getInt("id");
  }
}

const dbPendingStatus = _db.queryFirst(`
  SELECT id FROM report_status WHERE code = 'pending' AND active = true
`);
const pendingStatusId = dbPendingStatus ? dbPendingStatus.getInt("id") : 1;

let dbReport = _db.queryFirst(`
  SELECT id FROM report
  WHERE report_entity_type_id = ?::int
    AND entity = ?::int
    AND active = true
`, entityTypeId, targetId);

let reportId = null;

if (dbReport) {
  reportId = dbReport.getInt("id");
} else {
  reportId = _db.insert(
    "report",
    _val.map()
      .set("report_entity_type_id", entityTypeId)
      .set("entity", targetId)
      .set("report_status_id", pendingStatusId)
      .set("created_at", _db.timestamp())
  );
}

if (!reportId) {
  response.stopWithError(500, "report-not-created");
}

const reportItemId = _db.insert(
  "report_item",
  _val.map()
    .set("report_id", reportId)
    .set("reporter_id", loggedPeopleId)
    .set("report_reason_id", reasonId)
    .set("description", description || "")
    .set("moment", _db.timestamp())
);

if (!reportItemId) {
  response.stopWithError(500, "report-item-not-created");
}

response.successWithoutData();
