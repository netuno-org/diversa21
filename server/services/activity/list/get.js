import { _req, _db, _val, _user, _out, _log } from "@netuno/server-types"

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

let sqlQuery = `
    WITH RECURSIVE activity AS (
        SELECT post.id, post.content, post.parent_id
        FROM post
        INNER JOIN people ON post.people_id = people.id
    `;

if (institutionUid) {
  sqlQuery += `
        INNER JOIN institution i ON people.institution_id = i.id
        WHERE post.parent_id != 0
            AND i.uid = ?::uuid
  `;
} else {
  sqlQuery += `
        WHERE post.parent_id != 0
            AND people.uid = ?::uuid
  `;
}

sqlQuery += `
        UNION

        SELECT post.id, post.content, post.parent_id
        FROM post_like
        INNER JOIN post ON post.id = post_like.post_id
        INNER JOIN people ON post_like.people_id = people.id
`;


if (institutionUid) {
  sqlQuery += `
        INNER JOIN institution i ON people.institution_id = i.id
        WHERE i.uid = ?::uuid
  `;
} else {
  sqlQuery += `
        WHERE people.uid = ?::uuid
  `;
}

sqlQuery += `
        UNION

        SELECT p.id, p.content, p.parent_id
        FROM post p
        INNER JOIN activity a ON a.parent_id = p.id
    )

    SELECT count(*) over() as total_count,
        post.uid, post.moment, post.content, post.comments, post.likes,
        people.name AS "people_name", people.uid AS "people_uid",
        netuno_user.user AS "people_user",
        people.avatar AS "people_avatar",
        (SELECT id FROM post_like WHERE people_id = ?::int AND post_id = post.id LIMIT 1) AS "post_like_id"
    FROM post
        INNER JOIN people ON post.people_id = people.id
        INNER JOIN netuno_user ON people.people_user_id = netuno_user.id
        INNER JOIN activity ON activity.id = post.id
    WHERE activity.parent_id = 0
    ORDER BY post.moment DESC
    LIMIT 10
    OFFSET ?::int
`;

let params = _val.list();

if (institutionUid) {
  params
    .add(institutionUid)
    .add(institutionUid)
    .add(loggedUserPeopleId)
    .add(offset);
} else {
  params
    .add(peopleUid)
    .add(peopleUid)
    .add(loggedUserPeopleId)
    .add(offset);
}

const dbPosts = _db.query(sqlQuery, params);

const posts = _val.list();
for (const dbPost of dbPosts) {
  posts.add(
    _val.map()
      .set("uid", dbPost.getString("uid"))
      .set("moment", dbPost.getString("moment"))
      .set("content", dbPost.getString("content"))
      .set("comments", dbPost.getInt("comments", 0))
      .set("liked", dbPost.getInt("post_like_id", 0) > 0)
      .set("likes", dbPost.getInt("likes"))
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
const totalCount = dbPosts.length === 0 ? 0 : dbPosts[0].getInt("total_count");
result.set("items", posts);
result.set("pagination", { pageSize, totalCount });

response.successWithData(result);
