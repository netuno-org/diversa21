import { _db, _val, _log } from "@netuno/server-types";

const friends = [
  {
    from_uid: "e7ab1ade-d464-4602-bd61-f0f7eb7c880e", // Superadmin
    to_uid: "2a86a611-2ab1-472d-a7fe-c41c4aeef36b",   // Alice
    request_at: "2026-06-10 10:00:00",
    accepted_at: "2026-06-10 12:00:00"
  },
  {
    from_uid: "e7ab1ade-d464-4602-bd61-f0f7eb7c880e", // Superadmin
    to_uid: "0abd451a-b951-4c95-adc9-96332ad6c772",   // Bob
    request_at: "2026-06-11 09:00:00",
    accepted_at: "2026-06-11 14:00:00"
  }
];

friends.forEach((friend) => {
  try {
    const dbFrom = _db.queryFirst("SELECT id FROM people WHERE uid = ?::uuid", friend.from_uid);
    const dbTo = _db.queryFirst("SELECT id FROM people WHERE uid = ?::uuid", friend.to_uid);

    if (dbFrom && dbTo) {
      const fromId = dbFrom.getInt("id");
      const toId = dbTo.getInt("id");

      _db.insertIfNotExists("friend", _val.map()
        .set("people_id", fromId)
        .set("friend_id", toId)
        .set("request_at", friend.request_at)
        .set("accepted_at", friend.accepted_at)
      );
      _log.info(`Friendship created between people_id ${fromId} and friend_id ${toId}`);
    }
  } catch (e) {
    _log.warn("error: friend relation not created", e);
  }
});