import { _req, _db, _val, _out, _header, _exec } from "@netuno/server-types";

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const uid = _req.getString('uid');
const page = _req.getInt('page', 1);

if (!uid) {
  _header.status(400);
  _out.json(
    _val.map()
      .set("error", "uid-required")
  );
  _exec.stop();
}

const institution = _db.queryFirst(
  "SELECT id FROM institution WHERE uid = ?::uuid",
  uid
);

if (!institution) {
  response.stopWithInstitutionNotFound();
}

const pageSize = 10;

let offset = 0;
if (page > 0) {
  offset = (page - 1) * pageSize;
}

const sql = `
  SELECT
    count(*) over() as total_count,
    people.uid
  FROM people
    INNER JOIN institution ON people.institution_id = institution.id
  WHERE institution.uid = ?::uuid
  ORDER BY people.name
  LIMIT ?::int OFFSET ?::int
`;

const params = _val.list();
params.add(uid);
params.add(pageSize);
params.add(offset);

const dbPeople = _db.query(sql, params);

const list = _val.list();
for (const dbPerson of dbPeople) {
  list.add(people.getData(dbPerson.getUID("uid")));
}

const totalCount = dbPeople.length > 0
  ? dbPeople[0].getInt("total_count")
  : 0;

response.successWithData(
  _val.map()
    .set("items", list)
    .set("totalCount", totalCount)
    .set("pageSize", pageSize)
);
