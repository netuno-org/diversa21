import { _req, _db, _val, _out, _header, _exec } from "@netuno/server-types";

const uid = _req.getUID("uid");

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

// Verifies if theres cities associated
const hasCities = _db.queryFirst(`
    SELECT id 
    FROM city 
    WHERE state_id = ?::int
`, dbState.getInt("id"));

if (hasCities) {
  _header.status(409);
  _out.json(
    _val.map()
      .set("error", "state-has-cities")
  );
  _exec.stop();
}

// Delete state
_db.delete(
  "state",
  dbState.getInt("id")
);

_out.json(
  _val.map()
    .set("result", true)
);