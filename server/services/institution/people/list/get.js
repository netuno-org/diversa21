import { _out, _req, _val, _db } from "@netuno/server-types";

import people from "#core/lib/people.js";

const uid = _req.getString(`uid`);

const fetchPeople = _db.query(`
SELECT
    p.uid AS uid,
    p.name AS name
FROM people p
JOIN institution inst ON p.institution_id = inst.id
WHERE inst.uid = ?::uuid
`, uid)

const list = _val.list();
fetchPeople.forEach((person) => {
  list.add(people.getData(person.getUID("uid")))
})

_out.json(list);
