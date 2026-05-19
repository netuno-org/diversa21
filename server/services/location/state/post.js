import { _req, _db, _val, _user, _header, _out } from "@netuno/server-types"
import permissions from "#core/lib/permissions.js";

const name = _req.getString("name");
const code = _req.getString("code");
const countryUid = _req.getUID("countryUid");

// Verify country exists
const dbCountry = _db.queryFirst(`
    SELECT id FROM country
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

// Check for duplicates within the same country
const countryId = dbCountry.getInt("id");

const stateExists = _db.queryFirst(`
  SELECT id FROM state
  WHERE country_id = ?
    AND (LOWER(name) = LOWER(?) OR LOWER(code) = LOWER(?))
`, countryId, name, code);

if (stateExists) {
    _header.status(409);
    _out.json(
        _val.map()
            .set("error", "state-already-exists")
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

// Create state
try {
    _db.insert("state",
        _val.map()
            .set("name", name)
            .set("code", code)
            .set("country_id", countryId)
    );
} catch (e) {
    _log.warn("error: state not created", e);
    _header.status(400);
    _out.json(
        _val.map()
            .set("error", "state not created")
    );
    _exec.stop();
}


_out.json(
    _val.map()
        .set("result", true)
);
