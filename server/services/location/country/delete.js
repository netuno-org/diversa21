import { _req, _db, _val, _out, _header, _exec } from "@netuno/server-types";

const uid = _req.getUID("uid");

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

// Verifies if theres states associated
const hasStates = _db.queryFirst(`
  SELECT id 
  FROM state 
  WHERE country_id = ?::int
`, dbCountry.getInt("id"));

if (hasStates) {
  _header.status(409);
  _out.json(
    _val.map()
      .set("error", "country-has-states")
  );
  _exec.stop();
}

// Delete country
_db.delete(
  "country",
  dbCountry.getInt("id")
);

_out.json(
  _val.map()
    .set("result", true)
);