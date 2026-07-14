import { _db, _val, _ws } from "@netuno/server-types";

export default {
  notifyAllWithStatusChanged: (dbPeople, online) => {
    const dbFriendSessions = _db.query(`
      SELECT DISTINCT s.session_id
      FROM people_ws_session s
      INNER JOIN friend f ON (f.people_id = s.people_id OR f.friend_id = s.people_id)
      WHERE (f.people_id = ? OR f.friend_id = ?)
        AND s.people_id != ?
        AND f.accepted_at IS NOT NULL
    `, dbPeople.getInt("id"), dbPeople.getInt("id"), dbPeople.getInt("id"));

    for (const dbFriendSession of dbFriendSessions) {
      _ws.sendAsService(
        dbFriendSession.getString("session_id"),
        _val.map()
          .set("service", "/friend/status/changed")
          .set(
            "content",
            _val.map()
              .set("uid", dbPeople.getString("uid"))
              .set("online", online)
          )
      );
    }
  }
}