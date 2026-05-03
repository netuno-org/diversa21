import {_req, _db, _val, _header, _exec, _out} from "@netuno/server-types"

import people from "#core/lib/people.js";

let peopleUid = _req.getUID("uid");

if (!peopleUid) {
  const dbPeople = people.getLogged();
  peopleUid = dbPeople.getUID("uid");
}

const data = people.getData(peopleUid);

if (!data) {
  _header.status(404)
  _out.json(
    _val.map()
      .set("error", "not-exist")
  );
  _exec.stop()
}

_out.json(
  _val.map()
  .set("result", true)
  .set("data", data)
);
