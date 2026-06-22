import { _req, _db, _out } from "@netuno/server-types";
import response from "#core/lib/response.js";

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

response.successWithData(data);
