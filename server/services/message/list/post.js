import {_db, _val, _out, _req} from "@netuno/server-types";

import people from "#core/lib/people.js";
import message from "#core/lib/message.js";

const dbPeopleLogged = people.getLogged();
const dbPeopleFriend = people.getByUid(_req.getString("with"));

const totalMessagesMarkedAsRead = _db.execute(`
  UPDATE messages SET read_at = CURRENT_TIMESTAMP
  WHERE read_at IS NULL AND originator_id = ?::int AND recipient_id = ?::int
`, dbPeopleFriend.getInt("id"), dbPeopleLogged.getInt("id"));

if (totalMessagesMarkedAsRead > 0) {
  people.wsSendService(
    dbPeopleLogged,
    _val.map()
      .set("service", "message/unread/count")
  );
  people.wsSendService(
    dbPeopleLogged,
    _val.map()
      .set("service", "friend/list")
  );
}

const dbMessagesPage = _db.form("messages")
  .where(
    _db.where()
      .and(
        _db.where("originator_id").equal(dbPeopleLogged.getInt("id"))
          .or("originator_id").equal(dbPeopleFriend.getInt("id"))
      )
      .and(
        _db.where("recipient_id").equal(dbPeopleLogged.getInt("id"))
          .or("recipient_id").equal(dbPeopleFriend.getInt("id"))
      )
  ).order("sent_at", "desc")
  .page(1, 10);

const messages = _val.list();

for (const dbMessage of dbMessagesPage.getList("items")) {
    let dbPeopleFrom = dbPeopleLogged;
    let dbPeopleTo = dbPeopleFriend;
    if (dbMessage.getInt("originator_id") === dbPeopleFriend.getInt("id")) {
      dbPeopleFrom = dbPeopleFriend;
      dbPeopleTo = dbPeopleLogged;
    }
    messages.add(
      message.toData(dbPeopleFrom, dbPeopleTo, dbMessage)
    );
}

_out.json(
  messages.reversed()
);
