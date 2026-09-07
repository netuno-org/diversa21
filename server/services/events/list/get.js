import { _req, _db, _val, _user } from "@netuno/server-types";
import response from "#core/lib/response.js";

const name = _req.getString('name');
const cityUid = _req.getUID('cityUid');
const uid = _req.getUID('uid');
const page = _req.getInt('page', 1);
const pageSize = 10;
let offset = 0;
if (page > 0) offset = (page - 1) * pageSize;

const userId = _user.id();
let personId = 0;
if (userId) {
  const dbPerson = _db.queryFirst("SELECT id FROM people WHERE people_user_id = ?", userId);
  if (dbPerson) personId = dbPerson.getInt('id');
}

const params = _val.list();
params.add(personId);

let sql = `
  SELECT
    count(*) over() AS total_count,
    event.uid,
    event.name,
    event.description,
    event.start_date,
    event.end_date,
    event.location,
    event.participants_count,
    people.uid AS host_uid,
    people.name AS host_name,
    city.uid AS city_uid,
    city.name AS city_name,
    state.uid AS state_uid,
    state.name AS state_name,
    country.uid AS country_uid,
    country.name AS country_name,
    event_participant.attendance_status AS attendance_status,
    (CASE WHEN event_participant.id IS NOT NULL THEN true ELSE false END) AS is_going
  FROM event
  INNER JOIN people ON event.host_id = people.id
  LEFT JOIN city ON event.city_id = city.id
  LEFT JOIN state ON event.state_id = state.id
  LEFT JOIN country ON event.country_id = country.id
  LEFT JOIN event_participant ON event_participant.event_id = event.id AND event_participant.people_id = ?::int
  WHERE 1 = 1
`;

sql += ` AND event.active = true `;

if (uid) {
  sql += ` AND event.uid = ?::uuid `;
  params.add(uid);
}

if (name) {
  sql += ` AND event.name ILIKE ?::text `;
  params.add(`%${name}%`);
}

if (cityUid) {
  sql += ` AND city.uid = ?::uuid `;
  params.add(cityUid);
}

sql += ` ORDER BY event.start_date DESC LIMIT ?::int OFFSET ?::int `;
params.add(pageSize).add(offset);

const dbEvents = _db.query(sql, params);

const events = _val.list();
for (const dbEvent of dbEvents) {
  events.add(_val.map()
    .set('uid', dbEvent.getUID('uid'))
    .set('name', dbEvent.getString('name'))
    .set('description', dbEvent.getString('description'))
    .set('startDate', dbEvent.getString('start_date'))
    .set('endDate', dbEvent.getString('end_date'))
    .set('location', dbEvent.getString('location'))
    .set('participantsCount', dbEvent.getInt('participants_count'))
    .set('attendanceStatus', dbEvent.getString('attendance_status'))
    .set('isGoing', dbEvent.getBoolean('is_going'))
    .set('host', _val.map().set('uid', dbEvent.getUID('host_uid')).set('name', dbEvent.getString('host_name')))
    .set('city', _val.map().set('uid', dbEvent.getUID('city_uid')).set('name', dbEvent.getString('city_name')))
    .set('state', _val.map().set('uid', dbEvent.getUID('state_uid')).set('name', dbEvent.getString('state_name')))
    .set('country', _val.map().set('uid', dbEvent.getUID('country_uid')).set('name', dbEvent.getString('country_name')))
  );
}

const totalCount = dbEvents.length === 0 ? 0 : dbEvents[0].getInt('total_count');

response.successWithData(
  _val.map()
    .set('items', events)
    .set('pagination', _val.map()
      .set('pageSize', pageSize)
      .set('totalCount', totalCount)
    )
);
