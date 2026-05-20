import { _db, _out } from "@netuno/server-types";

const rows = _db.query(`
  SELECT
    city.uid AS uid,
    city.name AS name,
    state.uid AS "stateUid",
    state.name AS "stateName",
    country.uid AS "countryUid",
    country.name AS "countryName"
  FROM city
  INNER JOIN state ON city.state_id = state.id
  INNER JOIN country ON state.country_id = country.id
  ORDER BY country.name ASC, state.name ASC, city.name ASC
`);

_out.json({
  data: rows,
  result: true
});