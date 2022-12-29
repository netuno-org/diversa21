const parent = _req.getString('parent');
let page = _req.getInt('page', 0);

if (page > 0) {
    page *= 2;
}

let dbParent = _val.map();

if (parent != '') {
    dbParent = _db.get('post', parent);
}

const dbPosts = _db.query(`
    SELECT post.uid, post.moment, post.content, post.comments, post.likes,
        people.name AS "people_name", people.uid AS "people_uid",
        people.avatar AS "people_avatar",
        (SELECT id FROM post_like WHERE people_id = ?::int AND post_id = post.id) AS "post_like_id"
    FROM post
        INNER JOIN people ON post.people_id = people.id
    WHERE post.parent_id IS NULL OR post.parent_id = ?::int
    ORDER BY post.moment DESC
    LIMIT 10
    OFFSET ?::int
`, _user.id, dbParent.getInt('id', 0), page);
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
                    .set("avatar", dbPost.getString("people_avatar") != "")
            )
    )
}
_out.json(posts);
