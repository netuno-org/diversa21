import { _req, _db, _val, _out, _header, _exec, _group } from "@netuno/server-types";
import response from "#core/lib/response.js";
import people from "#core/lib/people.js";

let page = _req.getInt('page', 1);
const name = _req.getString('name');
const pageSize = 10;

let offset = 0;
if (page > 0) {
  offset = (page - 1) * pageSize;
}

const loggedUser = people.getLogged();

const loggedId = loggedUser.getInt("id");

const params = _val.list();
params.add(loggedId).add(`%${name}%`);

const sqlQuery = `
    SELECT count(*) over() as total_count,
        p.uid AS "friend_uid", 
        p.name AS "friend_name", 
        netuno_user.user AS "friend_user",
        p.avatar AS "friend_avatar"
    FROM friend f
        INNER JOIN people p ON p.id = f.people_id
        INNER JOIN netuno_user ON p.people_user_id = netuno_user.id
    WHERE f.friend_id = ?
        AND f.accepted_at IS NULL
        AND p.name ILIKE ?::varchar
    ORDER BY p.name ASC
    LIMIT 10
    OFFSET ?::int
`;

params.add(offset);

const dbRequests = _db.query(sqlQuery, params);

const requests = _val.list();
for (const dbRequest of dbRequests) {
  requests.add(
    people.getData(dbRequest.getUID("friend_uid"))
  );
}

const result = _val.map();

let totalCount = 0;
if (dbRequests.length > 0) {
  totalCount = dbRequests[0].getInt("total_count");
}

result.set("items", requests);
result.set("pagination", _val.map()
  .set("pageSize", pageSize)
  .set("totalCount", totalCount)
);

response.successWithData(result);
