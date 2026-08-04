import { _db, _val } from "@netuno/server-types";

import response from "#core/lib/response.js";

const dbCategories = _db.query(`
    SELECT uid, name
    FROM forum_categoria
    WHERE active = true
    ORDER BY name ASC
`);

const categories = _val.list();
for (const dbCategory of dbCategories) {
  categories.add(
    _val.map()
      .set("uid", dbCategory.getUID("uid"))
      .set("name", dbCategory.getString("name"))
  );
}

response.successWithData(categories);
