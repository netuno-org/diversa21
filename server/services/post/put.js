const uid = _req.getString("uid");
const content = _req.getString("content");

const dbPost = _db.queryFirst(`
    SELECT post.id
    FROM post
        INNER JOIN people ON post.people_id = people.id
    WHERE post.uid = ?::uuid
        AND people.people_user_id = ?::int 
`, uid, _user.id);

if (!dbPost) {
    _header.status(400);
    _exec.stop();
}

const postId = dbPost.getInt("id");

_db.update(
    "post",
    postId,
    _val.map()
        .set("content", content)
);

_out.json({ result: true });
