import { _req, _db, _val, _user, _image } from "@netuno/server-types";
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
  const cityUid = _req.getString('city');
  const startDate = _req.getString('startDate');
  const coverImage = _req.getFile("coverImage");

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
      .set("uid", _db.uuid())
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