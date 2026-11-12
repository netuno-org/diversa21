import { _db, _user, _val, _out } from "@netuno/server-types";

import people from "#core/lib/people.js";

const dbPeople = people.getLogged();

const dbChats = _db.query(`
SELECT 
    p.uid, 
    p.name, 
    nu.user username,
    p.avatar,
    c.last_message_at,
    c.last_message_uid,
    c.last_message,
    c.unread_messages_count,
    (SELECT COUNT(id) FROM people_ws_session WHERE people_id = p.id) AS active_ws_sessions
FROM people AS p
INNER JOIN netuno_user nu ON p.people_user_id = nu.id
INNER JOIN (
    SELECT 
        raw_msg.peer_people_id,
        MAX(raw_msg.sent_at) AS last_message_at,
        (ARRAY_AGG(raw_msg.uid ORDER BY raw_msg.sent_at DESC, raw_msg.id DESC))[1] AS last_message_uid,
        (ARRAY_AGG(
            CASE
                WHEN raw_msg.deleted_at IS NOT NULL OR raw_msg.active = false THEN 'Mensagem apagada'
                ELSE raw_msg.message
            END
            ORDER BY raw_msg.sent_at DESC, raw_msg.id DESC
        ))[1] AS last_message,
        COUNT(CASE WHEN raw_msg.recipient_id = ? AND raw_msg.read_at IS NULL THEN 1 END) AS unread_messages_count
    FROM (
        SELECT 
            id,
            uid,
            recipient_id,
            read_at,
            sent_at,
            message,
            active,
            deleted_at,
            CASE WHEN originator_id = ? THEN recipient_id ELSE originator_id END AS peer_people_id
        FROM message
        WHERE recipient_id = ? OR originator_id = ?
    ) AS raw_msg
    GROUP BY raw_msg.peer_people_id
) AS c ON p.id = c.peer_people_id
ORDER BY c.last_message_at DESC NULLS LAST;

`,
  dbPeople.getInt("id"),
  dbPeople.getInt("id"),
  dbPeople.getInt("id"),
  dbPeople.getInt("id"));

const chats = _val.list();

for (const dbChat of dbChats) {
  chats.add(
    _val.map()
      .set("uid", dbChat.getString("uid"))
      .set("name", dbChat.getString("name"))
      .set("username", dbChat.getString("username"))
      .set("avatar", dbChat.getString("avatar") !== "")
      .set("online", dbChat.getInt("active_ws_sessions") > 0)
      .set("last_message_at", dbChat.getSQLTimestamp("last_message_at"))
      .set("last_message_uid", dbChat.getString("last_message_uid"))
      .set("last_message", dbChat.getString("last_message"))
      .set("unread_messages", dbChat.getInt("unread_messages_count", 0))
  );
}

_out.json(chats);
