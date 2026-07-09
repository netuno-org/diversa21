import {_req, _db, _out, _val} from "@netuno/server-types";

import people from "#core/lib/people.js";
import message from "#core/lib/message.js";

const dbPeopleFrom = people.getByUid(_req.getString("from"));
const dbMessage = message.getByUID(_req.getString("uid"));

_db.execute(`
  UPDATE messages SET read_at = CURRENT_TIMESTAMP
  WHERE read_at IS NULL AND id = ?::int AND originator_id = ?::int
`, dbMessage.getInt("id"), dbPeopleFrom.getInt("id"));

_out.json(
  _val.map()
    .set("result", true)
    .set("from", dbPeopleFrom.getString("uid"))
);
