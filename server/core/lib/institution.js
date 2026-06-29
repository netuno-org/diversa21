import { _db, _val } from "@netuno/server-types";

export const baseQuery = `
  SELECT
    institution.uid,
    institution.name,
    institution.slug,
    institution.description,
    institution.email,
    institution.telephone,
    institution.website,
    institution.address,
    institution.post_code,
    institution.avatar,
    institution.cover_image,
    institution.active,
    city.uid AS "city_uid",
    state.uid AS "state_uid",
    country.uid AS "country_uid",
    city.name AS "city_name",
    state.name AS "state_name",
    country.name AS "country_name"
  FROM institution
  INNER JOIN city ON institution.city_id = city.id
  INNER JOIN state ON city.state_id = state.id
  INNER JOIN country ON state.country_id = country.id
  WHERE 1 = 1
`;

export const mapInstitution = (dbInstitution) =>
  _val.map()
    .set("uid", dbInstitution.getUID("uid"))
    .set("name", dbInstitution.getString("name"))
    .set("slug", dbInstitution.getString("slug"))
    .set("description", dbInstitution.getString("description"))
    .set("email", dbInstitution.getString("email"))
    .set("telephone", dbInstitution.getString("telephone"))
    .set("address", dbInstitution.getString("address"))
    .set("post_code", dbInstitution.getString("post_code"))
    .set("website", dbInstitution.getString("website"))
    .set("avatar", dbInstitution.getString("avatar") !== "")
    .set("cover_image", dbInstitution.getString("cover_image") !== "")
    .set("city", _val.map()
      .set("uid", dbInstitution.getUID("city_uid"))
      .set("name", dbInstitution.getString("city_name")))
    .set("state", _val.map()
      .set("uid", dbInstitution.getUID("state_uid"))
      .set("name", dbInstitution.getString("state_name")))
    .set("country", _val.map()
      .set("uid", dbInstitution.getUID("country_uid"))
      .set("name", dbInstitution.getString("country_name")))
    .set("active", dbInstitution.getBoolean("active"));

export default {
  getByUID: (uid) => {
    const sql = baseQuery + `\nAND institution.uid = ?::uuid`
    const dbInstitution = _db.queryFirst(sql, uid);
    return dbInstitution ? mapInstitution(dbInstitution) : null;
  },

  getBySlug: (slug) => {
    const sql = baseQuery + `\nAND LOWER(institution.slug) = LOWER(?::text)`
    const dbInstitution = _db.queryFirst(sql, slug);
    return dbInstitution ? mapInstitution(dbInstitution) : null;
  }
};
