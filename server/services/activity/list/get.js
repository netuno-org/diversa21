import {_req, _db, _val, _user, _out} from "@netuno/server-types"

import response from "#core/lib/response.js";

const peopleUid = _req.getUID("peopleUid");
let page = _req.getInt('page', 1);

const pageSize = 10;

let offset = 0;
if (page > 0) {
  offset = (page - 1) * pageSize;
}

const loggedUserPeopleId = _db.queryFirst(`
    SELECT id
    FROM people 
    WHERE people_user_id = ?::int
`, _user.id).getInt("id");

const dbPosts = _db.query(`
    WITH RECURSIVE activity AS (

        SELECT post.id, post.content, post.parent_id
        FROM post
        INNER JOIN people
        ON post.people_id = people.id
        WHERE post.parent_id != 0
        AND people.uid = ?::uuid

        UNION

        SELECT post.id, post.content, post.parent_id
        FROM post_like
        INNER JOIN post
        ON post.id = post_like.post_id
        INNER JOIN people
        ON post_like.people_id = people.id
        WHERE people.uid = ?::uuid

        UNION

        SELECT p.id, p.content, p.parent_id
        FROM post p
        INNER JOIN activity a
        ON a.parent_id = p.id
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
`,
peopleUid,
peopleUid,
loggedUserPeopleId,
offset
);

const posts = _val.list();
for (const dbPost of dbPosts) {
  posts.add(
    _val.map()
      .set("uid", dbPost.getString("uid"))
      .set("moment", dbPost.getString("moment"))
      .set("content", dbPost.getString("content"))
      .set("comments", dbPost.getInt("comments", 0))
      .set("liked", dbPost.getInt("post_like_id", 0) > 0)
      .set("likes" ,dbPost.getInt("likes"))
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

if (dbPosts.length === 0) {
  result.set("totalCount", 0);
} else {
  result.set("totalCount", dbPosts[0].getInt("total_count"));
}
result.set("items", posts);
result.set("pageSize", pageSize);

response.successWithData(result);
