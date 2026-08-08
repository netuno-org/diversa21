import { _req, _db, _val } from "@netuno/server-types";
import response from "#core/lib/response.js";

const name = _req.getString('name');

const dbCategories = _db.query(`
    SELECT
      uid,
      name,
      description
    FROM service_category
    WHERE active = true
      AND (?::text = '' OR name ILIKE ?::text)
    ORDER BY name ASC
`, name, `%${name}%`);

const categories = _val.list();
for (const dbCategory of dbCategories) {
  categories.add(
    _val.map()
      .set('uid', dbCategory.getUID('uid'))
      .set('name', dbCategory.getString('name'))
      .set('description', dbCategory.getString('description'))
  );
}

response.successWithData(categories);
