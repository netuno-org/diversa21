import { _db, _ws } from "@netuno/server-types";
import people from "#core/lib/people.js";
import friend from "#core/lib/friend.js";

const dbPeople = people.getLogged();

if (dbPeople) {
  _db.form("people_ws_session")
    .set("people_id", dbPeople.getInt("id"))
    .set("session_id", _ws.sessionId())
    .insert();
  friend.notifyAllWithStatusChanged(dbPeople, true);
} else {
  _ws.close();
}
