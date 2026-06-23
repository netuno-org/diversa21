import { _db, _val, _log } from "@netuno/server-types";

const friends = [
  {
    from_uid: "f0c206fc-923d-40b6-8b2b-6570f698d855", // Test
    to_uid: "2a86a611-2ab1-472d-a7fe-c41c4aeef36b",   // Alice
    request_at: "2026-06-10 10:00:00",
    accepted_at: "2026-06-10 12:00:00"
  },
  {
    from_uid: "f0c206fc-923d-40b6-8b2b-6570f698d855", // Test
    to_uid: "0abd451a-b951-4c95-adc9-96332ad6c772",   // Bob
    request_at: "2026-06-11 09:00:00",
    accepted_at: "2026-06-11 14:00:00"
  },
  {
    from_uid: "f0c206fc-923d-40b6-8b2b-6570f698d855", // Test
    to_uid: "36c8b6a8-eeb7-4477-ade8-f6a8dbceba41",   // Charlie
    request_at: "2026-06-12 08:30:00",
    accepted_at: "2026-06-12 10:00:00"
  },
  {
    from_uid: "f0c206fc-923d-40b6-8b2b-6570f698d855", // Test
    to_uid: "b271af58-2fad-473f-b706-a87bbb60b634",   // Noah
    request_at: "2026-06-13 14:00:00",
    accepted_at: "2026-06-13 15:30:00"
  },
  {
    from_uid: "2a86a611-2ab1-472d-a7fe-c41c4aeef36b", // Alice
    to_uid: "0abd451a-b951-4c95-adc9-96332ad6c772",   // Bob
    request_at: "2026-06-14 09:00:00",
    accepted_at: "2026-06-14 11:00:00"
  },
  {
    from_uid: "36c8b6a8-eeb7-4477-ade8-f6a8dbceba41", // Charlie
    to_uid: "b271af58-2fad-473f-b706-a87bbb60b634",   // Noah
    request_at: "2026-06-15 10:00:00",
    accepted_at: "2026-06-15 12:00:00"
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