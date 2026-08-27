import {_req, _db, _val, _user, _header, _exec, _out} from "@netuno/server-types"
import permissions from "#core/lib/permissions.js";

// TODO: import response from "#core/lib/response.js";

const uid = _req.getString("uid");
const content = _req.getString("content");

const dbPost = _db.queryFirst(`
    SELECT post.id, people.people_user_id
    FROM post
        INNER JOIN people ON post.people_id = people.id
    WHERE post.uid = ?::uuid
`, uid);

if (!dbPost) {
  _header.status(404);
  _exec.stop();
}

if (dbPost.getInt("people_user_id") !== _user.id && !permissions.canManagePosts()) {
  _header.status(403);
  _out.json(
    _val.map()
      .set("error", "permission denied")
  );
  _exec.stop();
}

const postId = dbPost.getInt("id");

_db.update(
  "post",
  postId,
  _val.map()
    .set("content", content)
);

// TODO: response.successWithoutData();
_out.json({ result: true });
