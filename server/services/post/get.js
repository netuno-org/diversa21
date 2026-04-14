import {_req, _db, _val, _user, _group, _header, _exec, _out} from "@netuno/server-types"

const peopleUid = _req.getUID("authorUid");

var dbPeople;

_log.debug(`peopleUid: ${peopleUid}`);

if (!peopleUid) {
    _header.status(400)
    _exec.stop();
}

const peopleId = _db.queryFirst(`
    SELECT id
    FROM people 
    WHERE uid = ?::uuid
`, peopleUid).getInt("id");

const dbPosts = _db.query(`
    SELECT post.uid, post.moment, post.content, post.comments, post.likes,
        people.name AS "people_name", people.uid AS "people_uid",
        netuno_user.user AS "people_user",
        people.avatar AS "people_avatar",
        (SELECT id FROM post_like WHERE people_id = ?::int AND post_id = post.id) AS "post_like_id"
    FROM post
        INNER JOIN people ON post.people_id = people.id
        INNER JOIN netuno_user ON people.people_user_id = netuno_user.id
    WHERE 
        people.uid = ?::uuid
    ORDER BY post.moment DESC
    LIMIT 10
    `
, peopleId, peopleUid);
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
_out.json(posts);
