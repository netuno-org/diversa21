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

const friendUid = _req.getString("uid");

// Localizar o amigo pelo seu UID
const dbFriend = _db.queryFirst("SELECT id FROM people WHERE uid = ?::uuid", friendUid);
if (!dbFriend) {
  _header.status(404);
  _out.json(
    _val.map()
      .set("error", "not_found")
  );
  _exec.stop();
}

const loggedId = loggedUser.getInt("id");
const friendId = dbFriend.getInt("id");

// Procurar a relação em qualquer direção (seja ativa ou pendente)
const dbFriendship = _db.queryFirst(`
  SELECT id
  FROM friend
  WHERE (people_id = ? AND friend_id = ?)
     OR (people_id = ? AND friend_id = ?)
`, loggedId, friendId, friendId, loggedId);

if (!dbFriendship) {
  _header.status(400);
  _out.json(
    _val.map()
      .set("error", "invalid_request")
  );
  _exec.stop();
}

// Apagar fisicamente a relação
_db.delete("friend", dbFriendship.getInt("id"));

_out.json(
  _val.map()
    .set("result", true)
);
