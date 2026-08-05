import { _db, _user, _req, _val, _out } from "@netuno/server-types";
import response from "#core/lib/response.js";
import people from "#core/lib/people.js";

const loggedUser = people.getLogged();
const dbPeople = _db.queryFirst(`
  SELECT * FROM people WHERE people_user_id = ?::int
`, _user.id());

if (!dbPeople) {
  response.stopWithNotExist();
}

const acceptedTermsAt = _db.timestamp();
_db.update(
  "people",
  dbPeople.getInt("id"),
  _val.map().set("accepted_terms_at", acceptedTermsAt)
);

_out.json(
  _val.map()
    .set("result", true)
    .set("acceptedTermsAt", acceptedTermsAt)
);
