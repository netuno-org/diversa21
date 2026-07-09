import {_db, _val, _out, _req} from "@netuno/server-types";

import people from "#core/lib/people.js";
import message from "#core/lib/message.js";

const dbPeopleFrom = people.getLogged();
const dbPeopleTo = people.getByUid(_req.getString("to"));
const inputMessage = _req.getString("message");

const dbMessageInserted = _db.form("messages")
  .set("originator_id", dbPeopleFrom.getInt("id"))
  .set("recipient_id", dbPeopleTo.getInt("id"))
  .set("message", inputMessage)
  .set("sent_at", _db.timestamp())
  .insert();

const dbMessage = _db.form("messages")
  .where(_db.where("id").equal(dbMessageInserted.getInt("id")))
  .first();

people.wsSendAsService(
  dbPeopleTo,
  _val.map()
    .set("method", "POST")
    .set("service", "message/new")
    .set(
      "data",
      _val.map()
        .set("with", dbPeopleFrom.getString("uid"))
    )
    .set(
      "content",
      message.toData(dbPeopleFrom, dbPeopleTo, dbMessage)
    )
);

_out.json(
  _val.map()
    .set("result", true)
);
