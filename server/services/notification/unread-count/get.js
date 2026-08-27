import { _db } from "@netuno/server-types";
import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const dbPeopleLogged = people.getLogged();

if (!dbPeopleLogged) {
    response.errorUnauthorized();
} else {
    const loggedUserUid = dbPeopleLogged.getUID("uid");

    const dbCounts = _db.query(`
        SELECT COUNT(notification.id) AS count
        FROM notification
        INNER JOIN people recipient ON notification.recipient_id = recipient.id
        INNER JOIN notification_type ON notification.type_id = notification_type.id
        WHERE recipient.uid = ?::uuid
          AND notification.read_at IS NULL
          AND notification_type.code != 'message'
    `, loggedUserUid);

    const count = dbCounts.length > 0 ? dbCounts[0].getInt("count") : 0;

    response.successWithData(
        _val.map().set("count", count)
    );
}
