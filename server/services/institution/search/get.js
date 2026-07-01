import { _req, _db, _out, _group } from "@netuno/server-types";
import response from "#core/lib/response.js";

const input = _req.getString('name') || "";
const isAdmin = _group.code() === "super-admin";

let sqlQuery = `
    SELECT
        institution.uid AS uid,
        institution.slug AS slug,
        institution.name AS name 
    FROM institution 
    WHERE institution.name ILIKE ?::text
`;

if (!isAdmin) {
  sqlQuery += " AND institution.active = true ";
}

sqlQuery += " LIMIT 10 ";

const data = _db.query(sqlQuery, "%" + input + "%");

response.successWithData(data);
