import {_db, _val, _out, _req} from "@netuno/server-types";

import people from "#core/lib/people.js";
import message from "#core/lib/message.js";
import notifications, { notificationTypes, notificationMessages } from "#core/lib/notifications.js";

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

const fromUid = dbPeopleFrom.getString("uid");
const fromData = people.getData(fromUid);
const fromUsername = fromData.getString("username");
const fromName = fromData.getString("name");
const fromAvatar = dbPeopleFrom.getString("avatar") !== "";
const toUid = dbPeopleTo.getString("uid");
const toUsername = people.getData(toUid).getString("username");
const title = "@" + fromUsername;

const notificationData = notifications.sendOrUpdateMessageNotification(
  title,
  notificationMessages.MESSAGE,
  dbPeopleFrom.getInt("id"),
  dbPeopleTo.getInt("id")
);

people.wsSendAsService(
  dbPeopleTo,
  _val.map()
    .set("method", "POST")
    .set("service", "notification/new")
    .set(
      "data",
      _val.map()
        .set("with", fromUid)
    )
    .set(
      "content",
      _val.map()
        .set("uid", notificationData.getString("uid"))
        .set("title", title)
        .set("content", notificationMessages.MESSAGE)
        .set("originator",
          _val.map()
            .set("uid", fromUid)
            .set("username", fromUsername)
            .set("name", fromName)
            .set("avatar", fromAvatar)
        )
        .set("recipient",
          _val.map()
            .set("uid", toUid)
            .set("username", toUsername)
        )
        .set("sent_at", notificationData.get("sent_at"))
        .set("read_at", null)
        .set("extra", "")
        .set("type", notificationTypes.MESSAGE)
    )
);

_out.json(
  _val.map()
    .set("result", true)
    .set("content", message.toData(dbPeopleFrom, dbPeopleTo, dbMessage))
);
