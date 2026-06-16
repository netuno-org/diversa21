import {_req, _db, _val, _user, _header, _exec, _out} from "@netuno/server-types"

// TODO: import response from "#core/lib/response.js";
import permissions from "#core/lib/permissions.js";

const uid = _req.getString("uid");

const dbPost = _db.queryFirst(`
    SELECT post.id, post.parent_id, people.people_user_id 
    FROM post
        INNER JOIN people ON post.people_id = people.id
    WHERE post.uid = ?::uuid
`, uid);

if (!dbPost) {
  _header.status(404);
  _exec.stop();
}

// if the post is not from the logged user and the logged user is not on the review group 
if (dbPost.getInt("people_user_id") !== _user.id && !permissions.canManagePosts()) {
    _header.status(403);
    _out.json(
      _val.map()
        .set("error", "permission denied")
    );
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

// TODO: response.successWithoutData();
_out.json({ result: true })
