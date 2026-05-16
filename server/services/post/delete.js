import {_req, _db, _val, _user, _header, _exec, _out} from "@netuno/server-types"

const uid = _req.getString("uid");

const dbPost = _db.queryFirst(`
    SELECT post.id, post.parent_id
    FROM post
        INNER JOIN people ON post.people_id = people.id
    WHERE 1 = 1
        AND post.uid = ?::uuid
        AND people.people_user_id = ?::int 
`, uid, _user.id);

if (!dbPost) {
  _header.status(404);
  _exec.stop();
}

const postId = dbPost.getInt("id");

const dbParentPost = _db.get('post', dbPost.getInt('parent_id'));

const result = _db.execute(`
    WITH RECURSIVE post_tree AS (
        SELECT id 
        FROM post 
        WHERE id = ? 
        
        UNION ALL
        
        SELECT post.id 
        FROM post
        JOIN post_tree ON post.parent_id = post_tree.id
    ),
    deleted_likes AS (
        DELETE FROM post_like
        WHERE post_id IN (SELECT id FROM post_tree)
        RETURNING post_id
    )
    DELETE FROM post
    WHERE id IN (SELECT id FROM post_tree);
`, postId)

if (!result) {
  _header.status(400);
  _out.json(
    _val.map()
      .set("error", `post not deleted`)
  );
  _exec.stop();
}

if (dbParentPost) {
  _db.update(
    "post",
    dbParentPost.getInt("id"),
    _val.map()
      .set("comments", dbParentPost.getInt("comments", 0) - 1)
    )
}

_out.json({ result: true })
