import { _req, _db, _val } from "@netuno/server-types"

import response from "#core/lib/response.js";
import people from "#core/lib/people.js";

const institutionUid = _req.getUID("institutionUid");
const peopleUid = _req.getUID("peopleUid");
let page = _req.getInt('page', 1);

const pageSize = 10;
let offset = 0;
if (page > 0) {
  offset = (page - 1) * pageSize;
}

const loggedUserPeopleId = people.getLogged().getInt("id");

let activityQueryParams = _val.list();
activityQueryParams.add(loggedUserPeopleId);

let sqlQuery = `
    SELECT
        count(*) over() as total_count,
        post.id, post.uid, post.moment, post.content, post.comments, post.likes,
        parent.uid AS "parent_uid",
        parent_author.uid AS "parent_people_uid",
        parent_author_user.user AS "parent_people_user",
        people.name AS "people_name", people.uid AS "people_uid",
        netuno_user.user AS "people_user",
        people.avatar AS "people_avatar",
        (SELECT id FROM post_like WHERE people_id = ?::int AND post_id = post.id LIMIT 1) AS "post_like_id",
        'comment' AS "type"
    FROM post
    INNER JOIN post parent ON post.parent_id = parent.id
    INNER JOIN people ON post.people_id = people.id
    INNER JOIN netuno_user ON people.people_user_id = netuno_user.id
    INNER JOIN people parent_author ON parent.people_id = parent_author.id
    INNER JOIN netuno_user parent_author_user ON parent_author.people_user_id = parent_author_user.id
`;

if (institutionUid) {
  sqlQuery += `
        INNER JOIN institution i ON people.institution_id = i.id
        WHERE post.parent_id != 0
            AND i.uid = ?::uuid
  `;
  activityQueryParams.add(institutionUid);
} else {
  sqlQuery += `
        WHERE post.parent_id != 0
            AND people.uid = ?::uuid
  `;
  activityQueryParams.add(peopleUid);
}

sqlQuery += `
    ORDER BY post.moment DESC
    LIMIT ?::int
    OFFSET ?::int
`;

activityQueryParams
  .add(pageSize)
  .add(offset);

const dbActivities = _db.query(sqlQuery, activityQueryParams);

const posts = _val.list();
for (const dbPost of dbActivities) {
  const dbRoot = _db.queryFirst(`
      WITH RECURSIVE rec AS (
          SELECT id, parent_id, uid
          FROM post
          WHERE id = ?::int
          AND parent_id != 0

          UNION

          SELECT post.id, post.parent_id, post.uid
          FROM post
          INNER JOIN rec ON rec.parent_id = post.id
      )

      SELECT uid as root_uid
      FROM rec
      WHERE parent_id = 0
    `,
    dbPost.getInt("id")
  );

  posts.add(
    _val.map()
      .set("uid", dbPost.getString("uid"))
      .set("moment", dbPost.getString("moment"))
      .set("content", dbPost.getString("content"))
      .set("comments", dbPost.getInt("comments", 0))
      .set("liked", dbPost.getInt("post_like_id", 0) > 0)
      .set("likes", dbPost.getInt("likes"))
      .set("type", dbPost.getString("type"))
      .set("rootUid", dbRoot ? dbRoot.getString("root_uid") : '')
      .set("parentUid", dbPost.getString("parent_uid"))
      .set("parentPeopleUser", dbPost.getString("parent_people_user"))
      .set("parentPeopleUid", dbPost.getString("parent_people_uid"))
      .set(
        "people",
        _val.map()
          .set("uid", dbPost.getString("people_uid"))
          .set("name", dbPost.getString("people_name"))
          .set("user", dbPost.getString("people_user"))
          .set("avatar", dbPost.getString("people_avatar") !== "")
      )
  )
}

const result = _val.map();
const totalCount = dbActivities.length === 0 ? 0 : dbActivities[0].getInt("total_count");
result.set("items", posts);
result.set("pagination", { pageSize, totalCount });

response.successWithData(result);
