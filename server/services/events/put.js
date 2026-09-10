import { _req, _db, _val, _user, _group, _image } from "@netuno/server-types";
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
  const name = _req.getString('name');
  const description = _req.getString('description');
  const location = _req.getString('location');
  const cityUid = _req.getString('city');
  const startDate = _req.getString('startDate');
  
  const coverImage = _req.getFile("cover_image");
  const clearCoverImage = _req.getBoolean("clear_cover_image");

  if (!eventUid || !name) {
    response.error("O identificador e o nome do evento são obrigatórios.");
  } else {
    const dbEvent = _db.queryFirst("SELECT id, host_id FROM event WHERE uid = ?::uuid", eventUid);
    if (!dbEvent) {
      response.error("Evento não encontrado.");
    } else {
      const eventId = dbEvent.getInt('id');
      const hostId = dbEvent.getInt('host_id');
      
      if (!isAdminOrManager && hostId !== personId) {
        response.error("Não tem permissão para editar este evento.");
      } else {
        let cityId = null;
        if (cityUid) {
          const dbCity = _db.queryFirst("SELECT id FROM city WHERE uid = ?::uuid", cityUid);
          if (dbCity) {
            cityId = dbCity.getInt('id');
          }
        }

        const data = _val.map()
          .set("name", name)
          .set("description", description)
          .set("location", location)
          .set("city_id", cityId);

        if (startDate) {
            data.set("start_date", startDate);
        } else {
            data.set("start_date", null);
        }

        if (coverImage) {
            data.set(
                "cover_image",
                _image
                    .init(coverImage)
                    .resize(1200, 400)
                    .file(coverImage.name(), "jpeg")
            );
        } 
        else if (clearCoverImage) {
            data.set("cover_image", ""); 
        }

        _db.update("event", eventId, data);
        response.successWithData(_val.map());
      }
    }
  }
}