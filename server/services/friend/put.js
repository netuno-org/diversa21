import { _req, _db, _val, _out, _header, _exec } from "@netuno/server-types";
import people from "#core/lib/people.js";

const loggedUser = people.getLogged();
if (!loggedUser) {
  _header.status(403);
  _out.json(
    _val.map()
      .set("error", "forbidden")
  );
  _exec.stop();
}

const uid = _req.getString("uid");
const loggedId = loggedUser.getInt("id");

// Buscar a relação garantindo que existe e que o utilizador logado é o destinatário (friend_id)
const dbFriendship = _db.queryFirst(`
  SELECT f.id, f.accepted_at
  FROM friend f
    INNER JOIN people p ON f.people_id = p.id
  WHERE p.uid = ?::uuid
    AND f.friend_id = ?::int
`, uid, loggedId);

if (!dbFriendship) {
  _header.status(400);
  _out.json(
    _val.map()
      .set("error", "invalid_request")
  );
  _exec.stop();
}

const acceptedAt = dbFriendship.getString("accepted_at");
if (acceptedAt && acceptedAt !== "") {
  _header.status(400);
  _out.json(
    _val.map()
      .set("error", "already_accepted")
  );
  _exec.stop();
}

// Atualizar a amizade com a data e hora atual
const currentTimestamp = _db.timestamp();
_db.update("friend", dbFriendship.getInt("id"), _val.map()
  .set("accepted_at", currentTimestamp)
);

_out.json(
  _val.map()
    .set("result", true)
    .set("status", "accepted")
);
