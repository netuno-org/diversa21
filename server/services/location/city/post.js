import { _req, _db, _val, _user, _header, _out } from "@netuno/server-types"
import permissions from "#core/lib/permissions.js";

const name = _req.getString("name");
const stateUid = _req.getUID("stateUid");

// Verify state exists
const dbState = _db.queryFirst(`
  SELECT id FROM state
  WHERE uid = ?::uuid
`, stateUid);

if (!dbState) {
  _header.status(404);
  _out.json(
    _val.map()
      .set("error", "state-not-found")
  );
  _exec.stop();
}

// Check for duplicates within the same country
const stateId = dbState.getInt("id");

const cityExists = _db.queryFirst(`
  SELECT id FROM city
  WHERE state_id = ?
    AND LOWER(name) = LOWER(?)
`, stateId, name);

if (cityExists) {
  _header.status(409);
  _out.json(
    _val.map()
      .set("error", "city-already-exists")
  );
  _exec.stop();
}

if (!permissions.canManageLocations()) {
  _header.status(403);
  _out.json(
    _val.map()
      .set("error", "permission denied")
  );
  _exec.stop();
}

// Create city
try {
  _db.insert("city",
    _val.map()
      .set("name", name)
      .set("state_id", stateId)
  );
} catch (e) {
  _log.warn("error: city not created", e);
  _header.status(400);
  _out.json(
    _val.map()
      .set("error", "city not created")
  );
  _exec.stop();
}


_out.json(
  _val.map()
    .set("result", true)
);
