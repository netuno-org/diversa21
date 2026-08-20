import { _req, _db, _val } from "@netuno/server-types";

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

const name = _req.getString("name");
const description = _req.getString("description");

if (!permissions.canManageForumCategories()) {
  response.stopWithPermissionDenied();
}

const categoryId = _db.insert(
  "forum_category",
  _val.map()
    .set("name", name)
    .set("description", description)
);

if (!categoryId) {
  response.stopWithForumCategoryNotCreated();
}

const dbCategory = _db.queryFirst(`
    SELECT uid, name, description
    FROM forum_category
    WHERE id = ?::int
`, categoryId);

response.successWithData(
  _val.map()
    .set("uid", dbCategory.getUID("uid"))
    .set("name", name)
    .set("description", description)
);
