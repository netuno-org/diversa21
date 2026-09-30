import { _req, _db, _val, _user, _group, _image, _uid } from "@netuno/server-types";
import { SUPER_ADMIN, MANAGEMENT } from "#core/lib/groups.js";
import response from "#core/lib/response.js";

const userId = _user.id();
let personId = null;
const groupCode = _group.code();
const isAdminOrManager = groupCode === SUPER_ADMIN || groupCode === MANAGEMENT;

if (userId) {
  const dbPerson = _db.queryFirst("SELECT id FROM people WHERE people_user_id = ?", userId);
  if (dbPerson) {
    personId = dbPerson.getInt('id');
  }
}

if (!personId) {
  response.error("Utilizador não autenticado ou sem perfil de pessoa associado.");
} else if (!isAdminOrManager) {
  response.error("Não tem permissão para criar eventos.");
} else {
  const name = _req.getString('name');
  const description = _req.getString('description');
  const location = _req.getString('location');
  const cityUid = _req.getString('city');
  const startDate = _req.getString('startDate');
  const endDate = _req.getString('endDate');
  const coverImage = _req.getFile("cover_image");

  if (!name) {
    response.error("O nome do evento é obrigatório.");
  } else {
    let cityId = null;
    if (cityUid) {
      const dbCity = _db.queryFirst("SELECT id FROM city WHERE uid = ?::uuid", cityUid);
      if (dbCity) {
        cityId = dbCity.getInt('id');
      }
    }

    const data = _val.map()
      .set("uid", _uid.generate())
      .set("name", name)
      .set("description", description)
      .set("location", location)
      .set("city_id", cityId)
      .set("host_id", personId)
      .set("active", true)
      .set("participants_count", 0);

    if (startDate) {
        data.set("start_date", startDate);
    }
    
    if (endDate) {
        data.set("end_date", endDate);
    } else {
        data.set("end_date", null);
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

    const insertResult = _db.insert("event", data);

    if (insertResult) {
        response.successWithData({ id: insertResult });
    } else {
        response.error("Erro ao inserir o evento na base de dados.");
    }
  }
}