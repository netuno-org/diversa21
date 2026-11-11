import message from "#core/lib/message.js";
import people from "#core/lib/people.js";
import { _db, _exec, _out, _req, _val } from "@netuno/server-types";

const partnerUid = _req.getString("partner_uid");

const dbLoggedInPeople = people.getLogged();

const dbPartner = _db.queryFirst(`
    SELECT id
    FROM people
    WHERE uid = ${_db.param("uid")}
`, partnerUid)

if (!dbPartner) {
  _out.json(_val.map().set("result", false).set("error", "user-not-found"));
  _exec.stop();
}

const loggedPeopleId = dbLoggedInPeople.getInt("id");
const partnedPeopleId = dbPartner.getInt("id");

_db.execute(`
    DELETE FROM message
    WHERE (originator_id = ${_db.param("int")} AND recipient_id = ${_db.param("int")})
    OR (recipient_id = ${_db.param("int")} AND originator_id = ${_db.param("int")})
  `,
  partnedPeopleId, loggedPeopleId,
  partnedPeopleId, loggedPeopleId);

people.wsSendService(
  dbPartner,
  _val.map()
    .set("service", "message/unread-count")
    .set("content", _val.map().set("total", message.getUnreadTotal(dbPartner)))
);

people.wsSendService(
  dbLoggedInPeople,
  _val.map()
    .set("service", "message/unread-count")
    .set("content", _val.map().set("total", message.getUnreadTotal(dbLoggedInPeople)))
);

_out.json(
  _val.map().set("result", true)
);
