import { _req, _db, _val, _out, _header, _exec } from "@netuno/server-types";
import permissions from "#core/lib/permissions.js";

//Verify permissions
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

// Check if exists
const dbCountry = _db.queryFirst(`
  SELECT id 
  FROM country 
  WHERE uid = ?::uuid
`, uid);

if (!dbCountry) {
  _header.status(404);
  _out.json(
    _val.map()
      .set("error", "country-not-found")
  );
  _exec.stop();
}

// Check for duplicates
const duplicateExists = _db.queryFirst(`
  SELECT id FROM country 
  WHERE (name = ?::varchar OR code = ?::varchar)
    AND uid <> ?::uuid
`, name, code, uid);

if (duplicateExists) {
  _header.status(409);
  _out.json(
    _val.map()
      .set("error", "country-already-exists")
  );
  _exec.stop();
}

// Update country 
_db.update(
  "country",
  dbCountry.getInt("id"),
  _val.map()
    .set("name", name)
    .set("code", code)
);

_out.json(
  _val.map()
    .set("result", true)
);