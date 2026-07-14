import { _db, _ws } from "@netuno/server-types";
import people from "#core/lib/people.js";
import friend from "#core/lib/friend.js";

const dbSession = _db.form("people_ws_session")
  .where(_db.where("session_id").equal(_ws.sessionId()))
  .first();

if (dbSession) {
  const dbPeople = _db.get("people", dbSession.getInt("people_id"));
  
  _db.form("people_ws_session")
    .where(_db.where("session_id").equal(_ws.sessionId()))
    .delete();

  if (dbPeople) {
    const activeSessionsCount = _db.form("people_ws_session")
      .where(_db.where("people_id").equal(dbPeople.getInt("id")))
      .count();
    if (activeSessionsCount === 0) {
      friend.notifyAllWithStatusChanged(dbPeople, false);
    }
  }
}
