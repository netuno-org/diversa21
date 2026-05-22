import {_req, _val, _header, _exec, _out} from "@netuno/server-types"

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const peopleUid = _req.getUID("uid");

const data = people.getData(peopleUid);

if (!data) {
  response.stopWithUserNotFound();
}

response.successWithData(data);
