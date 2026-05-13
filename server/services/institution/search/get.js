import { _req, _db, _out } from "@netuno/server-types";

const input = _req.getString('name') || "";

const data = _db.query(`
    SELECT
        institution.uid AS uid,
        institution.slug AS slug,
        institution.name AS name 
    FROM institution 
    WHERE institution.name ILIKE ?::text
    LIMIT 10
`,
"%" + input + "%");

_out.json({
  data,
  result: true
})