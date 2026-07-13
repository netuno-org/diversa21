import { _db, _val, _out, _req } from "@netuno/server-types";

import people from "#core/lib/people.js";
import message from "#core/lib/message.js";

const dbPeopleLogged = people.getLogged();
const messageUid = _req.getString("uid");

if (!messageUid) {
  _out.json(_val.map().set("result", false).set("error", "missing_uid"));
  _exit();
}

const dbMessage = message.getByUID(messageUid);

if (!dbMessage) {
  _out.json(_val.map().set("result", false).set("error", "message_not_found"));
  _exit();
}

if (dbMessage.getInt("originator_id") !== dbPeopleLogged.getInt("id")) {
  _out.json(_val.map().set("result", false).set("error", "unauthorized"));
  _exit();
}

const dbPeopleTo = _db.get("people", dbMessage.getInt("recipient_id"));

_db.delete("messages", dbMessage.getInt("id"));

if (dbPeopleTo) {
  people.wsSendAsService(
    dbPeopleTo,
    _val.map()
      .set("method", "DELETE")
      .set("service", "message/delete")
      .set(
        "data",
        _val.map()
          .set("uid", messageUid)
          .set("with", dbPeopleLogged.getString("uid"))
      )
  );
}

people.wsSendAsService(
  dbPeopleLogged,
  _val.map()
    .set("method", "DELETE")
    .set("service", "message/delete")
    .set(
      "data",
      _val.map()
        .set("uid", messageUid)
        .set("with", dbPeopleTo ? dbPeopleTo.getString("uid") : "")
    )
);

_out.json(
  _val.map().set("result", true)
);