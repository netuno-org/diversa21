import { _db, _val, _out, _req } from "@netuno/server-types";

import people from "#core/lib/people.js";
import message from "#core/lib/message.js";

const dbPeopleLogged = people.getLogged();
const messageUid = _req.getString("uid");
const reaction = _req.getString("reaction", "");

if (!messageUid) {
  _out.json(_val.map().set("result", false).set("error", "missing_uid"));
  _exit();
}

const dbMessage = message.getByUID(messageUid);

if (!dbMessage) {
  _out.json(_val.map().set("result", false).set("error", "message_not_found"));
  _exit();
}

if (dbMessage.getInt("recipient_id") !== dbPeopleLogged.getInt("id")) {
  _out.json(_val.map().set("result", false).set("error", "unauthorized"));
  _exit();
}

let cleanReaction = reaction ? reaction.replace(/\uFE0F/g, "") : "";

_db.form("messages")
  .set("reaction", cleanReaction)
  .where(_db.where("id").equal(dbMessage.getInt("id")))
  .update();

const dbMessageUpdated = _db.form("messages")
  .where(_db.where("id").equal(dbMessage.getInt("id")))
  .first();

const dbPeopleFrom = _db.get("people", dbMessage.getInt("originator_id"));

const formattedMessage = message.toData(dbPeopleFrom, dbPeopleLogged, dbMessageUpdated);

if (dbPeopleFrom) {
  people.wsSendAsService(
    dbPeopleFrom,
    _val.map()
      .set("method", "PUT")
      .set("service", "message")
      .set(
        "data",
        _val.map()
          .set("with", dbPeopleLogged.getString("uid"))
      )
      .set("content", formattedMessage)
  );
}

people.wsSendAsService(
  dbPeopleLogged,
  _val.map()
    .set("method", "PUT")
    .set("service", "message")
    .set(
      "data",
      _val.map()
        .set("with", dbPeopleFrom ? dbPeopleFrom.getString("uid") : "")
    )
    .set("content", formattedMessage)
);

_out.json(
  _val.map().set("result", true).set("content", formattedMessage)
);
