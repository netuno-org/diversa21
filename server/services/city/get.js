import { _req, _db, _out } from "@netuno/server-types";

const searchTerm = _req.getString('searchTerm') || "";

const multiQuery = `
   SELECT
        uid AS id,
        name AS label
   FROM country
   WHERE name LIKE ?::text
   UNION ALL
   SELECT
        state.uid AS id,
        country.name || ' > ' || state.name AS label
   FROM state
   INNER JOIN country ON state.country_id = country.id
   WHERE state.name LIKE ?::text
   UNION ALL
   SELECT
        city.uid AS id,
        country.name || ' > ' || state.name || ' > ' || city.name AS label
   FROM city
   INNER JOIN state ON city.state_id = state.id
   INNER JOIN country ON state.country_id = country.id
   WHERE city.name LIKE ?::text
`;

const autocomplete = _db.query(
  multiQuery,
  "%" + searchTerm + "%",
  "%" + searchTerm + "%",
  "%" + searchTerm + "%"
);

_out.json({
  autocomplete,
  result: true
})
