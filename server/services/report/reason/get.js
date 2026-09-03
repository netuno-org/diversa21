import { _db, _val } from "@netuno/server-types";
import response from "#core/lib/response.js";

const dbReasons = _db.query(`
  SELECT uid, code, title
  FROM report_reason
  WHERE active = true
  ORDER BY id ASC
`);

const list = _val.list();
for (const reason of dbReasons) {
  list.add(
    _val.map()
      .set("uid", reason.getUID("uid"))
      .set("code", reason.getString("code"))
      .set("title", reason.getString("title"))
  );
}

response.successWithData(list);
