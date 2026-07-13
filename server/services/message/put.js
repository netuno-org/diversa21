import { _db, _val, _out, _req } from "@netuno/server-types";

import people from "#core/lib/people.js";
import message from "#core/lib/message.js";

const dbPeopleLogged = people.getLogged();
const messageUid = _req.getString("uid");
const updatedContent = _req.getString("message");

if (!messageUid || !updatedContent || updatedContent.trim() === "") {
  _out.json(_val.map().set("result", false).set("error", "invalid_input"));
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

_db.form("messages")
  .set("message", updatedContent)
  .where(_db.where("id").equal(dbMessage.getInt("id")))
  .update();

const dbMessageUpdated = _db.form("messages")
  .where(_db.where("id").equal(dbMessage.getInt("id")))
  .first();

const formattedMessage = message.toData(dbPeopleLogged, dbPeopleTo, dbMessageUpdated);

if (dbPeopleTo) {
  people.wsSendAsService(
    dbPeopleTo,
    _val.map()
      .set("method", "PUT")
      .set("service", "message/edit")
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
    .set("service", "message/edit")
    .set(
      "data",
      _val.map()
        .set("with", dbPeopleTo ? dbPeopleTo.getString("uid") : "")
    )
    .set("content", formattedMessage)
);

_out.json(
  _val.map().set("result", true)
);