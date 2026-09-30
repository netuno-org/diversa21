import { _req, _db, _val, _user, _group } from "@netuno/server-types";
import { SUPER_ADMIN, MANAGEMENT } from "#core/lib/groups.js";
import response from "#core/lib/response.js";

const userId = _user.id();
let personId = null;
const groupCode = _group.code();
let isAdminOrManager = groupCode === SUPER_ADMIN || groupCode === MANAGEMENT;

if (userId) {
  const dbPerson = _db.queryFirst("SELECT id FROM people WHERE people_user_id = ?", userId);
  if (dbPerson) {
    personId = dbPerson.getInt('id');
  }
}

if (!personId && !isAdminOrManager) {
  response.error("Utilizador não autenticado ou sem permissões.");
} else {
  const eventUid = _req.getString('eventUid');

  if (!eventUid) {
    response.error("O identificador do evento é obrigatório.");
  } else {
    const dbEvent = _db.queryFirst("SELECT id, host_id FROM event WHERE uid = ?::uuid AND active = true", eventUid);
    if (!dbEvent) {
      response.error("Evento não encontrado.");
    } else {
      const hostId = dbEvent.getInt('host_id');
      if (!isAdminOrManager && hostId !== personId) {
        response.error("Não tem permissão para eliminar este evento.");
      } else {
        const eventId = dbEvent.getInt('id');
        
        const updateData = _val.map().set("active", false);
        const rowsAffected = _db.update("event", eventId, updateData);

        if (rowsAffected) {
          response.successWithData(_val.map());
        } else {
          response.error("Erro ao inativar o evento.");
        }
      }
    }
  }
}