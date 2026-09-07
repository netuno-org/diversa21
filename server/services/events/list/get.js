import { _req, _db, _val, _user, _group } from "@netuno/server-types";
import { SUPER_ADMIN, MANAGEMENT } from "#core/lib/groups.js";
import response from "#core/lib/response.js";

const userId = _user.id();
let personId = null;
const groupCode = _group.code();
let isAdminOrManager = groupCode === SUPER_ADMIN || groupCode === MANAGEMENT;

if (userId) {
  const dbPerson = _db.queryFirst("SELECT id FROM people WHERE people_user_id = ?", userId);
  if (dbPerson) {
    personId = dbPerson.getInt('id');
  }
}

const term = _req.getString('term');
const location = _req.getString('location');
const page = _req.getInt('page', 1);
const pageSize = 10;
const offset = (page - 1) * pageSize;

let sql = `SELECT e.*, p.uid as host_uid, p.name as host_name, p.avatar as host_avatar 
           FROM event e 
           LEFT JOIN people p ON e.host_id = p.id 
           WHERE e.active = true`;
let countSql = `SELECT COUNT(*) as total FROM event e WHERE e.active = true`;
let params = [];

if (term) {
  sql += ` AND (e.name ILIKE ? OR e.description ILIKE ?)`;
  countSql += ` AND (e.name ILIKE ? OR e.description ILIKE ?)`;
  params.push(`%${term}%`, `%${term}%`);
}

if (location) {
  sql += ` AND e.location ILIKE ?`;
  countSql += ` AND e.location ILIKE ?`;
  params.push(`%${location}%`);
}

sql += ` ORDER BY e.created_at DESC LIMIT ? OFFSET ?`;

const dbCount = _db.queryFirst(countSql, ...params);
const total = dbCount ? dbCount.getLong('total') : 0;

const events = _db.query(sql, ...params, pageSize, offset);
const list = _val.list();

if (events) {
  for (let i = 0; i < events.size(); i++) {
    const row = events.get(i);
    const eventId = row.getInt('id');
    const hostId = row.getInt('host_id');

    let isGoing = false;
    if (personId) {
      const goingCheck = _db.queryFirst(
        "SELECT id FROM event_participant WHERE event_id = ? AND people_id = ? AND active = true",
        eventId, personId
      );
      isGoing = !!goingCheck;
    }

    const canEdit = isAdminOrManager || (personId && hostId === personId);

    list.add(_val.map()
      .set('id', eventId)
      .set('uid', row.getString('uid'))
      .set('name', row.getString('name'))
      .set('description', row.getString('description'))
      .set('location', row.getString('location'))
      .set('participantsCount', row.getInt('participants_count'))
      .set('startDate', row.getString('created_at'))
      .set('isGoing', isGoing)
      .set('canEdit', canEdit)
      .set('host', _val.map()
        .set('uid', row.getString('host_uid'))
        .set('name', row.getString('host_name'))
        .set('avatar', row.getString('host_avatar'))
      )
    );
  }
}

response.successWithData(
  _val.map()
    .set('items', list)
    .set('pagination', _val.map().set('pageSize', pageSize).set('page', page).set('total', total))
);