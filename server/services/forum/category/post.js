import { _req, _db, _val } from "@netuno/server-types";

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

const name = _req.getString("name");

if (!permissions.canManageForumCategories()) {
  response.stopWithPermissionDenied();
}

const categoryId = _db.insert(
  "forum_categoria",
  _val.map()
    .set("name", name)
);

if (!categoryId) {
  response.stopWithForumCategoryNotCreated();
}

const dbCategory = _db.queryFirst(`
    SELECT uid, name
    FROM forum_categoria
    WHERE id = ?::int
`, categoryId);

response.successWithData(
  _val.map()
    .set("uid", dbCategory.getUID("uid"))
    .set("name", dbCategory.getString("name"))
);
