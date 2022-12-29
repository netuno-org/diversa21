const content = _req.getString('content')
const parent = _req.getString('parent')

const dbPeople = _db.queryFirst(`
  SELECT *
  FROM people
  WHERE people_user_id = ?::int
`, _user.id);

let dbParentPost = _val.map()

if (parent != '') {
    dbParentPost = _db.get(`post`, parent)
}
const peopleId = dbPeople.getInt('id')

const postId = _db.insert(
    `post`,
    _val.map()
        .set('content', content)
        .set('moment', _db.timestamp())
        .set('people_id', peopleId)
        .set('parent_id', dbParentPost.getInt('id', 0)) 
        .set('comments', 0)
        .set('likes', 0)
)

if (!dbParentPost.isEmpty()) {
    _db.update(
        "post",
        dbParentPost.getInt("id"),
        _val.map()
            .set("comments", dbParentPost.getInt("comments", 0) + 1)
    )
}

const dbPost = _db.queryFirst(`
    SELECT uid, content, moment
    FROM post 
    WHERE id = ?
`, postId)

const post = _val.map()
    .set("uid", dbPost.getString("uid"))
    .set("content", dbPost.getString("content"))
    .set("moment", dbPost.getString("moment"))
    .set(
        "people",
        _val.map()
            .set("uid", dbPeople.getString("uid"))
            .set("name", dbPeople.getString("name"))
            .set("avatar", dbPeople.getString("avatar") != "")
    )

_out.json(post)