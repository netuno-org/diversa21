import { _req, _db, _val } from "@netuno/server-types";

import permissions from "#core/lib/permissions.js";
import response from "#core/lib/response.js";

const uid = _req.getUID("uid");

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

const dbHasTopics = _db.queryFirst(`
  SELECT EXISTS (
    SELECT 1
    FROM forum_topico
    WHERE forum_category_id = ?::int
  ) AS has_topics
`, dbCategory.getInt("id"));

if (dbHasTopics.getBoolean("has_topics")) {
  response.stopWithBadRequest("forum-category-has-topics");
}
_db.delete("forum_categoria", dbCategory.getInt("id"));
response.successWithoutData();
