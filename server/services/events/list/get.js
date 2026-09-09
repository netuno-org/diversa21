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
const goingOnly = _req.getBoolean('goingOnly');
const page = _req.getInt('page', 1);
const pageSize = 10;
const offset = (page - 1) * pageSize;

let sql = `SELECT e.*, p.uid as host_uid, p.name as host_name, p.avatar as host_avatar, 
                  c.uid as city_uid, c.name as city_name, 
                  s.uid as state_uid, s.name as state_name, 
                  co.uid as country_uid, co.name as country_name 
           FROM event e 
           LEFT JOIN people p ON e.host_id = p.id 
           LEFT JOIN city c ON e.city_id = c.id 
           LEFT JOIN state s ON c.state_id = s.id 
           LEFT JOIN country co ON s.country_id = co.id`;

let countSql = `SELECT COUNT(*) as total FROM event e LEFT JOIN city c ON e.city_id = c.id`;

let where = ` WHERE e.active = true`;
let params = [];

if (goingOnly && personId) {
  where += ` AND EXISTS (SELECT 1 FROM event_participant ep_filter WHERE ep_filter.event_id = e.id AND ep_filter.people_id = ? AND ep_filter.active = true)`;
  params.push(personId);
}

if (term) {
  where += ` AND (e.name ILIKE ? OR e.description ILIKE ?)`;
  params.push(`%${term}%`, `%${term}%`);
}

if (location) {
  where += ` AND (e.location ILIKE ? OR c.name ILIKE ?)`;
  params.push(`%${location}%`, `%${location}%`);
}

sql += where + ` ORDER BY e.created_at DESC LIMIT ? OFFSET ?`;
countSql += where;

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

    const countCheck = _db.queryFirst(
      "SELECT COUNT(*) as cnt FROM event_participant WHERE event_id = ? AND active = true",
      eventId
    );
    const participantsCount = countCheck ? countCheck.getLong('cnt') : 0;

    const participantsPreview = _db.query(
      `SELECT p.uid, p.name, p.avatar 
       FROM event_participant ep 
       JOIN people p ON ep.people_id = p.id 
       WHERE ep.event_id = ? AND ep.active = true 
       LIMIT 3`,
      eventId
    );

    const participantsList = _val.list();
    if (participantsPreview) {
      for (let j = 0; j < participantsPreview.size(); j++) {
        const pRow = participantsPreview.get(j);
        participantsList.add(_val.map()
          .set('uid', pRow.getString('uid'))
          .set('name', pRow.getString('name'))
          .set('avatar', pRow.getString('avatar'))
        );
      }
    }

    const canEdit = isAdminOrManager || (personId && hostId === personId);

    list.add(_val.map()
      .set('id', eventId)
      .set('uid', row.getString('uid'))
      .set('name', row.getString('name'))
      .set('description', row.getString('description'))
      .set('location', row.getString('location'))
      .set('coverImage', row.getString('cover_image'))
      .set('startDate', row.getString('start_date') || row.getString('created_at'))
      .set('isGoing', isGoing)
      .set('canEdit', canEdit)
      .set('participantsCount', participantsCount)
      .set('participantsPreview', participantsList)
      .set('city', _val.map()
        .set('uid', row.getString('city_uid'))
        .set('name', row.getString('city_name'))
      )
      .set('state', _val.map()
        .set('uid', row.getString('state_uid'))
        .set('name', row.getString('state_name'))
      )
      .set('country', _val.map()
        .set('uid', row.getString('country_uid'))
        .set('name', row.getString('country_name'))
      )
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