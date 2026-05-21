import { _req, _db, _val, _out, _header, _exec } from "@netuno/server-types";

const uid = _req.getUID("uid");
const name = _req.getString("name");
const stateUid = _req.getUID("stateUid");

// Check if exists
const dbCity = _db.queryFirst(`
    SELECT id FROM city WHERE uid = ?::uuid
`, uid);

if (!dbCity) {
    _header.status(404);
    _out.json(_val.map().set("error", "city-not-found"));
    _exec.stop();
}

// Check for state
const dbState = _db.queryFirst(`
    SELECT id FROM state WHERE uid = ?::uuid
`, stateUid);

if (!dbState) {
    _header.status(404);
    _out.json(_val.map().set("error", "state-not-found"));
    _exec.stop();
}

const stateId = dbState.getInt("id");

// Check for duplicates
const duplicateExists = _db.queryFirst(`
    SELECT id FROM city 
    WHERE name = ?::varchar
      AND state_id = ?::int
      AND uid <> ?::uuid
`, name, stateId, uid);

if (duplicateExists) {
    _header.status(409);
    _out.json(_val.map().set("error", "city-already-exists-in-state"));
    _exec.stop();
}

// Update city
_db.update(
    "city",
    dbCity.getInt("id"),
    _val.map()
        .set("name", name)
        .set("state_id", stateId)
);

_out.json(_val.map().set("result", true));