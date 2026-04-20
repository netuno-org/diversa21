import {_req, _db, _val, _user, _header, _exec, _out} from "@netuno/server-types"

const postUid = _req.getString('uid');
const dbPost = _db.get('post', postUid);

if (!dbPost) {
  _header.status(400);
  _exec.stop();
}

const peopleId = _db.queryFirst(`
  SELECT id
  FROM people 
  WHERE people_user_id = ?::int
`, _user.id).getInt("id");

const deleteResults = _db.execute(`
  DELETE FROM post_like
  WHERE post_id = ?::int
    AND people_id = ?::int
`, dbPost.getInt('id'), peopleId);

if (deleteResults > 0) {
  _db.update(
    'post',
    dbPost.getInt('id'),
    _val.map()
      .set('likes', dbPost.getInt('likes') - 1)
    );
}

_out.json(
    _val.map()
        .set('result', true)
);
