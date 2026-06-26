import { _req, _db, _val, _user, _out, _group } from "@netuno/server-types"

import response from "#core/lib/response.js";
import people from "#core/lib/people.js";

let page = _req.getInt('page', 1);

const pageSize = 10;

let offset = 0;
if (page > 0) {
  offset = (page - 1) * pageSize;
}

const loggedUser = people.getLogged();

if (_group.code() !== "member") {
  response.stopWithPermissionDenied();
}

const profileUid = _req.getString("uid");
const name = _req.getString("name");
const cityUid = _req.getUID('cityUid');
const stateUid = _req.getUID('stateUid');
const countryUid = _req.getUID('countryUid');

const loggedId = loggedUser.getInt("id");
let targetId = loggedId;

if (profileUid && profileUid !== "") {
  const dbProfile = _db.queryFirst(`
    SELECT id
    FROM people
    WHERE uid = ?::uuid
  `, profileUid);
  if (!dbProfile) {
    response.stopWithUserNotFound();
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
        LEFT JOIN city ON p.city_id = city.id
        LEFT JOIN state ON city.state_id = state.id
        LEFT JOIN country ON state.country_id = country.id
        INNER JOIN netuno_user ON p.people_user_id = netuno_user.id
    WHERE (f.people_id = ? OR f.friend_id = ?)
        AND f.accepted_at IS NOT NULL
        AND p.name ILIKE ?::varchar
`;

if (cityUid) {
  sqlQuery += ` AND city.uid = ?::uuid `;
  params.add(cityUid);
} else if (stateUid) {
  sqlQuery += ` AND state.uid = ?::uuid `;
  params.add(stateUid);
} else if (countryUid) {
  sqlQuery += ` AND country.uid = ?::uuid `;
  params.add(countryUid);
}

sqlQuery += `
    ORDER BY p.name ASC
    LIMIT 10
    OFFSET ?::int
`;

params.add(offset);

const dbFriends = _db.query(sqlQuery, params);

const friends = _val.list();
for (const dbFriend of dbFriends) {
  friends.add(
    people.getData(dbFriend.getUID("friend_uid"))
  );
}

const result = _val.map();

let totalCount = 0;
if (dbFriends.length > 0) {
  totalCount = dbFriends[0].getInt("total_count");
}

result.set("items", friends);
result.set("pagination", _val.map()
  .set("pageSize", pageSize)
  .set("totalCount", totalCount)
);

response.successWithData(result)
