import { _db, _out } from "@netuno/server-types";
import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const dbPeopleLogged = people.getLogged();

if (dbPeopleLogged) {
    const rows = _db.query(
        "SELECT COUNT(*) AS total FROM notification WHERE user_id = ? AND read_at IS NULL",
        dbPeopleLogged.getLong("id")
    );

    let total = 0;
    if (rows && rows.length > 0) {
        const val = rows[0].get("total");
        total = val ? Number(val.toString()) : 0;
    }

    response.successWithData(total);
} else {
    response.errorUnauthorized();
}