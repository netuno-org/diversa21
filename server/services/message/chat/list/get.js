import { _db, _user, _val, _out } from "@netuno/server-types";

import people from "#core/lib/people.js";

const dbPeople = people.getLogged();

const dbParticipants = _db.query(`
SELECT 
    p.uid, 
    p.name, 
    p.avatar,
    c.latest_message_moment, 
    c.unread_messages_count,
    (SELECT COUNT(id) FROM people_ws_session WHERE people_id = p.id) AS active_ws_sessions
FROM people AS p
INNER JOIN (
    SELECT 
        raw_msg.peer_people_id,
        MAX(raw_msg.sent_at) AS latest_message_moment,
        COUNT(CASE WHEN raw_msg.recipient_id = ? AND raw_msg.read_at IS NULL THEN 1 END) AS unread_messages_count
    FROM (
        SELECT 
            recipient_id,
            read_at,
            sent_at,
            CASE WHEN originator_id = ? THEN recipient_id ELSE originator_id END AS peer_people_id
        FROM message
        WHERE recipient_id = ? OR originator_id = ?
    ) AS raw_msg
    GROUP BY raw_msg.peer_people_id
) AS c ON p.id = c.peer_people_id
ORDER BY c.latest_message_moment DESC NULLS LAST;

`,
  dbPeople.getInt("id"),
  dbPeople.getInt("id"),
  dbPeople.getInt("id"),
  dbPeople.getInt("id"));

const participants = _val.list();

for (const dbParticipant of dbParticipants) {
  participants.add(
    _val.map()
      .set("uid", dbParticipant.getString("uid"))
      .set("name", dbParticipant.getString("name"))
      .set("avatar", dbParticipant.getString("avatar") !== "")
      .set("online", dbParticipant.getInt("active_ws_sessions") > 0)
      .set("latest_message", dbParticipant.getSQLTimestamp("latest_message_moment"))
      .set("unread_messages", dbParticipant.getInt("unread_messages_count", 0))
  );
}

_out.json(participants);
