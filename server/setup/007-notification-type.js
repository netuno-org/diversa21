import {_val, _db} from "@netuno/server-types"

const types = [
  {
    uid: "65d750a8-fb4e-4f24-b061-f16e4023d832",
    name: "Post da Instituição",
    code: "institution-post"

  }
];

for (const type of types) {
  _db.insertIfNotExists(
    "notification_type",
    _val.map()
      .set("uid", type.uid)
      .set("name", type.name)
      .set("code", type.code)
  );
};
