import { _req, _db, _val, _user, _out } from "@netuno/server-types"

import response from "#core/lib/response.js";
import people from "#core/lib/people.js";

let page = _req.getInt('page', 1);

const pageSize = 10;

let offset = 0;
if (page > 0) {
  offset = (page - 1) * pageSize;
}

const loggedUser = people.getLogged();
if (!loggedUser) {
  _header.status(403);
  _out.json(
    _val.map()
      .set("error", "forbidden")
  );
  _exec.stop();
}
const profileUid = _req.getString("uid");
const name = _req.getString("name");

const loggedId = loggedUser.getInt("id");
let targetId = loggedId;

if (profileUid && profileUid !== "") {
  const dbProfile = _db.queryFirst("SELECT id FROM people WHERE uid = ?::uuid", profileUid);
  if (!dbProfile) {
    _header.status(404);
    _out.json(
      _val.map()
        .set("error", "not_found")
    );
    _exec.stop();
  }
  targetId = dbProfile.getInt("id");
}

const params = _val.list();
params.add(targetId).add(targetId).add(targetId).add(`%${name}%`);

let sqlQuery = `
    SELECT count(*) over() as total_count,
        p.uid AS "friend_uid", 
        p.name AS "friend_name", 
        netuno_user.user AS "friend_user",
        p.avatar AS "friend_avatar"
    FROM friend f
        INNER JOIN people p ON p.id = (
            CASE 
                WHEN f.people_id = ? THEN f.friend_id
                ELSE f.people_id
            END
        )
        INNER JOIN netuno_user ON p.people_user_id = netuno_user.id
    WHERE (f.people_id = ? OR f.friend_id = ?)
        AND f.accepted_at IS NOT NULL
        AND p.name ILIKE ?::varchar
    ORDER BY p.name ASC
    LIMIT 10
    OFFSET ?::int
`;

params.add(offset);

const dbFriends = _db.query(sqlQuery, params);

const friends = _val.list();
for (const dbFriend of dbFriends) {
  friends.add(
    _val.map()
      .set("uid", dbFriend.getString("friend_uid"))
      .set("name", dbFriend.getString("friend_name"))
      .set("user", dbFriend.getString("friend_user"))
      .set("avatar", dbFriend.getString("friend_avatar") !== "")
  )
}

const result = _val.map();

if (dbFriends.length === 0) {
  result.set("totalCount", 0);
} else {
  result.set("totalCount", dbFriends[0].getInt("total_count"));
}
result.set("items", friends);
result.set("pageSize", pageSize);

response.successWithData(result)