const content = _req.getString('content')

const dbPeople = _db.queryFirst(`
  SELECT *
  FROM people
  WHERE people_user_id = ?::int
`, _user.id);

const peopleId = dbPeople.getInt('id')

const postId = _db.insert(
    `post`,
    _val.map()
        .set('content', content)
        .set('moment', _db.timestamp())
        .set('people_id', peopleId)
)

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