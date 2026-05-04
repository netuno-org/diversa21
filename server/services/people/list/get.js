import {_req, _db, _val, _out} from "@netuno/server-types"

import people from "#core/lib/people.js";

const name = _req.getString('name');
const city = _req.getString('city');
const state = _req.getString('state');
const country = _req.getString('country');
let page = _req.getInt('page', 1);

let offset = 0;
if (page > 0) {
  offset = (page - 1) * 10;
}

const nameParam = `%${name}%`;
const cityParam = `%${city}%`;
const stateParam = `%${state}%`;
const countryParam = `%${country}%`;

const dbPeople = _db.query(`
    SELECT
      people.*
    FROM people
      INNER JOIN city ON people.city_id = city.id
      INNER JOIN state ON city.state_id = state.id
      INNER JOIN country ON state.country_id = country.id
    WHERE 1 = 1
      AND people.name ILIKE ?::varchar
      AND (1 = 2
        OR city.name ILIKE ?::varchar 
        OR state.name ILIKE ?::varchar 
        OR country.name ILIKE ?::varchar
      )
    ORDER BY people.name ASC
    LIMIT 10 
    OFFSET ?::int
  `,
  nameParam,
  cityParam,
  stateParam,
  countryParam,
  offset
);

const list = _val.list();
for (const dbPerson of dbPeople) {
  list.add(people.getData(dbPerson.getUID("uid")));
}
_out.json(list);
