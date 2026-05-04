import { _req, _db, _out } from "@netuno/server-types";

const query = _req.getString('query') || "";

const multiQuery = `
SELECT * FROM (
   SELECT
       uid AS id,
       name AS label
   FROM country
   WHERE name ILIKE ?::text
   UNION ALL
   SELECT
       state.uid AS id,
       country.name || ' > ' || state.name AS label
   FROM state
   INNER JOIN country ON state.country_id = country.id
   WHERE state.name ILIKE ?::text
   UNION ALL
   SELECT
       city.uid AS id,
       country.name || ' > ' || state.name || ' > ' || city.name AS label
   FROM city
   INNER JOIN state ON city.state_id = state.id
   INNER JOIN country ON state.country_id = country.id
   WHERE city.name ILIKE ?::text
) AS results
LIMIT 10
`;

const autocomplete = _db.query(
  multiQuery,
  "%" + query + "%",
  "%" + query + "%",
  "%" + query + "%"
);

_out.json({
  autocomplete,
  result: true
})
