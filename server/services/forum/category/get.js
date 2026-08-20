import { _req, _db, _val } from "@netuno/server-types";

import response from "#core/lib/response.js";

const uid = _req.getUID("uid");

const dbCategory = _db.queryFirst(`
    SELECT uid, name, description
    FROM forum_category
    WHERE uid = ?::uuid
      AND active = true
`, uid);

if (!dbCategory) {
  response.stopWithForumCategoryNotFound();
}

response.successWithData(
  _val.map()
    .set("uid", dbCategory.getUID("uid"))
    .set("name", dbCategory.getString("name"))
    .set("description", dbCategory.getString("description"))
);
