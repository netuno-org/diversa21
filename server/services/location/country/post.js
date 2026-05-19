import { _req, _db, _val, _user, _header, _out } from "@netuno/server-types"
// import permissions from "#core/lib/permissions.js";

// Validate incoming data
const name = _req.getString("name");
const code = _req.getString("code");

if (!name) {
    _header.status(400);
    _out.json(
        _val.map()
            .set("error", "name-required")
    );
    _exec.stop();
}

if (!code) {
    _header.status(400);
    _out.json(
        _val.map()
            .set("error", "code-required")
    );
    _exec.stop();
}

// Check for duplicates
const countryExists = _db.queryFirst(`
    SELECT id FROM country
    WHERE LOWER(name) = LOWER(?)
        OR LOWER(code) = LOWER(?)
`, name, code);

if (countryExists) {
    _header.status(409);
    _out.json(
        _val.map()
            .set("error", "country-already-exists")
    );
    _exec.stop();
}

// TODO: Verify permissions
// if (!permissions.canCreateLocation()) {
//     _header.status(403);
//     _out.json(
//         _val.map()
//             .set("error", "permission denied")
//     );
//     _exec.stop();
// }

// Create country
try {
    _db.insert("country",
        _val.map()
            .set("name", name)
            .set("code", code)
    );
} catch (e) {
    _log.warn("error: country not created", e);
    _header.status(400);
    _out.json(
        _val.map()
            .set("error", "country not created")
    );
    _exec.stop();
}


_out.json(
    _val.map()
        .set("result", true)
);