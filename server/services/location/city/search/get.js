import { _req, _db, _out } from "@netuno/server-types";

import search from "#core/lib/search.js";

const input = _req.getString('name') || "";

const query = `
SELECT * FROM (
   SELECT
       city.uid AS uid,
       country.name || ' > ' || state.name || ' > ' || city.name AS label
   FROM city
   INNER JOIN state ON city.state_id = state.id
   INNER JOIN country ON state.country_id = country.id
   WHERE ${search.unaccent("city.name")} ILIKE ${search.unaccent("?::text")}
) AS results
LIMIT 10
`;

const data = _db.query(
  query,
  "%" + input + "%"
);

_out.json({
  data,
  result: true
})
