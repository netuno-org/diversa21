import {_req, _db, _val, _header, _exec, _out} from "@netuno/server-types"

import people from "#core/lib/people.js";

const onAbort = () => {
  _header.status(404)
  _out.json(
    _val.map()
      .set("error", "not-exist")
  );
  _exec.stop()
};

const username = _req.getString("username");

const dbPeople = people.getByUsername(username);

if (!dbPeople) {
  onAbort();
}

const data = people.getData(dbPeople.getUID("uid"));

if (!data) {
  onAbort();
}

_out.json(
  _val.map()
  .set("result", true)
  .set("data", data)
);
