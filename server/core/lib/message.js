import {_db, _val} from "@netuno/server-types";

export default {
  getByUID: (uid) => {
    return _db.form("messages")
      .where(_db.where("uid").equal(uid))
      .first();
  },
  getUnreadTotal: (dbPeople) => {
    const dbMessagesUnread = _db.queryFirst(`
      SELECT COUNT(id) AS total FROM messages WHERE recipient_id = ? AND read_at IS NULL
    `, dbPeople.getInt("id"))
    return dbMessagesUnread.getInt("total", 0)
  },
  toData: (dbPeopleFrom, dbPeopleTo, dbMessage) => {
    return _val.map()
      .set("uid", dbMessage.getString("uid"))
      .set("from", dbPeopleFrom.getString("uid"))
      .set("to", dbPeopleTo.getString("uid"))
      .set("message", dbMessage.getString("message"))
      .set("sent_at", dbMessage.getSQLTimestamp("sent_at"))
      .set("read_at", dbMessage.getSQLTimestamp("read_at"));
  }
}
