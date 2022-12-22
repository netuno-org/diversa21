const parent = _req.getString('parent');
let dbParent = _val.map();

if (parent != '') {
    dbParent = _db.get('post', parent);
}

const dbPosts = _db.query(`
    SELECT post.uid, post.moment, post.content, post.comments,
        people.name AS "people_name", people.uid AS "people_uid", 
        people.avatar AS "people_avatar"
    FROM post
        INNER JOIN people ON post.people_id = people.id
    WHERE post.parent_id IS NULL OR post.parent_id = ?::int
    ORDER BY post.moment DESC
`, dbParent.getInt('id', 0));
const posts = _val.list();
for (const dbPost of dbPosts) {
    posts.add(
        _val.map()
            .set("uid", dbPost.getString("uid"))
            .set("moment", dbPost.getString("moment"))
            .set("content", dbPost.getString("content"))
            .set("comments", dbPost.getInt("comments", 0))
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
