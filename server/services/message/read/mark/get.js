import {_req, _db, _out, _val} from "@netuno/server-types";

import people from "#core/lib/people.js";
import message from "#core/lib/message.js";
import notifications, { notificationTypes } from "#core/lib/notifications.js";

const dbPeopleLogged = people.getLogged();
const dbPeopleFrom = people.getByUid(_req.getString("from"));
const dbMessage = message.getByUID(_req.getString("uid"));

_db.execute(`
  UPDATE messages SET read_at = CURRENT_TIMESTAMP
  WHERE read_at IS NULL AND id = ?::int AND originator_id = ?::int
`, dbMessage.getInt("id"), dbPeopleFrom.getInt("id"));

notifications.clearMessageNotification(
  dbPeopleFrom.getInt("id"),
  dbPeopleLogged.getInt("id")
);

people.wsSendAsService(
  dbPeopleLogged,
  _val.map()
    .set("method", "POST")
    .set("service", "notification/read")
    .set(
      "content",
      _val.map()
        .set("type", notificationTypes.MESSAGE)
        .set("originator",
          _val.map()
            .set("uid", dbPeopleFrom.getString("uid"))
        )
    )
);

_out.json(
  _val.map()
    .set("result", true)
    .set("from", dbPeopleFrom.getString("uid"))
);
