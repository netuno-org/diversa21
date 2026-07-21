import { _db, _val } from "@netuno/server-types";

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const loggedUser = people.getLogged();
const loggedUserId = loggedUser.getInt("id");

const dbTypes = _db.query(`
  SELECT 
    notification_type.id,
    notification_type.code,
    notification_type.name,
    CASE 
      WHEN notification_opt_out.id IS NOT NULL THEN true 
      ELSE false 
    END AS blocked
  FROM notification_type
  LEFT JOIN notification_opt_out 
    ON notification_opt_out.type_id = notification_type.id 
    AND notification_opt_out.people_id = ?::int
    AND notification_opt_out.active = true
  WHERE notification_type.active = true
  ORDER BY notification_type.id ASC
`, loggedUserId);

const list = _val.list();
for (const dbType of dbTypes) {
  list.add(
    _val.map()
      .set("code", dbType.getString("code"))
      .set("name", dbType.getString("name"))
      .set("blocked", dbType.getBoolean("blocked"))
  );
}

response.successWithData(list);