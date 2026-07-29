import { _val, _out } from "@netuno/server-types";

import people from "#core/lib/people.js";
import message from "#core/lib/message.js";
import response from "#core/lib/response.js";

const dbPeopleLogged = people.getLogged();

const data = message.getUnreadTotal(dbPeopleLogged);

response.successWithData(data);
