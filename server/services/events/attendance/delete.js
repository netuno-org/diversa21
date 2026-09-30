import { _req, _db, _val, _user } from "@netuno/server-types";
import response from "#core/lib/response.js";

const userId = _user.id();
let personId = null;

if (userId) {
  const dbPerson = _db.queryFirst("SELECT id FROM people WHERE people_user_id = ?", userId);
  if (dbPerson) {
    personId = dbPerson.getInt('id');
  }
}

if (!personId) {
  response.error("Utilizador não autenticado ou sem perfil de pessoa associado.");
} else {
  const eventUid = _req.getString('eventUid');

  if (!eventUid) {
    response.error("O identificador do evento é obrigatório.");
  } else {
    const dbEvent = _db.queryFirst("SELECT id FROM event WHERE uid = ?::uuid", eventUid);
    if (!dbEvent) {
      response.error("Evento não encontrado.");
    } else {
      const eventId = dbEvent.getInt('id');

      _db.execute(
        "DELETE FROM event_participant WHERE event_id = ? AND people_id = ?",
        eventId, personId
      );

      _db.execute(
        "UPDATE event SET participants_count = (SELECT COUNT(*) FROM event_participant WHERE event_id = ?) WHERE id = ?",
        eventId, eventId
      );

      response.successWithData(_val.map());
    }
  }
}