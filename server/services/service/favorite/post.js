import { _req, _db, _val, _user } from "@netuno/server-types";

const serviceUid = _req.getString("serviceUid");
const userId = _user.id();

const dbService = _db.queryFirst("SELECT id FROM service WHERE uid = ?::uuid", serviceUid);
const dbPerson = _db.queryFirst("SELECT id FROM people WHERE user_id = ?::int", userId);

if (dbService && dbPerson) {
    const serviceId = dbService.getInt("id");
    const personId = dbPerson.getInt("id");

    const exists = _db.queryFirst(
        "SELECT id FROM service_favorite WHERE service_id = ?::int AND person_id = ?::int", 
        serviceId, personId
    );

    if (!exists) {
        const val = _val.init()
            .set("service_id", serviceId)
            .set("person_id", personId);
        _db.insert("service_favorite", val);
    }

    _out.json(_val.init().set("result", true).set("message", "Favorito adicionado"));
} else {
    _out.json(_val.init().set("result", false).set("error", "Serviço ou utilizador não encontrado."));
}