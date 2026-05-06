import {_req, _db, _val, _out} from "@netuno/server-types"

import people from "#core/lib/people.js";

const name = _req.getString('name');
const cityUid = _req.getUID('cityUid');
const stateUid = _req.getUID('stateUid');
const countryUid = _req.getUID('countryUid');
let page = _req.getInt('page', 1);

let offset = 0;
if (page > 0) {
  offset = (page - 1) * 10;
}

let sqlQuery = `
    SELECT
      count(*) over() as total_count,
      people.*
    FROM people
      INNER JOIN city ON people.city_id = city.id
      INNER JOIN state ON city.state_id = state.id
      INNER JOIN country ON state.country_id = country.id
    WHERE 1 = 1
      AND people.name ILIKE ?::varchar
      AND (1 = 2
`;

const params = _val.list();
params.add(`%${name}%`);

if (cityUid) {
  sqlQuery += ` OR city.uid = ?::uuid `;
  params.add(cityUid);
} else if (stateUid) {
  sqlQuery += ` OR state.uid = ?::uuid `;
  params.add(stateUid);
} else if (countryUid) {
  sqlQuery += ` OR country.uid = ?::uuid `;
  params.add(countryUid);
} else if (countryUid) {
  sqlQuery += ` OR country.uid = ?::uuid `;
  params.add(countryUid);
} else {
  sqlQuery += ` OR 1 = 1 `;
}

params.add(offset);

sqlQuery +=
`
      )
    ORDER BY people.name ASC
    LIMIT 10 
    OFFSET ?::int
`;

const dbPeople = _db.query(sqlQuery, params);

const result = _val.map();

const list = _val.list();
for (const dbPerson of dbPeople) {
  list.add(people.getData(dbPerson.getUID("uid")));
}

if (dbPeople.length == 0) {
  result.set("totalCount", 0);
} else {
  result.set("totalCount", dbPeople[0].getString("total_count"));
}
result.set("items", list);
_out.json(result);
