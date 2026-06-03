import { _req, _db, _val, _out, _header, _exec } from "@netuno/server-types";
import permissions from "#core/lib/permissions.js";

// Verify permissions
if (!permissions.canManageLocations()) {
  _header.status(403);
  _out.json(
    _val.map()
      .set("error", "permission denied")
  );
  _exec.stop();
}

const uid = _req.getUID("uid");
const name = _req.getString("name");
const code = _req.getString("code");
const countryUid = _req.getUID("countryUid");

// Check if exists
const dbState = _db.queryFirst(`
  SELECT id 
  FROM state 
  WHERE uid = ?::uuid
`, uid);

if (!dbState) {
  _header.status(404);
  _out.json(
    _val.map()
      .set("error", "state-not-found")
  );
  _exec.stop();
}

// Check for country
const dbCountry = _db.queryFirst(`
  SELECT id 
  FROM country 
  WHERE uid = ?::uuid
`, countryUid);

if (!dbCountry) {
  _header.status(404);
  _out.json(
    _val.map()
      .set("error", "country-not-found")
  );
  _exec.stop();
}

const countryId = dbCountry.getInt("id");

// Check for duplicates
const duplicateExists = _db.queryFirst(`
  SELECT id FROM state 
  WHERE (name = ?::varchar OR code = ?::varchar)
    AND country_id = ?::int
    AND uid <> ?::uuid
`, name, code, countryId, uid);

if (duplicateExists) {
  _header.status(409);
  _out.json(
    _val.map()
      .set("error", "state-already-exists-in-country")
  );
  _exec.stop();
}

// Update state
_db.update(
  "state",
  dbState.getInt("id"),
  _val.map()
    .set("name", name)
    .set("code", code)
    .set("country_id", countryId)
);

_out.json(
  _val.map()
    .set("result", true)
);