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

if (_group.code() !== "member" && _group.code() !== "management" && _group.code() !== "review" && _group.code() !== "super-admin") {
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

const forMessages = _req.getBoolean("forMessages");

const params = _val.list();

params.add(targetId);

params.add(targetId).add(targetId);

params.add(targetId).add(targetId).add(targetId).add(`%${name}%`);

let sqlQuery = `
    SELECT count(*) over() as total_count,
        p.uid AS "friend_uid", 
        p.name AS "friend_name", 
        netuno_user.user AS "friend_user",
        p.avatar AS "friend_avatar",
        (
            SELECT count(m.id) 
            FROM messages m
            WHERE m.originator_id = p.id 
              AND m.recipient_id = ? 
              AND m.read_at IS NULL
        ) AS unread_messages,
        (
            SELECT MAX(m.sent_at)
            FROM messages m
            WHERE (m.originator_id = p.id AND m.recipient_id = ?)
               OR (m.originator_id = ? AND m.recipient_id = p.id)
        ) AS last_message_at,
        (
            SELECT count(id)
            FROM people_ws_session
            WHERE people_id = p.id
        ) AS sessions
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

if (forMessages) {
  sqlQuery += `
    ORDER BY last_message_at DESC NULLS LAST, p.name ASC
  `;
} else {
  sqlQuery += `
    ORDER BY p.name ASC
  `;
}

sqlQuery += `
    LIMIT 10
    OFFSET ?::int
`;

params.add(offset);

const dbFriends = _db.query(sqlQuery, params);

const friends = _val.list();
for (const dbFriend of dbFriends) {
  const friendData = people.getData(dbFriend.getUID("friend_uid"));
  friendData.set("unread_messages", dbFriend.getInt("unread_messages"));
  friendData.set("online", dbFriend.getInt("sessions") > 0);

  friends.add(friendData);
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

response.successWithData(result);