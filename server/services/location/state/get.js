import { _db, _out } from "@netuno/server-types";

const rows = _db.query(`
  SELECT
    state.uid AS uid,
    state.name AS name,
    state.code AS code,
    country.uid AS "countryUid",
    country.name AS "countryName"
  FROM state
  INNER JOIN country ON state.country_id = country.id
  ORDER BY country.name ASC, state.name ASC
`);

_out.json({
  data: rows,
  result: true
});