import { _req, _db, _val } from "@netuno/server-types";

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

const uid = _req.getUID("uid");
const name = _req.getString("name");
const description = _req.getString("description");

if (!permissions.canManageForumCategories()) {
  response.stopWithPermissionDenied();
}

const dbCategory = _db.queryFirst(`
    SELECT id
    FROM forum_categoria
    WHERE uid = ?::uuid
`, uid);

if (!dbCategory) {
  response.stopWithForumCategoryNotFound();
}

_db.update(
  "forum_categoria",
  dbCategory.getInt("id"),
  _val.map()
    .set("name", name)
    .set("description", description)
    
);

response.successWithoutData();
