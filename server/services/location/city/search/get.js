import { _req, _db, _out } from "@netuno/server-types";

const input = _req.getString('city') || "";

const query = `
SELECT * FROM (
   SELECT
       city.uid AS uid,
       country.name || ' > ' || state.name || ' > ' || city.name AS label
   FROM city
   INNER JOIN state ON city.state_id = state.id
   INNER JOIN country ON state.country_id = country.id
   WHERE city.name ILIKE ?::text
) AS results
LIMIT 10
`;

const result = _db.query(
  query,
  "%" + input + "%"
);

_out.json({
  result,
  success: true
})
