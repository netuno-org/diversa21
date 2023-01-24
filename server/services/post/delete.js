const uid = _req.getString("uid");

const dbPost = _db.queryFirst(`
    SELECT post.id, post.parent_id
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

// TODO: apagar cometários em cascata
_db.delete("post", postId);

const dbParentPost = _db.get('post', dbPost.getInt('parent_id'));

if (dbParentPost) {
    _db.update(
        "post",
        dbParentPost.getInt("id"),
        _val.map()
            .set("comments", dbParentPost.getInt("comments", 0) - 1)
    )
}

_out.json({ result: true })