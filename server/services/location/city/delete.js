import { _req, _db, _val, _out, _header, _exec } from "@netuno/server-types";

const uid = _req.getUID("uid");

// Verifies if exists
const dbCity = _db.queryFirst(`
  SELECT id 
  FROM city 
  WHERE uid = ?::uuid
`, uid);

if (!dbCity) {
  _header.status(404);
  _out.json(
    _val.map()
      .set("error", "city-not-found")
  );
  _exec.stop();
}

// Delete city
_db.delete(
  "city",
  dbCity.getInt("id")
);

_out.json(
  _val.map()
    .set("result", true)
);