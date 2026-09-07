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
  const name = _req.getString('name');
  const description = _req.getString('description');
  const location = _req.getString('location');

  if (!name) {
    response.error("O nome do evento é obrigatório.");
  } else {
    const dbMax = _db.queryFirst("SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM event");
    const nextId = dbMax ? dbMax.getInt("next_id") : 1;

    _db.execute(
      `INSERT INTO event (id, uid, name, description, location, host_id, active, participants_count, created_at, updated_at) 
       VALUES (?, gen_random_uuid(), ?, ?, ?, ?, true, 0, NOW(), NOW())`,
      nextId, name, description, location, personId
    );

    response.successWithData({ id: nextId });
  }
}