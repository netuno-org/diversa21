import { _db, _val, _req } from "@netuno/server-types";

import response from "#core/lib/response.js";

const name = _req.getString("name");
const page = _req.getInt('page', 1);
const pageSize = _req.getInt('pageSize', 10);

const offset = page > 0 ? (page - 1) * pageSize : 0;;

const dbCategories = _db.query(`
    SELECT
      count(*) over() as total_count,
      c.uid,
      c.name,
      c.description,
      COALESCE(c.topics, 0) AS "topics_count"
    FROM forum_categoria c
    WHERE c.active = true
      AND (?::text = '' OR c.name ILIKE ?::text)
    ORDER BY c.name ASC
    LIMIT ?::int
    OFFSET ?::int
`, name, `%${name}%`, pageSize, offset );

const totalCount = dbCategories.length === 0 ? 0 : dbCategories[0].getInt("total_count")

const categories = _val.list();
for (const dbCategory of dbCategories) {
  categories.add(
    _val.map()
      .set("uid", dbCategory.getUID("uid"))
      .set("name", dbCategory.getString("name"))
      .set("description", dbCategory.getString("description"))
      .set("topicsCount", dbCategory.getInt("topics_count", 0))
  );
}

response.successWithData(
  _val.map()
    .set("items", categories)
    .set("pagination", { pageSize, totalCount })
);
