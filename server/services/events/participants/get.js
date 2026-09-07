import { _req, _db, _val } from "@netuno/server-types";
import response from "#core/lib/response.js";

const eventUid = _req.getString('eventUid');

if (!eventUid) {
  response.error("O identificador do evento é obrigatório.");
} else {
  const dbEvent = _db.queryFirst("SELECT id FROM event WHERE uid = ?::uuid", eventUid);
  if (!dbEvent) {
    response.error("Evento não encontrado.");
  } else {
    const eventId = dbEvent.getInt('id');

    const participants = _db.query(
      `SELECT p.uid, p.name, NULL AS username, p.avatar 
       FROM event_participant ep 
       JOIN people p ON ep.people_id = p.id 
       WHERE ep.event_id = ? AND ep.active = true`,
      eventId
    );

    const list = _val.list();
    if (participants) {
      for (let i = 0; i < participants.size(); i++) {
        const row = participants.get(i);
        list.add(_val.map()
          .set('uid', row.getString('uid'))
          .set('name', row.getString('name'))
          .set('username', row.getString('username'))
          .set('avatar', row.getString('avatar'))
        );
      }
    }

    response.successWithData(list);
  }
}