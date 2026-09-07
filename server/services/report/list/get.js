import { _db, _val, _req } from "@netuno/server-types";

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

if (!permissions.canManagePosts()) {
  response.stopWithPermissionDenied();
}

const statusFilter = _req.getString("status");
const entityTypeFilter = _req.getString("entityType");
const reportedUserSearch = _req.getString("reportedUser");
const reporterUserSearch = _req.getString("reporterUser");
const startDate = _req.getString("startDate");
const endDate = _req.getString("endDate");

const page = _req.getInt("page", 1);
const pageSize = 10;
const offset = page > 0 ? (page - 1) * pageSize : 0;

const resolveTargetDetails = (typeCode, targetId) => {
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
      return _val.map()
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
      return _val.map()
        .set("uid", item.getUID("uid"))
        .set("content", item.getString("content"))
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
      return _val.map()
        .set("uid", item.getUID("uid"))
        .set("title", item.getString("title"))
        .set("content", item.getString("content"))
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
      return _val.map()
        .set("uid", item.getUID("uid"))
        .set("content", item.getString("content"))
        .set("author", _val.map()
          .set("uid", item.getUID("author_uid"))
          .set("name", item.getString("author_name"))
          .set("username", item.getString("author_user"))
          .set("avatar", item.getString("author_avatar") !== "")
        );
    }
  }
  return null;
};

const queryParams = _val.list();
let whereClause = "WHERE r.active = true";

if (statusFilter && statusFilter !== "all") {
  whereClause += " AND rs.code = ?";
  queryParams.add(statusFilter);
}

if (entityTypeFilter && entityTypeFilter !== "all") {
  whereClause += " AND ret.code = ?";
  queryParams.add(entityTypeFilter);
}

if (startDate && startDate.trim() !== "") {
  whereClause += " AND r.created_at >= ?::timestamp";
  queryParams.add(`${startDate.trim()} 00:00:00`);
}

if (endDate && endDate.trim() !== "") {
  whereClause += " AND r.created_at <= ?::timestamp";
  queryParams.add(`${endDate.trim()} 23:59:59`);
}

if (reportedUserSearch && reportedUserSearch.trim() !== "") {
  const searchPattern = `%${reportedUserSearch.trim()}%`;
  whereClause += ` AND (
    (ret.code = 'people' AND EXISTS (
      SELECT 1 FROM people pe LEFT JOIN netuno_user nu ON pe.people_user_id = nu.id 
      WHERE pe.id = r.entity AND (pe.name ILIKE ? OR pe.email ILIKE ? OR nu.user ILIKE ?)
    ))
    OR (ret.code IN ('post', 'comment') AND EXISTS (
      SELECT 1 FROM post p INNER JOIN people pe ON p.people_id = pe.id LEFT JOIN netuno_user nu ON pe.people_user_id = nu.id
      WHERE p.id = r.entity AND (pe.name ILIKE ? OR pe.email ILIKE ? OR nu.user ILIKE ?)
    ))
    OR (ret.code = 'forum_topic' AND EXISTS (
      SELECT 1 FROM forum_topic t INNER JOIN people pe ON t.people_id = pe.id LEFT JOIN netuno_user nu ON pe.people_user_id = nu.id
      WHERE t.id = r.entity AND (pe.name ILIKE ? OR pe.email ILIKE ? OR nu.user ILIKE ?)
    ))
    OR (ret.code = 'forum_reply' AND EXISTS (
      SELECT 1 FROM forum_reply fr INNER JOIN people pe ON fr.people_id = pe.id LEFT JOIN netuno_user nu ON pe.people_user_id = nu.id
      WHERE fr.id = r.entity AND (pe.name ILIKE ? OR pe.email ILIKE ? OR nu.user ILIKE ?)
    ))
  )`;
  for (let i = 0; i < 12; i++) {
    queryParams.add(searchPattern);
  }
}

if (reporterUserSearch && reporterUserSearch.trim() !== "") {
  const reporterPattern = `%${reporterUserSearch.trim()}%`;
  whereClause += ` AND EXISTS (
    SELECT 1 FROM report_item ri_sub
    INNER JOIN people rep_p ON ri_sub.reporter_id = rep_p.id
    LEFT JOIN netuno_user rep_nu ON rep_p.people_user_id = rep_nu.id
    WHERE ri_sub.report_id = r.id AND ri_sub.active = true
      AND (rep_p.name ILIKE ? OR rep_p.email ILIKE ? OR rep_nu.user ILIKE ?)
  )`;
  queryParams.add(reporterPattern);
  queryParams.add(reporterPattern);
  queryParams.add(reporterPattern);
}

const countQuery = `
  SELECT COUNT(DISTINCT r.id) AS total_count
  FROM report r
  INNER JOIN report_entity_type ret ON r.report_entity_type_id = ret.id
  INNER JOIN report_status rs ON r.report_status_id = rs.id
  ${whereClause}
`;

const countResult = _db.queryFirst(countQuery, queryParams);
const totalCount = countResult ? countResult.getInt("total_count") : 0;

const statusCounts = _val.map().set("all", 0);

const activeStatuses = _db.query(`SELECT code FROM report_status WHERE active = true ORDER BY id ASC`);
for (const st of activeStatuses) {
  statusCounts.set(st.getString("code"), 0);
}

const summaryDb = _db.query(`
  SELECT 
    rs.code,
    COUNT(r.id) AS total
  FROM report r
  INNER JOIN report_status rs ON r.report_status_id = rs.id
  WHERE r.active = true
  GROUP BY rs.code
`);

let totalAll = 0;
for (const row of summaryDb) {
  const count = row.getInt("total");
  statusCounts.set(row.getString("code"), count);
  totalAll += count;
}
statusCounts.set("all", totalAll);

const sqlQuery = `
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
    res_p.name AS resolved_by_name,
    COUNT(ri.id) AS total_items,
    MAX(ri.moment) AS last_reported_at
  FROM report r
  INNER JOIN report_entity_type ret ON r.report_entity_type_id = ret.id
  INNER JOIN report_status rs ON r.report_status_id = rs.id
  LEFT JOIN people res_p ON r.resolved_by_id = res_p.id
  LEFT JOIN report_item ri ON r.id = ri.report_id AND ri.active = true
  ${whereClause}
  GROUP BY r.id, r.uid, r.entity, r.created_at, r.resolved_at, r.resolution_notes, ret.code, ret.title, rs.code, rs.title, res_p.uid, res_p.name
  ORDER BY total_items DESC, last_reported_at DESC
  LIMIT ${pageSize}
  OFFSET ${offset}
`;

const dbReports = _db.query(sqlQuery, queryParams);

const list = _val.list();
for (const rep of dbReports) {
  const targetDetails = resolveTargetDetails(rep.getString("entity_type_code"), rep.getInt("entity"));
  if (!targetDetails) continue;

  list.add(
    _val.map()
      .set("uid", rep.getUID("uid"))
      .set("entityType", rep.getString("entity_type_code"))
      .set("entityTypeTitle", rep.getString("entity_type_title"))
      .set("statusCode", rep.getString("status_code"))
      .set("statusTitle", rep.getString("status_title"))
      .set("totalItems", rep.getInt("total_items"))
      .set("createdAt", rep.getString("created_at"))
      .set("lastReportedAt", rep.getString("last_reported_at"))
      .set("resolvedAt", rep.getString("resolved_at"))
      .set("resolutionNotes", rep.getString("resolution_notes"))
      .set("resolvedBy", rep.getString("resolved_by_uid") ? _val.map()
        .set("uid", rep.getUID("resolved_by_uid"))
        .set("name", rep.getString("resolved_by_name")) : null
      )
      .set("content", targetDetails)
  );
}

response.successWithData(
  _val.map()
    .set("items", list)
    .set("statusCounts", statusCounts)
    .set("pagination", _val.map()
      .set("page", page)
      .set("pageSize", pageSize)
      .set("totalCount", totalCount)
    )
);
