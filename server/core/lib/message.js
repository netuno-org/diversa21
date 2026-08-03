import {_db, _val} from "@netuno/server-types";

export default {
  getByUID: (uid) => {
    return _db.form("messages")
      .where(_db.where("uid").equal(uid))
      .first();
  },
  getUnreadTotal: (dbPeople) => {
    const dbMessagesUnread = _db.queryFirst(`
      SELECT COUNT(DISTINCT originator_id) AS total FROM messages WHERE recipient_id = ? AND read_at IS NULL
    `, dbPeople.getInt("id"));
    return dbMessagesUnread.getInt("total", 0);
  },
  toData: (dbPeopleFrom, dbPeopleTo, dbMessage) => {
    const data = _val.map()
      .set("uid", dbMessage.getString("uid"))
      .set("from", dbPeopleFrom.getString("uid"))
      .set("to", dbPeopleTo.getString("uid"))
      .set("message", dbMessage.getString("message"))
      .set("sent_at", dbMessage.getSQLTimestamp("sent_at"))
      .set("read_at", dbMessage.getSQLTimestamp("read_at"))
      .set("deleted_at", !dbMessage.getBoolean("active") && dbMessage.getSQLTimestamp("deleted_at") == null ? _db.timestamp() : dbMessage.getSQLTimestamp("deleted_at"))
      .set("edited_at", dbMessage.getSQLTimestamp("edited_at"))
      .set("reaction", dbMessage.getString("reaction"));

    const parentId = dbMessage.getInt("parent_id", 0);
    if (parentId > 0) {
      const dbParentMessage = _db.form("messages")
        .where(_db.where("id").equal(parentId))
        .first();
      if (dbParentMessage) {
        const dbParentOriginator = _db.get("people", dbParentMessage.getInt("originator_id"));
        data.set("parent", _val.map()
          .set("uid", dbParentMessage.getString("uid"))
          .set("message", dbParentMessage.getString("message"))
          .set("from", dbParentOriginator ? dbParentOriginator.getString("name") : "")
        );
      }
    }
    return data;
  }
}