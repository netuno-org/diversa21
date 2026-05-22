import {_req, _db, _val, _header, _exec, _out} from "@netuno/server-types"

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const username = _req.getString("username");

const dbPeople = people.getByUsername(username);

if (!dbPeople) {
  response.stopWithUserNotFound();
}

const data = people.getData(dbPeople.getUID("uid"));

if (!data) {
  response.stopWithUserNotFound();
}

response.successWithData(data);
