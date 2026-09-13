import { _req, _db, _val, _user } from "@netuno/server-types";
import response from "#core/lib/response.js";

const userId = _user.id();

if (!userId) {
  response.error("Utilizador não autenticado.");
} else {
  const eventUid = _req.getString("eventUid");
  const page = _req.getInt("page", 1);
  const pageSize = _req.getInt("pageSize", 10);

  if (!eventUid) {
    response.error("O identificador do evento é obrigatório.");
  } else {
    const dbEvent = _db.queryFirst("SELECT id FROM event WHERE uid = ?::uuid AND active = true", eventUid);

    if (!dbEvent) {
      response.error("Evento não encontrado.");
    } else {
      const eventId = dbEvent.getInt("id");
      const offset = (page - 1) * pageSize;

      const participants = _db.query(
        `SELECT p.uid, p.name, p.avatar, nu.user as username
         FROM event_participant ep
         JOIN people p ON ep.people_id = p.id
         LEFT JOIN netuno_user nu ON p.people_user_id = nu.id
         WHERE ep.event_id = ? AND ep.active = true
         ORDER BY ep.created_at DESC
         LIMIT ? OFFSET ?`,
        eventId, pageSize, offset
      );

      const list = _val.list();
      
      if (participants) {
        for (let i = 0; i < participants.size(); i++) {
          const pRow = participants.get(i);
          list.add(_val.map()
            .set("uid", pRow.getString("uid"))
            .set("name", pRow.getString("name"))
            .set("avatar", pRow.getString("avatar"))
            .set("username", pRow.getString("username"))
          );
        }
      }

      response.successWithData(list);
    }
  }
}