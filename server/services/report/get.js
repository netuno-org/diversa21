import { _db, _val, _req } from "@netuno/server-types";

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

if (!permissions.canManageReports()) {
  response.stopWithPermissionDenied();
}

const reportUid = _req.getString("reportUid");

if (!reportUid) {
  response.stopWithBadRequest("reportUid-required");
}

const page = _req.getInt("page", 1);
const pageSize = 10;
const offset = page > 0 ? (page - 1) * pageSize : 0;

const dbReport = _db.queryFirst(`
  SELECT 
    r.id, 
    r.uid, 
    r.entity, 
    r.created_at, 
    r.resolved_at,
    r.resolution_notes,
    ret.code AS entity_type_code,
    ret.title AS entity_type_title,
    rs.code AS status_code,
    rs.title AS status_title,
    res_p.uid AS resolved_by_uid,
    res_p.name AS resolved_by_name
  FROM report r
  INNER JOIN report_entity_type ret ON r.report_entity_type_id = ret.id
  INNER JOIN report_status rs ON r.report_status_id = rs.id
  LEFT JOIN people res_p ON r.resolved_by_id = res_p.id
  WHERE r.uid = ?::uuid AND r.active = true
`, reportUid);

if (!dbReport) {
  response.stopWithBadRequest("report-not-found");
}

const reportId = dbReport.getInt("id");
const typeCode = dbReport.getString("entity_type_code");
const targetId = dbReport.getInt("entity");

let targetDetails = null;

if (typeCode === "people") {
  const item = _db.queryFirst(`
    SELECT 
      people.uid, 
      people.name, 
      netuno_user.user AS "username", 
      people.email, 
      people.avatar 
    FROM people 
    LEFT JOIN netuno_user ON people.people_user_id = netuno_user.id
    WHERE people.id = ?::int
  `, targetId);
  if (item) {
    targetDetails = _val.map()
      .set("uid", item.getUID("uid"))
      .set("name", item.getString("name"))
      .set("username", item.getString("username"))
      .set("email", item.getString("email"))
      .set("avatar", item.getString("avatar") !== "");
  }
} else if (typeCode === "post" || typeCode === "comment") {
  const item = _db.queryFirst(`
    SELECT 
      p.uid, 
      p.content, 
      p.moment,
      p.parent_id,
      pe.uid AS author_uid, 
      pe.name AS author_name, 
      nu.user AS author_user,
      pe.avatar AS author_avatar
    FROM post p
    INNER JOIN people pe ON p.people_id = pe.id
    LEFT JOIN netuno_user nu ON pe.people_user_id = nu.id
    WHERE p.id = ?::int
  `, targetId);
  if (item) {
    targetDetails = _val.map()
      .set("uid", item.getUID("uid"))
      .set("content", item.getString("content"))
      .set("moment", item.getString("moment"))
      .set("isComment", item.getInt("parent_id") > 0)
      .set("author", _val.map()
        .set("uid", item.getUID("author_uid"))
        .set("name", item.getString("author_name"))
        .set("username", item.getString("author_user"))
        .set("avatar", item.getString("author_avatar") !== "")
      );
  }
} else if (typeCode === "forum_topic") {
  const item = _db.queryFirst(`
    SELECT 
      t.uid, 
      t.title, 
      t.content, 
      t.moment, 
      pe.uid AS author_uid, 
      pe.name AS author_name, 
      nu.user AS author_user,
      pe.avatar AS author_avatar
    FROM forum_topic t
    INNER JOIN people pe ON t.people_id = pe.id
    LEFT JOIN netuno_user nu ON pe.people_user_id = nu.id
    WHERE t.id = ?::int
  `, targetId);
  if (item) {
    targetDetails = _val.map()
      .set("uid", item.getUID("uid"))
      .set("title", item.getString("title"))
      .set("content", item.getString("content"))
      .set("moment", item.getString("moment"))
      .set("author", _val.map()
        .set("uid", item.getUID("author_uid"))
        .set("name", item.getString("author_name"))
        .set("username", item.getString("author_user"))
        .set("avatar", item.getString("author_avatar") !== "")
      );
  }
} else if (typeCode === "forum_reply") {
  const item = _db.queryFirst(`
    SELECT 
      r.uid, 
      r.content, 
      r.moment, 
      pe.uid AS author_uid, 
      pe.name AS author_name, 
      nu.user AS author_user,
      pe.avatar AS author_avatar
    FROM forum_reply r
    INNER JOIN people pe ON r.people_id = pe.id
    LEFT JOIN netuno_user nu ON pe.people_user_id = nu.id
    WHERE r.id = ?::int
  `, targetId);
  if (item) {
    targetDetails = _val.map()
      .set("uid", item.getUID("uid"))
      .set("content", item.getString("content"))
      .set("moment", item.getString("moment"))
      .set("author", _val.map()
        .set("uid", item.getUID("author_uid"))
        .set("name", item.getString("author_name"))
        .set("username", item.getString("author_user"))
        .set("avatar", item.getString("author_avatar") !== "")
      );
  }
}

const countResult = _db.queryFirst(`
  SELECT COUNT(ri.id) AS total_count
  FROM report_item ri
  WHERE ri.report_id = ?::int AND ri.active = true
`, reportId);
const totalCount = countResult ? countResult.getInt("total_count") : 0;

const dbItems = _db.query(`
  SELECT 
    ri.uid,
    ri.description,
    ri.moment,
    rr.code AS reason_code,
    rr.title AS reason_title,
    p.uid AS reporter_uid,
    p.name AS reporter_name,
    nu.user AS reporter_user,
    p.avatar AS reporter_avatar
  FROM report_item ri
  INNER JOIN people p ON ri.reporter_id = p.id
  LEFT JOIN netuno_user nu ON p.people_user_id = nu.id
  LEFT JOIN report_reason rr ON ri.report_reason_id = rr.id
  WHERE ri.report_id = ?::int AND ri.active = true
  ORDER BY ri.moment DESC
  LIMIT ${pageSize}
  OFFSET ${offset}
`, reportId);

const itemsList = _val.list();
for (const item of dbItems) {
  itemsList.add(
    _val.map()
      .set("uid", item.getUID("uid"))
      .set("reasonCode", item.getString("reason_code"))
      .set("reasonTitle", item.getString("reason_title"))
      .set("description", item.getString("description"))
      .set("moment", item.getString("moment"))
      .set("reporter", _val.map()
        .set("uid", item.getUID("reporter_uid"))
        .set("name", item.getString("reporter_name"))
        .set("username", item.getString("reporter_user"))
        .set("avatar", item.getString("reporter_avatar") !== "")
      )
  );
}

const dbHistory = _db.query(`
  SELECT
    rh.uid,
    rh.notes,
    rh.moment,
    rs.code AS status_code,
    rs.title AS status_title,
    p.uid AS people_uid,
    p.name AS people_name
  FROM report_history rh
  INNER JOIN report_status rs ON rh.report_status_id = rs.id
  INNER JOIN people p ON rh.people_id = p.id
  WHERE rh.report_id = ?::int AND rh.active = true
  ORDER BY rh.moment DESC
`, reportId);

const historyList = _val.list();
for (const item of dbHistory) {
  historyList.add(
    _val.map()
      .set("uid", item.getUID("uid"))
      .set("notes", item.getString("notes"))
      .set("moment", item.getString("moment"))
      .set("statusCode", item.getString("status_code"))
      .set("statusTitle", item.getString("status_title"))
      .set("people", item.getString("people_uid") ? _val.map()
        .set("uid", item.getUID("people_uid"))
        .set("name", item.getString("people_name")) : null
      )
  );
}

response.successWithData(
  _val.map()
    .set("uid", dbReport.getUID("uid"))
    .set("entityType", dbReport.getString("entity_type_code"))
    .set("entityTypeTitle", dbReport.getString("entity_type_title"))
    .set("statusCode", dbReport.getString("status_code"))
    .set("statusTitle", dbReport.getString("status_title"))
    .set("createdAt", dbReport.getString("created_at"))
    .set("resolvedAt", dbReport.getString("resolved_at"))
    .set("resolutionNotes", dbReport.getString("resolution_notes"))
    .set("resolvedBy", dbReport.getString("resolved_by_uid") ? _val.map()
      .set("uid", dbReport.getUID("resolved_by_uid"))
      .set("name", dbReport.getString("resolved_by_name")) : null
    )
    .set("content", targetDetails)
    .set("items", itemsList)
    .set("history", historyList)
    .set("pagination", _val.map()
      .set("page", page)
      .set("pageSize", pageSize)
      .set("totalCount", totalCount)
    )
);
