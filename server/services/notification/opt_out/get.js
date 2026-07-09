import { _db, _val } from "@netuno/server-types";

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const dbPeople = people.getLogged();

const peopleId = dbPeople.getInt("id");

const dbTypes = _db.query(`
  SELECT
    notification_type.code,
    notification_type.name,
    CASE WHEN notification_opt_out.id IS NOT NULL THEN true ELSE false END AS blocked
  FROM notification_type
  LEFT JOIN notification_opt_out
    ON notification_opt_out.type_id = notification_type.id
    AND notification_opt_out.people_id = ?::int
  ORDER BY notification_type.name ASC
`, peopleId);

const types = _val.list();
for (const dbType of dbTypes) {
  types.add(
    _val.map()
      .set("code", dbType.getString("code"))
      .set("name", dbType.getString("name"))
      .set("blocked", dbType.getBoolean("blocked"))
  );
}

response.successWithData(types);