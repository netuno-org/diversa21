import { _db, _out } from "@netuno/server-types";

const rows = _db.query(`
    SELECT
        uid AS uid,
        name AS name,
        code AS code
    FROM country
    ORDER BY name ASC
`);

_out.json({
    data: rows,
    result: true
});