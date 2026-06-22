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

// Localizar o potencial amigo na base de dados
const dbFriend = _db.queryFirst("SELECT id, name FROM people WHERE uid = ?::uuid", friendUid);
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

// Não permitir adicionar-se a si próprio
if (loggedId === friendId) {
  _header.status(400);
  _out.json(
    _val.map()
      .set("error", "cannot_add_self")
  );
  _exec.stop();
}

// Verificar se já existe uma relação
const dbExisting = _db.queryFirst(`
  SELECT id, people_id, friend_id, accepted_at
  FROM friend
  WHERE (people_id = ? AND friend_id = ?)
     OR (people_id = ? AND friend_id = ?)
`, loggedId, friendId, friendId, loggedId);

if (dbExisting) {
  const acceptedAt = dbExisting.getString("accepted_at");
  if (acceptedAt && acceptedAt !== "") {
    _header.status(400);
    _out.json(
      _val.map()
        .set("error", "already_friends")
    );
    _exec.stop();
  }

  // Se já existe um pedido pendente
  const initiatorId = dbExisting.getInt("people_id");
  if (initiatorId === loggedId) {
    // Fui eu que enviei o pedido e ainda está pendente
    _header.status(400);
    _out.json(
      _val.map()
        .set("error", "request_already_sent")
    );
    _exec.stop();
  } else {
    // A outra pessoa enviou-me o pedido e está pendente de eu aceitar
    _header.status(400);
    _out.json(
      _val.map()
        .set("error", "request_already_received")
    );
    _exec.stop();
  }
}

// Criar um novo pedido de amizade pendente
const currentTimestamp = _db.timestamp();
const requestId = _db.insert("friend", _val.map()
  .set("people_id", loggedId)
  .set("friend_id", friendId)
  .set("request_at", currentTimestamp)
  .set("accepted_at", null)
);

const dbRequest = _db.get("friend", requestId);
_out.json(
  _val.map()
    .set("uid", dbRequest.getString("uid"))
    .set("status", "pending")
);
