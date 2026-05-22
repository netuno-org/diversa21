import {_req, _val, _header, _exec, _out} from "@netuno/server-types"

import people from "#core/lib/people.js";
import response from "#core/lib/response.js";

const peopleUid = people.getLogged().getUID("uid");

const data = people.getData(peopleUid);

if (!data) {
  response.stopWithNotExist();
}

response.successWithData(data);
